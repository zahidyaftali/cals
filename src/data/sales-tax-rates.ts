// State sales tax rates for the sales tax calculator.
//
// Source: Tax Foundation, "State and Local Sales Tax Rates, Midyear 2026"
// (rates as of July 1, 2026). The Tax Foundation table rounds to two
// decimals; the four states below it shows as 6.88, 4.23, 6.63 and 4.88
// have statutory rates of 6.875% (MN), 4.225% (MO), 6.625% (NJ) and
// 4.875% (NM), used here.
//
// `avgLocal` is the Tax Foundation's population-weighted average of local
// (city, county and district) rates. It is only a guide: the actual local
// rate depends on the exact address.
//
// Re-check both columns when the Tax Foundation publishes its January and
// July updates, then change `lastVerified`.

export const salesTaxSource = {
  name: 'Tax Foundation, State and Local Sales Tax Rates, Midyear 2026',
  url: 'https://taxfoundation.org/data/all/state/2026-sales-tax-rates-midyear/',
  ratesAsOf: '2026-07-01',
  lastVerified: '2026-09-28',
};

export interface StateRate {
  code: string;
  name: string;
  /** State rate in percent. */
  rate: number;
  /** Average local rate in percent. */
  avgLocal: number;
  note?: string;
}

export const stateRates: StateRate[] = [
  { code: 'AL', name: 'Alabama', rate: 4, avgLocal: 5.46 },
  { code: 'AK', name: 'Alaska', rate: 0, avgLocal: 1.82, note: 'Alaska has no state sales tax, but many boroughs and cities charge their own.' },
  { code: 'AZ', name: 'Arizona', rate: 5.6, avgLocal: 2.94 },
  { code: 'AR', name: 'Arkansas', rate: 6.5, avgLocal: 2.98 },
  { code: 'CA', name: 'California', rate: 7.25, avgLocal: 1.78, note: 'California’s 7.25% includes a 1.25% local tax charged statewide.' },
  { code: 'CO', name: 'Colorado', rate: 2.9, avgLocal: 4.99 },
  { code: 'CT', name: 'Connecticut', rate: 6.35, avgLocal: 0 },
  { code: 'DE', name: 'Delaware', rate: 0, avgLocal: 0, note: 'Delaware has no state or local sales tax.' },
  { code: 'DC', name: 'District of Columbia', rate: 6, avgLocal: 0 },
  { code: 'FL', name: 'Florida', rate: 6, avgLocal: 0.98 },
  { code: 'GA', name: 'Georgia', rate: 4, avgLocal: 3.56 },
  { code: 'HI', name: 'Hawaii', rate: 4, avgLocal: 0.5, note: 'Hawaii’s general excise tax is charged to businesses, which often pass it on at a slightly higher rate.' },
  { code: 'ID', name: 'Idaho', rate: 6, avgLocal: 0.03 },
  { code: 'IL', name: 'Illinois', rate: 6.25, avgLocal: 2.73 },
  { code: 'IN', name: 'Indiana', rate: 7, avgLocal: 0 },
  { code: 'IA', name: 'Iowa', rate: 6, avgLocal: 0.94 },
  { code: 'KS', name: 'Kansas', rate: 6.5, avgLocal: 2.21 },
  { code: 'KY', name: 'Kentucky', rate: 6, avgLocal: 0 },
  { code: 'LA', name: 'Louisiana', rate: 5, avgLocal: 5.13 },
  { code: 'ME', name: 'Maine', rate: 5.5, avgLocal: 0 },
  { code: 'MD', name: 'Maryland', rate: 6, avgLocal: 0 },
  { code: 'MA', name: 'Massachusetts', rate: 6.25, avgLocal: 0 },
  { code: 'MI', name: 'Michigan', rate: 6, avgLocal: 0 },
  { code: 'MN', name: 'Minnesota', rate: 6.875, avgLocal: 1.26 },
  { code: 'MS', name: 'Mississippi', rate: 7, avgLocal: 0.06 },
  { code: 'MO', name: 'Missouri', rate: 4.225, avgLocal: 4.22 },
  { code: 'MT', name: 'Montana', rate: 0, avgLocal: 0, note: 'Montana has no general sales tax, though some resort areas charge a local resort tax.' },
  { code: 'NE', name: 'Nebraska', rate: 5.5, avgLocal: 1.48 },
  { code: 'NV', name: 'Nevada', rate: 6.85, avgLocal: 1.39 },
  { code: 'NH', name: 'New Hampshire', rate: 0, avgLocal: 0, note: 'New Hampshire has no general sales tax.' },
  { code: 'NJ', name: 'New Jersey', rate: 6.625, avgLocal: 0 },
  { code: 'NM', name: 'New Mexico', rate: 4.875, avgLocal: 2.8, note: 'New Mexico’s gross receipts tax is charged to businesses and usually passed on to buyers.' },
  { code: 'NY', name: 'New York', rate: 4, avgLocal: 4.54 },
  { code: 'NC', name: 'North Carolina', rate: 4.75, avgLocal: 2.35 },
  { code: 'ND', name: 'North Dakota', rate: 5, avgLocal: 2.09 },
  { code: 'OH', name: 'Ohio', rate: 5.75, avgLocal: 1.54 },
  { code: 'OK', name: 'Oklahoma', rate: 4.5, avgLocal: 4.56 },
  { code: 'OR', name: 'Oregon', rate: 0, avgLocal: 0, note: 'Oregon has no state or local sales tax.' },
  { code: 'PA', name: 'Pennsylvania', rate: 6, avgLocal: 0.34 },
  { code: 'RI', name: 'Rhode Island', rate: 7, avgLocal: 0 },
  { code: 'SC', name: 'South Carolina', rate: 6, avgLocal: 1.49 },
  { code: 'SD', name: 'South Dakota', rate: 4.2, avgLocal: 1.91 },
  { code: 'TN', name: 'Tennessee', rate: 7, avgLocal: 2.61 },
  { code: 'TX', name: 'Texas', rate: 6.25, avgLocal: 1.95 },
  { code: 'UT', name: 'Utah', rate: 6.1, avgLocal: 1.32, note: 'Utah’s 6.1% includes local taxes charged statewide.' },
  { code: 'VT', name: 'Vermont', rate: 6, avgLocal: 0.43 },
  { code: 'VA', name: 'Virginia', rate: 5.3, avgLocal: 0.47, note: 'Virginia’s 5.3% includes a 1% local tax charged statewide.' },
  { code: 'WA', name: 'Washington', rate: 6.5, avgLocal: 3.07 },
  { code: 'WV', name: 'West Virginia', rate: 6, avgLocal: 0.6 },
  { code: 'WI', name: 'Wisconsin', rate: 5, avgLocal: 0.72 },
  { code: 'WY', name: 'Wyoming', rate: 4, avgLocal: 1.39 },
];
