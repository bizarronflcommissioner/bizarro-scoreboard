import { NextRequest, NextResponse } from "next/server";

function buildMflUrl(season: string, leagueId: string, type: string, w?: string) {
  const u = new URL(`https://api.myfantasyleague.com/${season}/export`);
  u.searchParams.set("TYPE", type);
  u.searchParams.set("L", leagueId);
  u.searchParams.set("JSON", "1");
  if (w) u.searchParams.set("W", w);
  return u;
}

export async function GET(req: NextRequest) {
  const leagueId = process.env.NEXT_PUBLIC_LEAGUE_ID || "";
  const season = process.env.NEXT_PUBLIC_SEASON || "2025";

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "liveScoring";
  const w = url.searchParams.get("w") || undefined;

  // debug helper: does NOT call MFL, only returns the URLs we would use
  if (type === "__debug") {
    return NextResponse.json({
      ok: true,
      season,
      leagueId,
      week: w || "(none)",
      urls: {
        liveScoring: buildMflUrl(season, leagueId, "liveScoring", w).toString(),
        scoreboard: buildMflUrl(season, leagueId, "scoreboard", w).toString(),
        league: buildMflUrl(season, leagueId, "league").toString(),
      },
    });
  }

  if (!leagueId) {
    return NextResponse.json({ error: "Missing NEXT_PUBLIC_LEAGUE_ID" }, { status: 400 });
  }

  const mflUrl = buildMflUrl(season, leagueId, type, w);

  const res = await fetch(mflUrl.toString(), {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return NextResponse.json(json, {
      headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Non-JSON from MFL", status: res.status, body: text.slice(0, 5000) },
      { status: 502 }
    );
  }
}
