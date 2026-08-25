export function getLocaleForCountry(countryCode) {
  const country = countryCode.toUpperCase();

  try {
    const locale = new Intl.Locale(`und-${country}`).maximize();
    return `${locale.language}_${country}`;
  } catch {
    return "en_US";
  }
}
