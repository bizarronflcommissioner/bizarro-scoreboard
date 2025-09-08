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
      isStarter?: string;
      gameSecondsRemaining?: string;
      gsecondsRemaining?: string;
      secRemaining?: string;
      seconds_remaining?: string;
    }>;
  };
};
type LiveMatchup = { franchise: LiveFranchise[] };

type Brand = { name?: string; logo?: string; color?: string };

type CardSide = {
  id: string;
  name: string;
  score: number;
  color?: string;
  logo?: string;
  remainPct?: number;   // % of lineup minutes remaining
  winp?: number;        // win probability for this side (0..100)
  leftCount?: number;   // # players left with time remaining
};

type Card = {
  id: string;
  a: CardSide;
  b: CardSide;
  tag?: 'Game of the Week' | 'Closest Matchup' | 'Blowout Risk';
  clock: string;
};

/* ---------------- UI helpers ---------------- */

function TagBadge({ tag }: { tag?: string }) {
  if (!tag) return null;
  let icon = <Activity className="h-3.5 w-3.5" />;
  let color = 'bg-slate-200 text-slate-700';
  if (tag === 'Game of the Week') { icon = <Trophy className="h-3.5 w-3.5" />; color = 'bg-indigo-600 text-white'; }
  if (tag === 'Closest Matchup')   { icon = <Activity className="h-3.5 w-3.5" />; color = 'bg-green-600 text-white'; }
  if (tag === 'Blowout Risk')      { icon = <Flame className="h-3.5 w-3.5" />; color = 'bg-red-600 text-white'; }
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium flex items-center gap-1 ${color}`}>{icon}{tag}</span>;
}

/** Win probability bar (left = team A, right = team B). */
function WinProbBar({ left = 50, color = '#334155' }: { left?: number; color?: string }) {
  const clamped = Math.max(0, Math.min(100, left));
  return (
    <div className="w-full">
      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden" title="Win Probability">
        <div className="h-full" style={{ width: `${clamped}%`, backgroundColor: color }} />
      </div>
      <div className="mt-1 flex justify-between text-xs text-slate-500">
        <span>{clamped.toFixed(0)}%</span>
        <span>{(100 - clamped).toFixed(0)}%</span>
      </div>
    </div>
  );
}

/** Quarter-like progress based on lineup minutes remaining */
function QuarterBar({ remainPct = 50 }: { remainPct?: number }) {
  const left = Math.max(0, Math.min(100, remainPct));
  const played = 100 - left;
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
        {[0,1,2,3].map(i => (
          <div key={i} className="h-2 bg-slate-200 rounded-sm overflow-hidden">
            <div className="h-full bg-indigo-600" style={{ width: `${fillFor(i)}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-500"><span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span></div>
    </div>
  );
}

/** Wide banner-style team tile + “players left” */
function ScoreRow({ side }: { side: CardSide }) {
  return (
    <div className="flex flex-col items-center w-52">
      {side.logo ? (
        <img
          src={side.logo}
          alt={`${side.name} Logo`}
          className="h-20 w-44 rounded-md ring-2 ring-slate-200 object-contain bg-white shadow"
        />
      ) : (
        <div className="h-20 w-44 rounded-md ring-2 ring-slate-200 bg-slate-100" />
      )}
      <div className="text-sm font-medium leading-tight mt-1 text-center">{side.name}</div>
      <div className="text-[11px] text-slate-500">Players left: {side.leftCount ?? '—'}</div>
    </div>
  );
}

/* ---------------- data helpers ---------------- */

function getTimingSeconds(p: any): number {
  const raw = p?.gameSecondsRemaining ?? p?.gsecondsRemaining ?? p?.secRemaining ?? p?.seconds_remaining;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/** Get the pool we use for timing (prefer starters; otherwise anyone with timing) */
function getTimingPool(franchise: LiveFranchise) {
  const players = franchise?.players?.player ?? [];
  if (!players.length) return [];
  const withTiming = players.filter(p => getTimingSeconds(p) !== 0 || p?.gameSecondsRemaining !== undefined || p?.gsecondsRemaining !== undefined || p?.secRemaining !== undefined || p?.seconds_remaining !== undefined);
  if (!withTiming.length) return [];
  const starters = withTiming.filter(p => (p.isStarter ?? '').toString().toLowerCase() === 'true');
  return starters.length ? starters : withTiming;
}

/** % of lineup minutes remaining */
function estimateRemainingPercent(franchise: LiveFranchise): number | undefined {
  const pool = getTimingPool(franchise);
  if (!pool.length) return undefined;

  const totalRemainSec = pool.reduce((acc, p) => acc + Math.max(0, getTimingSeconds(p)), 0);
  const maxPerPlayer = 60 * 60; // 60 minutes * 60 seconds
  const denom = pool.length * maxPerPlayer;
  if (denom <= 0) return undefined;

  const pctLeft = (totalRemainSec / denom) * 100;
  return Math.max(0, Math.min(100, pctLeft));
}

/** Count players with > 0s remaining in the timing pool */
function countPlayersLeft(franchise: LiveFranchise): number | undefined {
  const pool = getTimingPool(franchise);
  if (!pool.length) return undefined;
  return pool.filter(p => getTimingSeconds(p) > 0).length;
}

/**
 * Heuristic projection -> win probability
 * - playedPct = 100 - remainPct
 * - projectedTotal ≈ currentScore / max(playedPct, minPlayed) * 100
 */
function computeWinProb(aScore: number, aRemainPct: number | undefined, bScore: number, bRemainPct: number | undefined): { aWP: number; bWP: number } {
  const aPlayed = Math.max(0, 100 - (aRemainPct ?? 50));
  const bPlayed = Math.max(0, 100 - (bRemainPct ?? 50));
  const minPlayed = 5; // damp early volatility

  const aProjTotal = aScore * (100 / Math.max(minPlayed, aPlayed || 0.0001));
  const bProjTotal = bScore * (100 / Math.max(minPlayed, bPlayed || 0.0001));

  const aNonNeg = Math.max(aScore, aProjTotal);
  const bNonNeg = Math.max(bScore, bProjTotal);

  const denom = aNonNeg + bNonNeg;
  if (denom <= 0) return { aWP: 50, bWP: 50 };

  const aWP = (aNonNeg / denom) * 100;
  const bWP = 100 - aWP;
  return { aWP, bWP };
}

/* ---------------- page ---------------- */

export default function ScoreboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [week, setWeek] = React.useState<string>('1');
  const [cards, setCards] = React.useState<Card[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      // League info for logos/names
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

      // Live scoring (fallback to scoreboard)
      const liveRes = await fetch(`/api/mfl?type=liveScoring&w=${week}`, { cache: 'no-store' }).then(r => r.json());
      let matchups: LiveMatchup[] = liveRes?.liveScoring?.matchup ?? [];
      if (!matchups.length) {
        const sb = await fetch(`/api/mfl?type=scoreboard&w=${week}`, { cache: 'no-store' }).then(r => r.json());
        matchups = sb?.scoreboard?.matchup ?? [];
      }

      // Normalize -> cards (with remain %, win prob, players left)
      const normalized: Card[] = (matchups || []).map((m, idx) => {
        const a = m.franchise[0], b = m.franchise[1];
        const aBrand = brand[a.id] || {};
        const bBrand = brand[b.id] || {};
        const aScore = Number(a.score ?? 0);
        const bScore = Number(b.score ?? 0);
        const aRemain = estimateRemainingPercent(a);
        const bRemain = estimateRemainingPercent(b);
        const aLeft = countPlayersLeft(a);
        const bLeft = countPlayersLeft(b);

        const { aWP, bWP } = computeWinProb(aScore, aRemain, bScore, bRemain);

        return {
          id: String(idx),
          a: { id: a.id, name: aBrand.name || a.id, score: aScore, color: aBrand.color, logo: aBrand.logo, remainPct: aRemain ?? 50, winp: aWP, leftCount: aLeft },
          b: { id: b.id, name: bBrand.name || b.id, score: bScore, color: bBrand.color, logo: bBrand.logo, remainPct: bRemain ?? 50, winp: bWP, leftCount: bLeft },
          clock: 'LIVE',
        };
      });

      // Badges
      if (normalized.length) {
        // Closest (smallest margin)
        let closestIdx = 0, closestMargin = Infinity;
        normalized.forEach((c, i) => {
          const margin = Math.abs(c.a.score - c.b.score);
          if (margin < closestMargin) { closestMargin = margin; closestIdx = i; }
        });
        if (normalized[closestIdx]) normalized[closestIdx].tag = 'Closest Matchup';

        // Blowout Risk (>= 10 pts)
        let blowoutIdx = 0, blowoutMargin = -1;
        normalized.forEach((c, i) => {
          const margin = Math.abs(c.a.score - c.b.score);
          if (margin > blowoutMargin) { blowoutMargin = margin; blowoutIdx = i; }
        });
        if (blowoutMargin >= 10 && normalized[blowoutIdx]) normalized[blowoutIdx].tag = 'Blowout Risk';

        // Game of the Week (40% avg win%, 30% total score, 30% closeness)
        let gotwIdx = 0, bestScore = -1;
        normalized.forEach((c, i) => {
          const avgWinp = ((c.a.winp ?? 50) + (c.b.winp ?? 50)) / 2;
          const totalPts = c.a.score + c.b.score;
          const closeness = 100 - Math.min(100, Math.abs(c.a.score - c.b.score));
          const weighted =
            0.40 * avgWinp +
            0.30 * (Math.min(300, totalPts) / 300 * 100) +
            0.30 * closeness;
          if (weighted > bestScore) { bestScore = weighted; gotwIdx = i; }
        });
        if (normalized[gotwIdx]) normalized[gotwIdx].tag = 'Game of the Week';
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

  const remainLabel = (pct?: number) => pct === undefined ? '—' : `${Math.round(pct!)}% left`;

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
          const leftWinp = m.a.winp ?? 50;

          return (
            <div key={m.id} className="rounded-2xl shadow-lg border border-slate-200 p-6 bg-white min-h-[210px]">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Gauge class
