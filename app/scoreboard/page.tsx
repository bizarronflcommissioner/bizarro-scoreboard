'use client';

import React from 'react';
import { Loader2, RefreshCw, Gauge, Zap, Trophy, Flame, Activity } from 'lucide-react';

type Franchise = { id: string; name: string };
type LiveFranchise = { id: string; score?: string };
type LiveMatchup = { franchise: LiveFranchise[] };

type CardSide = { id: string; name: string; score: number; color?: string; logo?: string };
type Card = { id: string; a: CardSide; b: CardSide; tag?: 'Game of the Week' | 'Closest Matchup' | 'Blowout Risk'; clock: string };

// Optional branding map — we’ll fill this later
const FRANCHISE_BRAND: Record<string, { logo?: string; color?: string }> = {};

function TagBadge({ tag }: { tag?: string }) {
  if (!tag) return null;
  let icon = <Activity className="h-3.5 w-3.5" />;
  let color = 'bg-slate-200 text-slate-700';
  if (tag === 'Game of the Week') { icon = <Trophy className="h-3.5 w-3.5" />; color = 'bg-indigo-600 text-white'; }
  if (tag === 'Closest Matchup')   { icon = <Activity className="h-3.5 w-3.5" />; color = 'bg-green-600 text-white'; }
  if (tag === 'Blowout Risk')      { icon = <Flame className="h-3.5 w-3.5" />; color = 'bg-red-600 text-white'; }
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium flex items-center gap-1 ${color}`}>{icon}{tag}</span>;
}

function Bar({ leftPct = 50, color = '#334155' }: { leftPct?: number; color?: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
      <div className="h-full" style={{ width: `${Math.max(0, Math.min(100, leftPct))}%`, backgroundColor: color }} />
    </div>
  );
}

function ScoreRow({ side }: { side: CardSide }) {
  return (
    <div className="flex items-center gap-3">
      {side.logo ? (
        <img src={side.logo} alt="" className="h-9 w-9 rounded-full ring-2 ring-slate-200" />
      ) : (
        <div className="h-9 w-9 rounded-full ring-2 ring-slate-200 bg-slate-100" />
      )}
      <div>
        <div className="text-sm font-medium leading-tight">{side.name}</div>
        <div className="text-2xl font-semibold tracking-tight">{side.score.toFixed(1)}</div>
      </div>
    </div>
  );
}

export default function ScoreboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [week, setWeek] = React.useState<string>('1');
  const [cards, setCards] = React.useState<Card[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      // Get league franchises
      const leagueRes = await fetch(`/api/mfl?type=league`, { cache: 'no-store' }).then(r => r.json());
      const fmap: Record<string, string> = {};
      (leagueRes?.league?.franchises?.franchise ?? []).forEach((f: Franchise) => {
        fmap[f.id] = f.name;
      });

      // Get live scoring
      const liveRes = await fetch(`/api/mfl?type=liveScoring&w=${week}`, { cache: 'no-store' }).then(r => r.json());
      let matchups: LiveMatchup[] = liveRes?.liveScoring?.matchup ?? [];

      // Fallback to scoreboard if needed
      if (!matchups.length) {
        const sb = await fetch(`/api/mfl?type=scoreboard&w=${week}`, { cache: 'no-store' }).then(r => r.json());
        matchups = sb?.scoreboard?.matchup ?? [];
      }

      // Normalize into cards
      const normalized: Card[] = (matchups || []).map((m, idx) => {
        const a = m.franchise[0], b = m.franchise[1];
        const aBrand = FRANCHISE_BRAND[a.id] ?? {};
        const bBrand = FRANCHISE_BRAND[b.id] ?? {};
        const aScore = Number(a.score ?? 0);
        const bScore = Number(b.score ?? 0);
        return {
          id: String(idx),
          a: { id: a.id, name: fmap[a.id] ?? a.id, score: aScore, color: aBrand.color, logo: aBrand.logo },
          b: { id: b.id, name: fmap[b.id] ?? b.id, score: bScore, color: bBrand.color, logo: bBrand.logo },
          clock: 'LIVE'
        };
      });

      // Add badges
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
              <div className="mt-3">
                <Bar leftPct={leftPct} color={leftColor} />
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>{leftPct.toFixed(0)}%</span><span>{(100 - leftPct).toFixed(0)}%</span>
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
