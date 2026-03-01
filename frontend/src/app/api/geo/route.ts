import { NextResponse } from "next/server";

export async function GET() {
  const response = await fetch("https://ipapi.co/json", {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; MyApp/1.0)",
    },
  });
  console.log(response, 'response');
  const data = await response.json();
  console.log(data, 'data');
  return NextResponse.json(data);
}
