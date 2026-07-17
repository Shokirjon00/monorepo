export function parseDateFormat(date: string): string {
  const [sday, smonth, syear] = date.split('.');
  return `${syear}-${smonth}-${sday}`
}
