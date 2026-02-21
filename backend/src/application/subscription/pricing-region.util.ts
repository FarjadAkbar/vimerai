import type { Request } from 'express';
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
  
  // Asia
  'IN', 'BD', 'BT', 'MM', 'KH', 'CN', 'HK', 'MO', 'JP', 'KR', 'TW', 'VN', 'PH',
  'MY', 'SG', 'ID', 'TH', 'LA', 'KZ', 'MN', 'NP', 'PK', 'AF', 'TJ', 'TM', 'UZ',
  'KG', 'AZ', 'GE', 'AM',
]);


/**
 * Get pricing region from the incoming request (user location).
 * Reads country from Vercel (x-vercel-ip-country) or Cloudflare (cf-ipcountry) headers.
 * If country is in Middle East or Africa, returns 'mea'; otherwise 'global'.
 * If no geo header is present, returns null (caller should use config default).
 */
export async function getRegionFromRequest(req: Request): Promise<PricingRegion> {
  // 1️⃣ Try Cloudflare header
  const cfCountry = req.headers['cf-ipcountry'];
  if (typeof cfCountry === 'string' && cfCountry.length === 2) {
    return isMEA(cfCountry) ? 'mea' : 'global';
  }

  // 2️⃣ Manual fallback via IP lookup
  const ip = getClientIp(req);
  const country = await lookupCountryFromIP(ip);

  if (!country) return 'global';

  return isMEA(country) ? 'mea' : 'global';
}

function isMEA(countryCode: string): boolean {
  return MEA_COUNTRY_CODES.has(countryCode.toUpperCase());
}

function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    ''
  );
}

async function lookupCountryFromIP(ip: string): Promise<string | null> {
  console.log('ip', ip);
  if (!ip) return null;

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`);
    const data = await res.json();
    return data.countryCode ?? null;
  } catch {
    return null;
  }
}