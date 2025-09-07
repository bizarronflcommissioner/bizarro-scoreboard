import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const leagueId = process.env.NEXT_PUBLIC_LEAGUE_ID!;
  const season = process.env.NEXT_PUBLIC_SEASON || "2025";

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "liveScoring"; // default = live scoring
  const week = url.searchParams.get("w") || undefined;

  const apiUrl = new URL(`https://api.myfantasyleague.com/${season}/export`);
  apiUrl.searchParams.set("TYPE", type);
  apiUrl.searchParams.set("L", leagueId);
  apiUrl.searchParams.set("JSON", "1");
  if (week) apiUrl.searchParams.set("W", week);

  const res = await fetch(apiUrl.toString(), {
    headers: { accept: "application/json" },
    cache: "no-store"
  });
  const data = await res.json();

  return NextResponse.json(data, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store"
    }
  });
}
