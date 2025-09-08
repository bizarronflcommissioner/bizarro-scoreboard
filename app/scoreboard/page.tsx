'use client';

import React from 'react';
import { Loader2, RefreshCw, Gauge, Zap, Trophy, Flame, Activity } from 'lucide-react';

type Franchise = { id: string; name: string; icon?: string; logo?: string };
type LiveFranchise = {
  id: string;
  score?: string;
  players?: {
    player: Array<{
      id: string;
      isStarter?: string;              // "true"/"false" (often present)
      gameSecondsRemaining?: string;   // preferred if present
      // Some MFL skins use odd keys — we’ll try a few common variants:
      gsecondsRemaining?: string;
      secRemaining?: string;
      seconds_remaining?: string;
    }>
  }
};
type LiveMatchup = { franchise: LiveFranchise[] };

type Brand = { name?: string; logo?: string; color?: string };
type CardSide = { id: string; name: string; score: number; color?: string; logo?: string; remainPct?: number };
type Card = {
  id: string;
  a: CardSide;
  b: CardSide;
  tag?: 'Game of the Week' | 'Closest Matchup' | 'Blowout Risk';
  clock: string;
};

function TagBadge({ tag }: { tag?: string }) {
  if (!tag) return null;
  let icon = <Activity className="h-3.5 w-3.5" />;
  let color = 'bg-slate-200 text-slate-700';
  if (tag === 'Game of the Week') { icon = <Trophy className="h-3.5 w-3.5" />; color = 'bg-indigo-600 text-white'; }
  if (tag === 'Closest Matchup')   { icon = <Activity className="h-3.5 w-3.5" />; color = 'bg-green-600 text-white'; }
  if (tag === 'Blowout Risk')      { icon = <Flame className="h-3.5 w-3.5" />; color = 'bg-red-600 text-white'; }
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium flex items-center gap-1 ${color}`}>{icon}{tag}</span>;
}

function PercentBar({ pct = 50, color = '#334155' }: { pct?: number; color?: string }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
      <div className="h-full" style={{ width: `${clamped}%`, backgroundColor: color }} />
    </div>
  );
}

/** Quarter-like progress from remaining percent (based on player minutes left). */
function QuarterBar({ remainPct = 50 }: { remainPct?: number }) {
  // remainPct = % of lineup minutes remaining. Convert to quarters “left”.
  const left = Math.max(0, Math.min(100, remainPct));
  const played = 100 - left;

  // Fill Q1..Q4 based on played%
  const perQ = 25;
  const fillFor = (qIndex: number) => {
    const start = perQ * qIndex;
    const end = perQ * (qIndex + 1);
    if (played >= end) return 100;
    if (played <= start) return 0;
    return ((played - start) / perQ) * 100;
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-1">
        {[0,1,2,3].map(i => {
          const f = fillFor(i);
          return (
            <div key={i} className="h-2 bg-slate-200 rounded-sm overflow-hidden">
              <div className="h-full bg-indigo-600" style={{ width: `${f}%` }} />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-500">
        <span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span>
      </div>
    </div>
  );
}

function ScoreRow({ side }: { side: CardSide }) {
  return (
    <div className="flex items-center gap-3">
      {side.logo ? (
        <img
          src={side.logo}
          alt={`${side.name} Logo`}
          className="h-10 w-20 rounded-md ring-2 ring-slate-200 object-contain bg-white"
        />
      ) : (
        <div className="h-10 w-20 rounded-md ring-2 ring-slate-200 bg-slate-100" />
      )}
      <div>
        <div className="text-sm font-medium leading-tight">{side.name}</div>
        <div className="text-2xl font-semibold tracking-tight">{side.score.toFixed(1)}</div>
      </div>
    </div>
  );
}

/** Try to sum remaining seconds across starters. Fallback smartly when data is missing. */
function estimateRemainingPercent(franchise: LiveFranchise): number | undefined {
  const players = franchise?.players?.player ?? [];
  if (!players.length) return undefined;

  // Use only starters if the flag is present; otherwise, include all players that report timing.
  const withTiming = players.filter(p => {
    const raw =
      p.gameSecondsRemaining ?? p.gsecondsRemaining ?? p.secRemaining ?? p.seconds_remaining;
    return raw !== undefined && raw !== null && !Number.isNaN(Number(raw));
  });

  if (!withTiming.length) return undefined;

  const starters = withTiming.filter(p => (p.isStarter ?? '').toString().toLowerCase() === 'true');
  const pool = starters.length ? starters : withTiming;

  const totalRemainSec = pool.reduce((acc, p) => {
    const raw = p.gameSecondsRemaining ?? p.gsecondsRemaining ?? p.secRemaining ?? p.seconds_remaining;
    const sec = Number(raw);
    return acc + (Number.isFinite(sec) ? sec : 0);
    }, 0);

  const maxPerPlayer = 60 * 60; // 60 minutes * 60 seconds
  const denom = pool.length * maxPerPlayer;
  if (denom <= 0) return undefined;

  const pctLeft = (totalRemainSec / denom) * 100;
  // Clamp to sane bounds
  return Math.max(0, Math.min(100, pctLeft));
}

export default function ScoreboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [week, setWeek] = React.useState<string>('1');
  const [cards, setCards] = React.useState<Card[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      // 1) League: for names + logo sources (icon/logo)
      const leagueRes = await fetch(`/api/mfl?type=league`, { cache: 'no-store' }).then(r => r.json());
      const baseURL: string = leagueRes?.league?.baseURL || '';
      const leagueId: string = leagueRes?.league?.id || '';
      const franchises: Franchise[] = leagueRes?.league?.franchises?.franchise ?? [];

      const brand: Record<string, Brand> = {};
      const fallbackYear = new Date().getFullYear().toString();

      for (const f of franchises) {
        const providedLogo = f.icon || f.logo;
        const guessedLogo = (baseURL && leagueId && f.id)
          ? `${baseURL}/fflnetdynamic${fallbackYear}/${leagueId}_franchise_icon${f.id}.jpg`
          : undefined;
        brand[f.id] = {
          name: (f.name || '').trim(),
          logo: providedLogo || guessedLogo,
          color: '#334155',
        };
      }

      // 2) Live Scoring
      const liveRes = await fetch(`/api/mfl?type=liveScoring&w=${week}`, { cache: 'no-store' }).then(r => r.json());
      let matchups: LiveMatchup[] = liveRes?.liveScoring?.matchup ?? [];

      // Fallback to scoreboard if needed
      if (!matchups.length) {
        const sb = await fetch(`/api/mfl?type=scoreboard&w=${week}`, { cache: 'no-store' }).then(r => r.json());
        matchups = sb?.scoreboard?.matchup ?? [];
      }

      // 3) Normalize into cards (with remaining % per side)
      const normalized: Card[] = (matchups || []).map((m, idx) => {
        const a = m.franchise[0], b = m.franchise[1];
        const aBrand = brand[a.id] || {};
        const bBrand = brand[b.id] || {};
        const aScore = Number(a.score ?? 0);
        const bScore = Number(b.score ?? 0);
        const aRemain = estimateRemainingPercent(a);
        const bRemain = estimateRemainingPercent(b);

        return {
          id: String(idx),
          a: {
            id: a.id,
            name: aBrand.name || a.id,
            score: aScore,
            color: aBrand.color,
            logo: aBrand.logo,
            remainPct: aRemain ?? 50, // neutral until data arrives
          },
          b: {
            id: b.id,
            name: bBrand.name || b.id,
            score: bScore,
            color: bBrand.color,
            logo: bBrand.logo,
            remainPct: bRemain ?? 50,
          },
          clock: 'LIVE',
        };
      });

      // 4) Badges
      if (normalized.length) {
        let closestIdx = 0, closestMargin = Infinity;
        normalized.forEach((c, i) => {
          const margin = Math.abs(c.a.score - c.b.score);
          if (margin < closestMargin) { closestMargin = margin; closestIdx = i; }
        });
        normalized[closestIdx].tag = 'Closest Matchup';

        let blowoutIdx = 0, blowoutMargin = -1;
        normalized.forEach((c, i) => {
          const margin = Math.abs(c.a.score - c.b.score);
          if (margin > blowoutMargin) { blowoutMargin = margin; blowoutIdx = i; }
        });
        if (blowoutMargin >= 30) normalized[blowoutIdx].tag = 'Blowout Risk';

        let gotwIdx = 0, bestCombined = -1;
        normalized.forEach((c, i) => {
          const combined = c.a.score + c.b.score;
          if (combined > bestCombined) { bestCombined = combined; gotwIdx = i; }
        });
        normalized[gotwIdx].tag = 'Game of the Week';
      }

      setCards(normalized);
    } catch (e) {
      console.error('Failed to load MFL data', e);
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [week]);

  React.useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-7 w-7 text-indigo-700" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Bizarro League Live Scoreboard</h1>
            <p className="text-sm text-slate-600">
              Week&nbsp;
              <select value={week} onChange={(e) => setWeek(e.target.value)} className="border rounded-md px-2 py-1 text-sm bg-white shadow-sm">
                {Array.from({ length: 18 }).map((_, i) => (<option key={i + 1} value={String(i + 1)}>{i + 1}</option>))}
              </select>
              &nbsp;• Auto-refresh every 30s
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load()} className="px-4 py-2 border rounded-lg flex items-center gap-2 bg-white shadow-sm" title="Refresh now">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </header>

      {loading && (<div className="mb-4 flex items-center gap-2 text-slate-600"><Loader2 className="h-4 w-4 animate-spin" /> Updating…</div>)}

      {(!loading && cards.length === 0) && (<div className="mb-4 text-slate-600">No matchups found for week {week}.</div>)}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((m) => {
          const leftColor = m.a.color || '#334155';
          const leftPct = m.a.score + m.b.score === 0 ? 50 : (m.a.score / (m.a.score + m.b.score)) * 100;

          // Convert remain % to a readable label
          const remainLabel = (pct?: number) => pct === undefined ? '—' : `${Math.round(pct!)}% left`;

          return (
            <div key={m.id} className="rounded-2xl shadow-md border border-slate-200 p-4 bg-white">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Gauge className="h-3.5 w-3.5" /><span>Week {week}</span><span>•</span><span>{m.clock}</span>
                </div>
                <TagBadge tag={m.tag} />
              </div>

              <div className="flex items-start justify-between gap-4">
                <ScoreRow side={m.a} />
                <div className="text-slate-400 text-xs self-center">vs</div>
                <ScoreRow side={m.b} />
              </div>

              {/* Win-share bar (based on points so far) */}
              <div className="mt-3">
                <PercentBar pct={leftPct} color={leftColor} />
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>{leftPct.toFixed(0)}%</span><span>{(100 - leftPct).toFixed(0)}%</span>
                </div>
              </div>

              {/* Quarter-like progress based on lineup minutes remaining */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <QuarterBar remainPct={m.a.remainPct ?? 50} />
                  <div className="mt-1 text-[11px] text-slate-600">Time left: {remainLabel(m.a.remainPct)}</div>
                </div>
                <div>
                  <QuarterBar remainPct={m.b.remainPct ?? 50} />
                  <div className="mt-1 text-[11px] text-slate-600 text-right">Time left: {remainLabel(m.b.remainPct)}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /><span>Live via MFL</span></div>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="mt-8 text-center text-xs text-slate-400">Bizarro Fantasy Football League • Live Scoreboard</footer>
    </div>
  );
}
