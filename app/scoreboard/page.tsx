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
  remainPct?: number;
  leftCount?: number;
};

type TagType = 'Game of the Week' | 'Closest Matchup' | 'Blowout Risk';

type Card = {
  id: string;
  a: CardSide;
  b: CardSide;
  tag?: TagType;
  clock: string;
};

/* ---------- Tag styling helpers (card-wide highlight) ---------- */

function tagClasses(tag?: TagType) {
  switch (tag) {
    case 'Game of the Week':
      return {
        cardBorder: 'border-indigo-500',
        ring: 'ring-indigo-400',
      };
    case 'Closest Matchup':
      return {
        cardBorder: 'border-green-500',
        ring: 'ring-green-400',
      };
    case 'Blowout Risk':
      return {
        cardBorder: 'border-red-500',
        ring: 'ring-red-400',
      };
    default:
      return {
        cardBorder: 'border-slate-200',
        ring: 'ring-slate-200',
      };
  }
}

/* ---------- UI helpers ---------- */

function TagBadge({ tag }: { tag?: TagType }) {
  if (!tag) return null;
  let icon = <Activity className="h-3.5 w-3.5" />;
  let color = 'bg-slate-200 text-slate-700';
  if (tag === 'Game of the Week') { icon = <Trophy className="h-3.5 w-3.5" />; color = 'bg-indigo-600 text-white'; }
  if (tag === 'Closest Matchup')   { icon = <Activity className="h-3.5 w-3.5" />; color = 'bg-green-600 text-white'; }
  if (tag === 'Blowout Risk')      { icon = <Flame className="h-3.5 w-3.5" />; color = 'bg-red-600 text-white'; }
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium flex items-center gap-1 ${color}`}>{icon}{tag}</span>;
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
      <div className="mt-1 flex justify-between text-[10px] text-slate-500">
        <span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span>
      </div>
    </div>
  );
}

/** Team banner + name + players left (ring color matches tag highlight) */
function ScoreRow({ side, ringClass }: { side: CardSide; ringClass: string }) {
  return (
    <div className="flex flex-col items-center w-56">
      {side.logo ? (
        <img
          src={side.logo}
          alt={`${side.name} Logo`}
          className={`h-20 w-48 rounded-md ring-2 ${ringClass} object-contain bg-white shadow`}
        />
      ) : (
        <div className={`h-20 w-48 rounded-md ring-2 ${ringClass} bg-slate-100`} />
      )}
      <div className="text-sm font-medium leading-tight mt-1 text-center">{side.name}</div>
      <div className="text-[11px] text-slate-500">Players left: {side.leftCount ?? '—'}</div>
    </div>
  );
}

/* ---------- data helpers ---------- */

function getTimingSeconds(p: any): number {
  const raw = p?.gameSecondsRemaining ?? p?.gsecondsRemaining ?? p?.secRemaining ?? p?.seconds_remaining;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function getTimingPool(franchise: LiveFranchise) {
  const players = franchise?.players?.player ?? [];
  if (!players.length) return [];
  const withTiming = players.filter(p =>
    p?.gameSecondsRemaining !== undefined ||
    p?.gsecondsRemaining !== undefined ||
    p?.secRemaining !== undefined ||
    p?.seconds_remaining !== undefined
  );
  if (!withTiming.length) return [];
  const starters = withTiming.filter(p => (p.isStarter ?? '').toString().toLowerCase() === 'true');
  return starters.length ? starters : withTiming;
}

/** % of lineup minutes remaining */
function estimateRemainingPercent(franchise: LiveFranchise): number | undefined {
  const pool = getTimingPool(franchise);
  if (!pool.length) return undefined;
  const totalRemainSec = pool.reduce((acc, p) => acc + Math.max(0, getTimingSeconds(p)), 0);
  const maxPerPlayer = 60 * 60;
  const denom = pool.length * maxPerPlayer;
  if (denom <= 0) return undefined;
  const pctLeft = (totalRemainSec / denom) * 100;
  return Math.max(0, Math.min(100, pctLeft));
}

function countPlayersLeft(franchise: LiveFranchise): number | undefined {
  const pool = getTimingPool(franchise);
  if (!pool.length) return undefined;
  return pool.filter(p => getTimingSeconds(p) > 0).length;
}

/* ---------- page ---------- */

export default function ScoreboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [week, setWeek] = React.useState<string>('1');
  const [cards, setCards] = React.useState<Card[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      // League for names/logos
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
            remainPct: aRemain ?? 50,
            leftCount: countPlayersLeft(a),
          },
          b: {
            id: b.id,
            name: bBrand.name || b.id,
            score: bScore,
            color: bBrand.color,
            logo: bBrand.logo,
            remainPct: bRemain ?? 50,
            leftCount: countPlayersLeft(b),
          },
          clock: 'LIVE',
        };
      });

      // Badges
      if (normalized.length) {
        // Closest margin
        let closestIdx = 0, closestMargin = Infinity;
        normalized.forEach((c, i) => {
          const margin = Math.abs(c.a.score - c.b.score);
          if (margin < closestMargin) { closestMargin = margin; closestIdx = i; }
        });
        normalized[closestIdx].tag = 'Closest Matchup';

        // Blowout (>= 10)
        let blowoutIdx = 0, blowoutMargin = -1;
        normalized.forEach((c, i) => {
          const margin = Math.abs(c.a.score - c.b.score);
          if (margin > blowoutMargin) { blowoutMargin = margin; blowoutIdx = i; }
        });
        if (blowoutMargin >= 10) normalized[blowoutIdx].tag = 'Blowout Risk';

        // Game of the Week (40% avg Win% proxy, 30% total, 30% closeness)
        let gotwIdx = 0, bestScore = -1;
        normalized.forEach((c, i) => {
          const aWP = c.a.score + 0.0001;
          const bWP = c.b.score + 0.0001;
          const avgWinp = ((aWP / (aWP + bWP)) * 100 + (bWP / (aWP + bWP)) * 100) / 2; // ≈ 50 baseline
          const totalPts = c.a.score + c.b.score;
          const closeness = 100 - Math.min(100, Math.abs(c.a.score - c.b.score));
          const weighted =
            0.40 * avgWinp +
            0.30 * (Math.min(300, totalPts) / 300 * 100) +
            0.30 * closeness;
          if (weighted > bestScore) { bestScore = weighted; gotwIdx = i; }
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
          const { cardBorder, ring } = tagClasses(m.tag);
          return (
            <div
              key={m.id}
              className={`rounded-2xl shadow-lg border-2 ${cardBorder} p-6 bg-white min-h-[210px]`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Gauge className="h-3.5 w-3.5" />
                  <span>Week {week}</span><span>•</span><span>{m.clock}</span>
                </div>
                <TagBadge tag={m.tag} />
              </div>

              {/* wider center column so scores don't stack */}
              <div className="flex items-center justify-between gap-6">
                <ScoreRow side={m.a} ringClass={ring} />
                <div className="flex flex-col items-center justify-center flex-[1_1_260px] min-w-[220px]">
                  <div className="text-4xl font-bold text-slate-800 leading-none">{m.a.score.toFixed(1)}</div>
                  <div className="text-xs text-slate-400 my-1">vs</div>
                  <div className="text-4xl font-bold text-slate-800 leading-none">{m.b.score.toFixed(1)}</div>
                </div>
                <ScoreRow side={m.b} ringClass={ring} />
              </div>

              {/* Quarter-like progress based on lineup minutes remaining */}
              <div className="mt-4 grid grid-cols-2 gap-4">
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
