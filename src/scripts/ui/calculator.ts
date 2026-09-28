// Shared behaviour for every calculator page. A page calls setupCalculator()
// with an `update` function that reads the inputs through a Reader, renders
// its results and returns what to announce and copy (or null when the inputs
// aren't complete). This module handles the rest: live updates as you type,
// the Calculate / Reset / Copy buttons, field errors, mode tabs, unit menus,
// the remembered imperial/metric choice, preset and "Today" buttons.

export interface CalcOutput {
  /** Short sentence for screen readers, e.g. "Total: 40 hours". */
  announce: string;
  /** Plain text for the Copy result button. */
  copy: string;
}

type Update = (read: Reader) => CalcOutput | null;

interface NumberRules {
  /** Noun phrase used in messages, e.g. "the bill amount". */
  label: string;
  min?: number;
  /** When true, the value must be greater than `min` (not equal). */
  above?: boolean;
  max?: number;
  integer?: boolean;
  optional?: boolean;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function setFieldError(input: HTMLElement, message: string) {
  const el = document.getElementById(`${input.id}-error`);
  if (el) {
    el.textContent = message;
    el.hidden = !message;
  }
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
}

/** Reads and validates form values, collecting problems as it goes. */
export class Reader {
  private problems = 0;

  constructor(
    readonly form: HTMLFormElement,
    /** Strict mode (Calculate pressed) also flags empty required fields. */
    private strict: boolean,
  ) {}

  get ok() {
    return this.problems === 0;
  }

  /** True when the visitor pressed Calculate (show "required" errors). */
  get isStrict() {
    return this.strict;
  }

  /** Flags a problem found by the page itself (e.g. a cross-field check). */
  fail(input?: HTMLElement | string, message = '') {
    this.problems++;
    const el = typeof input === 'string' ? this.input(input) : input;
    if (el && message) setFieldError(el, message);
  }

  input(name: string): HTMLInputElement {
    const el = this.form.querySelector<HTMLInputElement>(`[name="${name}"]`);
    if (!el) throw new Error(`No field named ${name}`);
    return el;
  }

  private missing(el: HTMLElement, label: string, optional?: boolean): null {
    if (optional) {
      setFieldError(el, '');
      return null;
    }
    this.problems++;
    setFieldError(el, this.strict ? `Enter ${label}.` : '');
    return null;
  }

  /** Accepts "1,250.50", "$40" or " 12 ". Returns null if empty (optional) or invalid. */
  number(name: string, rules: NumberRules): number | null {
    const el = this.input(name);
    const raw = el.value.trim().replace(/[,\s]/g, '').replace(/^[$£€]/, '').replace(/%$/, '');
    if (raw === '') return this.missing(el, rules.label, rules.optional);

    const n = Number(raw);
    const Label = capitalize(rules.label);
    let message = '';
    if (!Number.isFinite(n)) message = `${Label} must be a number, like 12.5.`;
    else if (rules.integer && !Number.isInteger(n)) message = `${Label} must be a whole number.`;
    else if (rules.min !== undefined && rules.above && n <= rules.min) message = `${Label} must be more than ${rules.min}.`;
    else if (rules.min !== undefined && !rules.above && n < rules.min) message = `${Label} can't be less than ${rules.min}.`;
    else if (rules.max !== undefined && n > rules.max) message = `${Label} can't be more than ${rules.max.toLocaleString('en-US')}.`;

    setFieldError(el, message);
    if (message) {
      this.problems++;
      return null;
    }
    return n;
  }

  /** Like number(), but an empty field counts as 0 (for optional amounts). */
  amount(name: string, rules: NumberRules): number {
    return this.number(name, { ...rules, optional: true }) ?? 0;
  }

  /** Value of an <input type="date"> as "YYYY-MM-DD", checked against optional limits. */
  date(name: string, rules: { label: string; optional?: boolean; min?: string; max?: string }): string | null {
    const el = this.input(name);
    const v = el.value;
    if (!v) {
      // A partly typed date reports an empty value but a "bad input" flag.
      if (el.validity?.badInput) {
        this.problems++;
        setFieldError(el, `${capitalize(rules.label)} isn't a complete date.`);
        return null;
      }
      return this.missing(el, rules.label, rules.optional);
    }
    let message = '';
    if (rules.min && v < rules.min) message = `${capitalize(rules.label)} must be on or after ${formatISO(rules.min)}.`;
    if (rules.max && v > rules.max) message = `${capitalize(rules.label)} must be on or before ${formatISO(rules.max)}.`;
    setFieldError(el, message);
    if (message) {
      this.problems++;
      return null;
    }
    return v;
  }

  /** Value of an <input type="time"> as seconds after midnight. */
  time(name: string, rules: { label: string; optional?: boolean }): number | null {
    const el = this.input(name);
    const match = /^(\d{2}):(\d{2})(?::(\d{2}))?/.exec(el.value);
    if (!match) {
      if (el.validity?.badInput) {
        this.problems++;
        setFieldError(el, `${capitalize(rules.label)} isn't a complete time.`);
        return null;
      }
      return this.missing(el, rules.label, rules.optional);
    }
    setFieldError(el, '');
    return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3] ?? 0);
  }

  /** Checked radio value, or a <select>'s value. */
  choice(name: string): string {
    const checked = this.form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
    if (checked) return checked.value;
    const select = this.form.querySelector<HTMLSelectElement>(`select[name="${name}"]`);
    return select?.value ?? '';
  }

  /** The unit chosen in a measurement field's unit menu. */
  unit(name: string): string {
    return this.choice(`${name}_unit`);
  }

  checked(name: string): boolean {
    return this.input(name).checked;
  }

  text(name: string): string {
    return this.input(name).value.trim();
  }
}

const isoFormat = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
function formatISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(0);
  t.setUTCFullYear(y, m - 1, d);
  return isoFormat.format(t);
}

// ── Rendering helpers ────────────────────────────────────────

/** Sets the text of every [data-out="name"] element on the page. */
export function out(name: string, text: string) {
  for (const el of document.querySelectorAll(`[data-out="${name}"]`)) el.textContent = text;
}

/** Shows or hides every element matching the selector. */
export function toggle(selector: string, show: boolean) {
  for (const el of document.querySelectorAll<HTMLElement>(selector)) el.hidden = !show;
}

/** Fills a <dl data-rows="name"> with label/value pairs. */
export function rows(name: string, items: [string, string][]) {
  const dl = document.querySelector(`[data-rows="${name}"]`);
  if (!dl) return;
  dl.replaceChildren(
    ...items.map(([label, value]) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = label;
      dd.textContent = value;
      row.append(dt, dd);
      return row;
    }),
  );
}

/**
 * Fills a <tbody data-table="name"> with rows of cells. Columns listed in
 * `optional` are hidden on phones (mark the matching <th> with class "col-optional").
 */
export function table(name: string, body: string[][], highlightRow?: number, optional: number[] = []) {
  const tbody = document.querySelector(`[data-table="${name}"]`);
  if (!tbody) return;
  tbody.replaceChildren(
    ...body.map((cells, i) => {
      const tr = document.createElement('tr');
      if (i === highlightRow) tr.className = 'is-current';
      cells.forEach((cell, col) => {
        const td = document.createElement('td');
        td.textContent = cell;
        if (optional.includes(col)) td.className = 'col-optional';
        tr.append(td);
      });
      return tr;
    }),
  );
}

/** A working step: plain text, or [explanation, formula with numbers]. */
export type Step = string | [string, string];

/** Fills the "How it's worked out" list with the user's numbers in the formula. */
export function steps(items: Step[], name = 'steps') {
  const ol = document.querySelector(`[data-steps="${name}"]`);
  if (!ol) return;
  ol.replaceChildren(
    ...items.map((item) => {
      const li = document.createElement('li');
      if (typeof item === 'string') {
        li.textContent = item;
      } else {
        const text = document.createElement('span');
        text.textContent = item[0];
        const math = document.createElement('span');
        math.className = 'math';
        math.textContent = item[1];
        li.append(text, math);
      }
      return li;
    }),
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers, or clipboard permission denied: fall back to a hidden textarea.
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

// ── Modes (tabs) ─────────────────────────────────────────────

/** Shows elements whose data-mode list includes the current mode. */
function syncModes(form: HTMLFormElement) {
  const mode = form.querySelector<HTMLInputElement>('input[name="mode"]:checked')?.value;
  if (!mode) return;
  for (const el of document.querySelectorAll<HTMLElement>('[data-mode]')) {
    el.hidden = !el.dataset.mode!.split(' ').includes(mode);
  }
}

// ── Units (imperial / metric) ────────────────────────────────

const UNITS_KEY = 'ic.units';

function storedUnits(): string | null {
  try {
    return localStorage.getItem(UNITS_KEY);
  } catch {
    return null;
  }
}

type System = 'imperial' | 'metric';

/**
 * Switches every unit menu and label to a unit system, and replaces example
 * values the visitor hasn't changed with the example for the new system.
 */
function applyUnits(form: HTMLFormElement, system: System, previous: System | null) {
  const key = system === 'metric' ? 'Metric' : 'Imperial';
  for (const select of form.querySelectorAll<HTMLSelectElement>('select[data-unit-imperial]')) {
    const next = select.dataset[`unit${key}`];
    if (next) select.value = next;
  }
  for (const el of form.querySelectorAll<HTMLElement>('[data-imperial][data-metric]')) {
    el.textContent = el.dataset[system] ?? el.textContent;
  }
  for (const input of form.querySelectorAll<HTMLInputElement>('[data-default-imperial][data-default-metric]')) {
    const next = input.dataset[`default${key}`] ?? '';
    const before = previous ? input.dataset[previous === 'metric' ? 'defaultMetric' : 'defaultImperial'] : undefined;
    if (previous === null || input.value === before) input.value = next;
  }
}

// ── Setup ───────────────────────────────────────────────────

export interface SetupOptions {
  /** Called after Reset has restored the defaults. */
  onReset?: () => void;
  /** Called once before the first calculation (e.g. to fill in today's date). */
  onInit?: (form: HTMLFormElement) => void;
}

export function setupCalculator(update: Update, options: SetupOptions = {}) {
  const form = document.getElementById('calc') as HTMLFormElement | null;
  if (!form) return;
  const panel = document.querySelector<HTMLElement>('[data-result]');
  const copyButton = panel?.querySelector<HTMLButtonElement>('[data-copy]');
  const announcer = panel?.querySelector<HTMLElement>('[data-announce]');
  const unitRadios = [...form.querySelectorAll<HTMLInputElement>('input[name="units"]')];

  let last: CalcOutput | null = null;
  let announceTimer: number | undefined;

  function syncPresets() {
    for (const button of form!.querySelectorAll<HTMLButtonElement>('[data-set]')) {
      const input = form!.querySelector<HTMLInputElement>(`[name="${button.dataset.set}"]`);
      button.setAttribute('aria-pressed', String(!!input && input.value.trim() === button.dataset.value));
    }
  }

  function run(strict = false) {
    syncModes(form!);
    syncPresets();
    const reader = new Reader(form!, strict);
    let result: CalcOutput | null = null;
    try {
      result = update(reader);
    } catch (error) {
      console.error(error);
      result = null;
    }
    if (!reader.ok) result = null;
    last = result;
    if (panel) panel.dataset.state = result ? 'ok' : 'empty';
    if (copyButton) copyButton.disabled = !result;

    window.clearTimeout(announceTimer);
    if (announcer && result) {
      // Wait for a pause in typing so screen readers aren't flooded.
      announceTimer = window.setTimeout(() => (announcer.textContent = result!.announce), strict ? 0 : 900);
    }
    return result;
  }

  // Remembered unit system. The HTML default is imperial.
  let units: System | null = null;
  if (unitRadios.length) {
    const htmlDefault = (unitRadios.find((r) => r.defaultChecked)?.value ?? 'imperial') as System;
    const saved = storedUnits();
    const match = unitRadios.find((r) => r.value === saved);
    if (match) match.checked = true;
    units = (unitRadios.find((r) => r.checked)?.value ?? htmlDefault) as System;
    applyUnits(form, units, htmlDefault);
    for (const radio of unitRadios) {
      radio.addEventListener('change', () => {
        if (!radio.checked) return;
        const next = radio.value as System;
        applyUnits(form, next, units);
        units = next;
        try {
          localStorage.setItem(UNITS_KEY, next);
        } catch {
          // Storage unavailable: the choice lasts for this visit only.
        }
      });
    }
  }

  // Preset buttons (e.g. tip 15% / 18% / 20%) and "Today" buttons.
  form.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-set], button[data-today]');
    if (!target) return;
    const name = target.dataset.set ?? target.dataset.today!;
    const input = form.querySelector<HTMLInputElement>(`[name="${name}"]`);
    if (!input) return;
    input.value = target.dataset.today ? todayISO() : target.dataset.value ?? '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      run(false);
    });
  };
  form.addEventListener('input', schedule);
  form.addEventListener('change', schedule);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const result = run(true);
    if (!result) {
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    if (panel) {
      const rect = panel.getBoundingClientRect();
      if (rect.top < 0 || rect.top > window.innerHeight - 160) {
        const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
        panel.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
      }
    }
  });

  form.addEventListener('reset', () => {
    // Let the browser restore the default values first.
    setTimeout(() => {
      for (const el of form.querySelectorAll<HTMLElement>('[aria-invalid]')) setFieldError(el, '');
      if (unitRadios.length && units) {
        const keep = unitRadios.find((r) => r.value === units);
        if (keep) keep.checked = true;
        applyUnits(form, units, 'imperial');
      }
      options.onReset?.();
      run(false);
    });
  });

  copyButton?.addEventListener('click', async () => {
    if (!last) return;
    const label = copyButton.textContent;
    const ok = await copyText(last.copy);
    copyButton.textContent = ok ? 'Copied' : 'Copy failed';
    if (announcer) announcer.textContent = ok ? 'Result copied' : 'Could not copy the result';
    window.setTimeout(() => (copyButton.textContent = label), 2000);
  });

  options.onInit?.(form);
  run(false);
  return { run };
}

/** Today's date in the visitor's time zone as "YYYY-MM-DD". */
export function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Sets a field's value and makes it the value Reset returns to (used for
 * defaults that depend on today's date).
 */
export function setDefault(form: HTMLFormElement, name: string, value: string) {
  const input = form.querySelector<HTMLInputElement>(`[name="${name}"]`);
  if (!input) return;
  input.defaultValue = value;
  input.value = value;
}
