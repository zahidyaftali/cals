// Small inline-SVG charts built with the DOM (no chart library). Charts are
// decorative (aria-hidden): the same numbers always appear as text beside them.

const NS = 'http://www.w3.org/2000/svg';

function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

export type Tone = 'primary' | 'accent' | 'muted';

export interface Segment {
  label: string;
  value: number;
  /** Text shown in the legend, e.g. "$16.80". */
  text: string;
  tone: Tone;
}

/** One horizontal bar split into proportional segments, with a legend below. */
export function stackedBar(container: HTMLElement | null, segments: Segment[]) {
  if (!container) return;
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const bar = svg('svg', { class: 'chart-stack', viewBox: '0 0 100 12', preserveAspectRatio: 'none', 'aria-hidden': 'true' });
  let x = 0;
  for (const s of segments) {
    const width = total > 0 ? (Math.max(0, s.value) / total) * 100 : 0;
    if (width <= 0) continue;
    bar.append(svg('rect', { x, y: 0, width, height: 12, class: `tone-${s.tone}` }));
    x += width;
  }
  const legend = document.createElement('ul');
  legend.className = 'chart-legend';
  legend.setAttribute('aria-hidden', 'true');
  for (const s of segments) {
    const li = document.createElement('li');
    const swatch = document.createElement('span');
    swatch.className = `swatch tone-${s.tone}`;
    const label = document.createElement('span');
    label.textContent = s.label;
    const value = document.createElement('strong');
    value.textContent = s.text;
    li.append(swatch, label, value);
    legend.append(li);
  }
  container.replaceChildren(bar, legend);
}

export interface Bar {
  label: string;
  value: number;
  text: string;
  tone?: Tone;
}

/**
 * Rows of labelled horizontal bars scaled to the largest value, with an optional
 * marker line (e.g. a threshold) drawn at `marker.value`.
 */
export function barRows(container: HTMLElement | null, bars: Bar[], marker?: { value: number; label: string }) {
  if (!container) return;
  const max = Math.max(...bars.map((b) => b.value), marker?.value ?? 0, 0);
  const list = document.createElement('ul');
  list.className = 'chart-bars';
  list.setAttribute('aria-hidden', 'true');
  for (const b of bars) {
    const li = document.createElement('li');
    const head = document.createElement('div');
    head.className = 'chart-bar-head';
    const label = document.createElement('span');
    label.textContent = b.label;
    const value = document.createElement('strong');
    value.textContent = b.text;
    head.append(label, value);

    const track = svg('svg', { viewBox: '0 0 100 8', preserveAspectRatio: 'none', class: 'chart-track' });
    track.append(svg('rect', { x: 0, y: 0, width: 100, height: 8, class: 'tone-track' }));
    const width = max > 0 ? (Math.max(0, b.value) / max) * 100 : 0;
    if (width > 0) track.append(svg('rect', { x: 0, y: 0, width, height: 8, class: `tone-${b.tone ?? 'primary'}` }));
    if (marker && max > 0) {
      const mx = (marker.value / max) * 100;
      track.append(svg('rect', { x: Math.min(99.4, mx), y: 0, width: 0.6, height: 8, class: 'tone-marker' }));
    }
    li.append(head, track);
    list.append(li);
  }
  const nodes: Node[] = [list];
  if (marker) {
    const note = document.createElement('p');
    note.className = 'chart-note';
    note.setAttribute('aria-hidden', 'true');
    note.textContent = marker.label;
    nodes.push(note);
  }
  container.replaceChildren(...nodes);
}

/**
 * A straight-line chart for relationships like "course grade vs final exam score":
 * the line runs from (0, y0) to (100, y100), with a horizontal target line and a
 * marker where they meet. Axis values are percentages (0–100 on both axes, the
 * y-axis extends if the line goes higher).
 */
export function lineChart(
  container: HTMLElement | null,
  opts: { y0: number; y100: number; target: number; xLabel: string; yLabel: string; point?: number },
) {
  if (!container) return;
  const W = 320;
  const H = 180;
  const pad = { l: 34, r: 10, t: 10, b: 30 };
  const yMax = Math.max(100, Math.ceil(Math.max(opts.y100, opts.target) / 10) * 10);
  const x = (v: number) => pad.l + (v / 100) * (W - pad.l - pad.r);
  const y = (v: number) => H - pad.b - (v / yMax) * (H - pad.t - pad.b);

  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart-line', 'aria-hidden': 'true' });
  for (let v = 0; v <= yMax; v += yMax > 100 ? 20 : 25) {
    root.append(svg('line', { x1: pad.l, x2: W - pad.r, y1: y(v), y2: y(v), class: 'grid' }));
    const t = svg('text', { x: pad.l - 6, y: y(v) + 3.5, 'text-anchor': 'end', class: 'tick' });
    t.textContent = String(v);
    root.append(t);
  }
  for (const v of [0, 25, 50, 75, 100]) {
    const t = svg('text', { x: x(v), y: H - pad.b + 14, 'text-anchor': 'middle', class: 'tick' });
    t.textContent = String(v);
    root.append(t);
  }
  const xl = svg('text', { x: (pad.l + W - pad.r) / 2, y: H - 4, 'text-anchor': 'middle', class: 'axis' });
  xl.textContent = opts.xLabel;
  root.append(xl);

  root.append(svg('line', { x1: pad.l, x2: W - pad.r, y1: y(opts.target), y2: y(opts.target), class: 'target' }));
  root.append(svg('line', { x1: x(0), y1: y(opts.y0), x2: x(100), y2: y(opts.y100), class: 'series' }));
  if (opts.point !== undefined && opts.point >= 0 && opts.point <= 100) {
    root.append(svg('circle', { cx: x(opts.point), cy: y(opts.target), r: 4.5, class: 'point' }));
  }
  container.replaceChildren(root);
}
