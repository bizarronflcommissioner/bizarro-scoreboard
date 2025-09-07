'use client';

import React from 'react';
import { Loader2, RefreshCw, Gauge, Zap, Trophy, Flame, Activity } from 'lucide-react';

// --- Team Logo & Branding Map ---
const TEAM_LOGOS: Record<string, { logo: string; color: string }> = {
  CHI: { logo: '/assets/logos/chiefs.png', color: '#E31837' },
  DAL: { logo: '/assets/logos/cowboys.png', color: '#041E42' },
  RAM: { logo: '/assets/logos/rams.png', color: '#003594' },
  DEN: { logo: '/assets/logos/broncos.png', color: '#FB4F14' },
  NYJ: { logo: '/assets/logos/jets.png', color: '#125740' },
  PHI: { logo: '/assets/logos/eagles.png', color: '#004C54' },
  PIT: { logo: '/assets/logos/steelers.png', color: '#FFB612' },
  SEA: { logo: '/assets/logos/seahawks.png', color: '#002244' },
  HOU: { logo: '/assets/logos/texans.png', color: '#03202F' },
  SFO: { logo: '/assets/logos/49ers.png', color: '#AA0000' },
  MIA: { logo: '/assets/logos/dolphins.png', color: '#008E97' },
  BUF: { logo: '/assets/logos/bills.png', color: '#00338D' },
};

type MockMatchup = {
  a: { id: string; name: string; record: string; score: number; proj: number; winp: number; top?: string };
  b: { id: string; name: string; record: string; score: number; proj: number; winp: number; top?: string };
  tag?: 'Game of the Week' | 'Closest Matchup' | 'Blowout Risk';
  clock: string;
};

const MOCK_MATCHUPS: MockMatchup[] = [
  {
    a: { id: 'CHI', name: 'Chiefs', record: '0–0', score: 102.4, proj: 128.0, winp: 58, top: 'Jefferson 24.6' },
    b: { id: 'DAL', name: 'Cowboys', record: '0–0', score: 98.1, proj: 121.7, winp: 42, top: 'Pollard 18.4' },
    tag: 'Game of the Week',
    clock: 'Q4 • 03:12',
  },
  {
    a: { id: 'RAM', name: 'Rams', record: '0–0', score: 76.5, proj: 96.4, winp: 12, top: 'Puka 15.3' },
    b: { id: 'DEN', name: 'Broncos', record: '0–0', score: 120.2, proj: 134.9, winp: 88, top: 'Mahomes 29.1' },
    tag: 'Blowout Risk',
    clock: 'Q3 • 07:48',
  },
  {
    a: { id: 'NYJ', name: 'Jets', record: '0–0', score: 111.3, proj: 119.0, winp: 54, top: 'Breece 21.0' },
    b: { id: 'PHI', name: 'Eagles', record: '0–0', score: 109.9, proj: 121.3, winp: 46, top: 'AJB 23.8' },
    tag: 'Closest Matchup',
    clock: 'Q4 • 09:02',
  },
];

function TagBadge({ tag }: { tag?: string }) {
  if (!tag) return null;
  let icon = <Activity className="h-3.5 w-3.5" />;
  let color = 'bg-slate-200 text-slate-700';
  if (tag === 'Game of the Week') {
    icon = <Trophy className="h-3.5 w-3.5" />;
    color = 'bg-indigo-600 text-white';
  }
  if (tag === 'Closest Matchup') {
    icon = <Activity className="h-3.5 w-3.5" />;
    color = 'bg-green-600 text-white';
  }
  if (tag === 'Blowout Risk') {
    icon = <Flame className="h-3.5 w-3.5" />;
    color = 'bg-red-600 text-white';
  }
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium flex items-center gap-1 ${color}`}>{icon}{tag}</span>;
}

function Bar({ leftPct, rightPct, color }: { leftPct: number; rightPct: number; color: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
      <div className="h-full" style={{ width: `${leftPct}%`, backgroundColor: color }} />
    </div>
  );
}

function ScoreRow({ side }: { side: MockMatchup['a'] }) {
  const brand = TEAM_LOGOS[side.id];
  return (
    <div className="flex items-center gap-3">
      <img src={brand.logo} alt="" className="h-9 w-9 rounded-full ring-2 ring-slate-200" />
      <div>
        <div className="text-sm font-medium leading-tight">
          {side.name} <span className="text-slate-400">{side.record}</span>
        </div>
        <div className="text-2xl font-semibold tracking-tight">
          {side.score.toFixed(1)} <span className="text-xs font-normal text-slate-500">/ {Math.round(side.proj)}</span>
        </div>
        {side.top && <div className="text-xs text-slate-500">Top: {side.top}</div>}
      </div>
    </div>
  );
}

export default function MFLScoreboardMock() {
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-7 w-7 text-indigo-700" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Bizarro League Live Scoreboard</h1>
            <p className="text-sm text-slate-600">Mock Data • Live MFL integration coming soon</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 600); }}
            className="px-4 py-2 border rounded-lg flex items-center gap-2 bg-white shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </header>

      {loading && (
        <div className="mb-4 flex items-center gap-2 text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Updating…
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MOCK_MATCHUPS.map((m, idx) => {
          const leftBrand = TEAM_LOGOS[m.a.id];
          return (
            <div key={idx} className="rounded-2xl shadow-md border border-slate-200 p-4 bg-white">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Gauge className="h-3.5 w-3.5" />
                  <span>{m.clock}</span>
                </div>
                <TagBadge tag={m.tag} />
              </div>
              <div className="flex items-start justify-between gap-4">
                <ScoreRow side={m.a} />
                <div className="text-slate-400 text-xs self-center">vs</div>
                <ScoreRow side={m.b} />
              </div>
              <div className="mt-3">
                <Bar leftPct={m.a.winp} rightPct={m.b.winp} color={leftBrand.color} />
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>{m.a.winp}%</span>
                  <span>{m.b.winp}%</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Top performers highlighted</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="mt-8 text-center text-xs text-slate-400">
        Bizarro Fantasy Football League • Branded Scoreboard • Mock Data
      </footer>
    </div>
  );
}
