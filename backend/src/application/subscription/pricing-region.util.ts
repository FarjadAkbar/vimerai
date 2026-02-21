import type { PricingRegion } from '@/infrastructure/config/payment.config';

/**
 * ISO 3166-1 alpha-2 country codes for Middle East and Africa (MEA).
 * Used to determine pricing region from request geo headers.
 */
const MEA_COUNTRY_CODES = new Set<string>([
  // Africa
  'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CV', 'CM', 'CF', 'TD', 'KM', 'CG', 'CD',
  'DJ', 'EG', 'GQ', 'ER', 'SZ', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'CI', 'KE',
  'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG',
  'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'TZ', 'TG', 'TN', 'UG',
  'ZM', 'ZW',
  // Middle East
  'BH', 'CY', 'IR', 'IQ', 'IL', 'JO', 'KW', 'LB', 'OM', 'PS', 'QA', 'SA', 'SY',
  'TR', 'AE', 'YE',
]);


/**
 * Get pricing region from the incoming request (user location).
 * Reads country from Vercel (x-vercel-ip-country) or Cloudflare (cf-ipcountry) headers.
 * If country is in Middle East or Africa, returns 'mea'; otherwise 'global'.
 * If no geo header is present, returns null (caller should use config default).
 */
export async function getRegionFromRequest(): Promise<PricingRegion> {
   const country = await lookupCountryFromIP();

  if (!country) return 'global';

  return isMEA(country) ? 'mea' : 'global';
}

function isMEA(countryCode: string): boolean {
  return MEA_COUNTRY_CODES.has(countryCode.toUpperCase());
}

async function lookupCountryFromIP(): Promise<string | null> {
  try {
    const res = await fetch(`http://ip-api.com/json`);
    const data = await res.json();
    return data.countryCode ?? null;
  } catch {
    return null;
  }
}