import { NextResponse } from "next/server";

const IPAPI_URL = "https://ipapi.co/json";
const BDC_GEO_URL =
  "https://api-bdc.io/data/reverse-geocode-client?latitude=&longitude=&localityLanguage=en";

/** Normalize to shape expected by consumers (country_code). */
function normalizeGeo(data: {
  country_code?: string | null;
  countryCode?: string | null;
  [key: string]: unknown;
}) {
  const countryCode =
    data.country_code ?? data.countryCode ?? null;
  return { ...data, country_code: countryCode };
}

export async function GET() {
  try {
    const response = await fetch(IPAPI_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; MyApp/1.0)",
      },
    });
    if (!response.ok) throw new Error(`ipapi: ${response.status}`);
    const data = await response.json();
    const country = data?.country_code ?? data?.countryCode;
    if (country) {
      return NextResponse.json(normalizeGeo(data));
    }
  } catch {
    // fall through to fallback
  }

  try {
    const response = await fetch(BDC_GEO_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; MyApp/1.0)",
      },
    });
    console.log(response, 'response');
    if (!response.ok) throw new Error(`bdc: ${response.status}`);
    const data = await response.json();
    return NextResponse.json(normalizeGeo(data));
  } catch {
    return NextResponse.json({ country_code: null });
  }
}
