// IRS standard business mileage rates (USD per mile). The rate for a year
// that isn't listed defaults to the latest one, and every trip's rate can be
// edited, so a new year's rate only needs adding here once the IRS publishes it.
export const IRS_MILEAGE_RATES: Record<number, number> = {
  2023: 0.655,
  2024: 0.67,
  2025: 0.7,
};

export function defaultMileageRate(year: number): number {
  if (IRS_MILEAGE_RATES[year]) return IRS_MILEAGE_RATES[year];
  const known = Object.keys(IRS_MILEAGE_RATES).map(Number).sort((a, b) => a - b);
  const latest = known.filter((y) => y <= year).pop() ?? known[known.length - 1];
  return IRS_MILEAGE_RATES[latest];
}
