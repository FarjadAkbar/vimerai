import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-vercel-ip-country")) {
    return { country_code: req.headers.get("x-vercel-ip-country"), source: "vercel" };
  }

  const response = await fetch("https://ipapi.co/json", {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; MyApp/1.0)",
    },
  });
  const data = await response.json();
  return NextResponse.json(data);
}
