export function getDeviceName(userAgent?: string): string {
  if (!userAgent) return "Unknown device";

  let browser = "Unknown browser";
  let operatingSystem = "Unknown OS";

  if (/Edg\//i.test(userAgent)) {
    browser = "Microsoft Edge";
  } else if (/OPR\//i.test(userAgent)) {
    browser = "Opera";
  } else if (/Chrome\//i.test(userAgent)) {
    browser = "Chrome";
  } else if (/Firefox\//i.test(userAgent)) {
    browser = "Firefox";
  } else if (/Safari\//i.test(userAgent)) {
    browser = "Safari";
  }

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    operatingSystem = "iOS";
  } else if (/Android/i.test(userAgent)) {
    operatingSystem = "Android";
  } else if (/Windows/i.test(userAgent)) {
    operatingSystem = "Windows";
  } else if (/Mac OS X|Macintosh/i.test(userAgent)) {
    operatingSystem = "macOS";
  } else if (/Linux/i.test(userAgent)) {
    operatingSystem = "Linux";
  }

  return `${browser} on ${operatingSystem}`;
}