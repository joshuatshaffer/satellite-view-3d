export function parseCosparIdFromTle(line1: string) {
  const yy = parseInt(line1.slice(9, 11));
  const launchNumberOfYear = line1.slice(11, 14);
  const pieceOfLaunch = line1.slice(14, 17).trim();

  // The first satellite was launched in 1957. We can use this to disambiguate
  // two digit years from TLE data until 2057.
  const launchYear = (yy < 57 ? 2000 : 1900) + yy;

  return `${launchYear}-${launchNumberOfYear}${pieceOfLaunch}`;
}
