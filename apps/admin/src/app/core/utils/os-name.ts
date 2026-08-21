export function getOSName(): string {
  let name = 'Unknown OS';
  if (navigator.userAgent.indexOf('Win') !== -1) {
    name = 'Windows OS';
  }
  if (navigator.userAgent.indexOf('Mac') !== -1) {
    name = 'Macintosh';
  }
  if (navigator.userAgent.indexOf('Linux') !== -1) {
    name = 'Linux OS';
  }
  if (navigator.userAgent.indexOf('Android') !== -1) {
    name = 'Android OS';
  }
  if (navigator.userAgent.indexOf('like Mac') !== -1) {
    name = 'iOS';
  }

  return name;
}
