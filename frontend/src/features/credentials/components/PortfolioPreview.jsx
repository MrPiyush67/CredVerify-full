import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, Award, BarChart3, ExternalLink } from 'lucide-react';
import { Button } from '@common';

// Simple utility components
const StatCard = ({ label, value, sub, icon: Icon }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">{label}</div>
      {Icon && <Icon className="h-4 w-4 text-[#116466]" />}
    </div>
    <div className="text-3xl font-bold text-[#116466]">{value}</div>
    {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
  </div>
);

const PlatformStatusRow = ({ name, status, domain }) => (
  <div className="flex items-center justify-between py-2.5 px-2 text-sm hover:bg-gray-50 rounded">
    <span className="flex items-center gap-3">
      {domain ? (
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt={name}
          className="h-5 w-5 rounded"
          onError={(e) => {
            e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20"%3E%3Crect fill="%23116466" width="20" height="20" rx="3"/%3E%3Ctext x="50%25" y="50%25" fill="white" font-size="10" text-anchor="middle" dominant-baseline="middle"%3E${name.slice(0, 1)}%3C/text%3E%3C/svg%3E`;
          }}
        />
      ) : (
        <span className="h-5 w-5 rounded bg-[#116466] flex items-center justify-center text-[10px] font-bold text-white">{name.slice(0, 1)}</span>
      )}
      <span className="font-medium text-gray-700">{name}</span>
    </span>
    <span>{status === 'ok' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <span className="text-xs text-amber-600 font-medium">Pending</span>}</span>
  </div>
);

const Donut = ({ value, total, color = '#116466', label, difficulty }) => {
  const pct = Math.min(100, Math.round((value / total) * 100));
  const circumference = 2 * Math.PI * 30;
  const strokeDash = (pct / 100) * circumference;

  const difficultyColors = {
    Easy: '#22c55e',
    Medium: '#f59e0b',
    Hard: '#ef4444'
  };

  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0">
      <div className="flex items-center gap-4">
        <svg width={80} height={80} className="shrink-0">
          <circle cx={40} cy={40} r={30} stroke="#e5e7eb" strokeWidth={10} fill="none" />
          <circle cx={40} cy={40} r={30} stroke={color} strokeWidth={10} fill="none"
            strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
            strokeLinecap="round"
            transform="rotate(-90 40 40)" />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-[#116466]">{value}</text>
        </svg>
        <div>
          <div className="text-base font-semibold text-gray-800">{label}</div>
          {difficulty && (
            <div className="flex gap-2 mt-1">
              {Object.entries(difficulty).map(([level, count]) => (
                <span key={level} className="text-xs" style={{ color: difficultyColors[level] }}>
                  {level}: {count}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-[#116466]">{pct}%</div>
        <div className="text-xs text-gray-500">of {total}</div>
      </div>
    </div>
  );
};

const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="space-y-3 p-5">
      {data.map(d => (
        <div key={d.label} className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">{d.label}</span>
            <span className="font-semibold text-[#116466]">{d.value}</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#116466] to-[#0d9488] rounded-full transition-all duration-500"
              style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const Heatmap = ({ months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'] }) => {
  const generateHeatmapData = () => {
    return Array.from({ length: 28 }).map(() => Math.floor(Math.random() * 5));
  };

  return (
    <div className="flex items-end gap-3 p-5 overflow-x-auto">
      {months.map(m => {
        const data = generateHeatmapData();
        return (
          <div key={m} className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-gray-600">{m}</span>
            <div className="grid grid-cols-7 gap-1">
              {data.map((intensity, i) => {
                const shades = ['#f0fdfa', '#99f6e4', '#5eead4', '#2dd4bf', '#14b8a6'];
                return <div key={i} className="h-2.5 w-2.5 rounded-sm hover:ring-2 ring-[#116466] transition-all" style={{ background: shades[intensity] }} title={`${intensity} contributions`} />;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AwardBadges = ({ awards }) => (
  <div className="grid grid-cols-4 md:grid-cols-5 gap-4 p-5">
    {awards.map((a, idx) => (
      <div key={a.name} className="flex flex-col items-center group">
        <div className={`h-14 w-14 rounded-xl border-2 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform ${idx === 0 ? 'bg-yellow-50 border-yellow-400' :
            idx === 1 ? 'bg-gray-50 border-gray-400' :
              idx === 2 ? 'bg-orange-50 border-orange-400' :
                'bg-teal-50 border-teal-400'
          }`}>
          <Award className={`h-7 w-7 ${idx === 0 ? 'text-yellow-600' :
              idx === 1 ? 'text-gray-600' :
                idx === 2 ? 'text-orange-600' :
                  'text-teal-600'
            }`} />
        </div>
        <span className="text-[10px] mt-2 font-semibold text-gray-700 text-center leading-tight">{a.name}</span>
      </div>
    ))}
  </div>
);

export default function PortfolioPreview({ portfolioData, userName = 'Your Name', userBio = 'Software Engineer' }) {
  // Use provided data or fallback to mock data
  const platforms = portfolioData?.platforms || [
    { name: 'LeetCode', status: 'ok', domain: 'leetcode.com' },
    { name: 'CodeForces', status: 'ok', domain: 'codeforces.com' },
    { name: 'CodeChef', status: 'ok', domain: 'codechef.com' },
    { name: 'GFG', status: 'ok', domain: 'geeksforgeeks.org' },
    { name: 'InterviewBit', status: 'pending', domain: 'interviewbit.com' },
    { name: 'CodeStudio', status: 'ok', domain: 'naukri.com' },
    { name: 'HackerRank', status: 'ok', domain: 'hackerrank.com' },
  ];

  const problems = portfolioData?.problems || {
    fundamentals: { value: 174, total: 300, difficulty: { Easy: 99, Medium: 65, Hard: 10 } },
    dsa: { value: 936, total: 1500, difficulty: { Easy: 254, Medium: 557, Hard: 125 } },
    cp: { value: 119, total: 250, difficulty: { Easy: 27, Medium: 92, Hard: 0 } },
  };

  const dsaTopics = portfolioData?.dsaTopics || [
    { label: 'Arrays', value: 414 },
    { label: 'Dynamic Programming', value: 185 },
    { label: 'Strings', value: 162 },
    { label: 'Hashing & Sets', value: 142 },
    { label: 'Trees', value: 121 },
    { label: 'DFS & Graphs', value: 95 },
    { label: 'Stack', value: 83 },
    { label: 'Greedy Algorithms', value: 79 },
    { label: 'Math', value: 70 },
  ];

  const contests = portfolioData?.contests || { codechef: 8, codeforces: 10 };
  const awards = portfolioData?.awards || [
    { name: 'Star' }, { name: '100 Days' }, { name: 'Knight' }, { name: 'Contest' }, { name: 'Diamond' }
  ];

  const ratingHistory = portfolioData?.ratingHistory || [1500, 1520, 1550, 1600, 1625, 1670, 1718];
  const totalQuestions = portfolioData?.totalQuestions || '1229';
  const activeDays = portfolioData?.activeDays || '493';
  const globalRank = portfolioData?.globalRank || '2087';
  const maxRank = portfolioData?.maxRank || '1794';

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column */}
        <div className="md:col-span-3 space-y-6">
          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 flex flex-col items-center text-center shadow-sm">
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#116466] to-[#0d9488] mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <h2 className="font-bold text-xl text-gray-800">{userName}</h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{userBio}</p>
            <div className="mt-4 w-full">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <span className="text-sm font-medium text-gray-700">Location</span>
                <span className="text-xs text-gray-500">📍 India</span>
              </div>
            </div>
            <div className="mt-4 w-full flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 text-[#116466] border-[#116466]">
                <ExternalLink className="h-3 w-3 mr-1" /> GitHub
              </Button>
              <Button size="sm" variant="outline" className="flex-1 text-[#116466] border-[#116466]">
                <ExternalLink className="h-3 w-3 mr-1" /> LinkedIn
              </Button>
            </div>
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm">
            <div className="p-4 border-b bg-gray-50 rounded-t-xl">
              <h3 className="text-sm font-bold text-gray-700">Problem Solving Stats</h3>
            </div>
            <div className="p-3 divide-y">
              {platforms.map(p => <PlatformStatusRow key={p.name} {...p} />)}
            </div>
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-[#116466]" />
              <span className="text-sm font-bold text-gray-700">Leaderboard</span>
            </div>
            <div className="text-4xl font-bold text-[#116466] mb-1">{globalRank}</div>
            <div className="text-xs text-gray-600 mb-4">Global Rank <span className="text-[#116466] font-semibold">(Max {maxRank})</span></div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
              <div className="p-2 bg-gray-50 rounded">
                <div className="font-bold text-gray-800">21 Nov</div>
                <div className="text-gray-500 text-[10px]">Last Refresh</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="font-bold text-gray-800">{activeDays}</div>
                <div className="text-gray-500 text-[10px]">Active Days</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="font-bold text-gray-800">Public</div>
                <div className="text-gray-500 text-[10px]">Visibility</div>
              </div>
            </div>
            <Button variant="outline" className="w-full text-[#116466] border-[#116466] hover:bg-[#116466] hover:text-white font-semibold">
              View Leaderboard
            </Button>
          </div>
        </div>

        {/* Main Middle Column */}
        <div className="md:col-span-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total Questions" value={totalQuestions} icon={BarChart3} />
            <StatCard label="Total Active Days" value={activeDays} icon={TrendingUp} />
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-700">Contribution Activity</h3>
            </div>
            <Heatmap />
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Total Contests</h3>
              <span className="text-xs bg-[#116466]/10 text-[#116466] px-3 py-1 rounded-full font-semibold">{contests.codechef + contests.codeforces}</span>
            </div>

            <div className="flex gap-6 text-sm flex-wrap">
              <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
                <span className="h-3 w-3 rounded-full bg-orange-500" />
                <span className="font-medium text-gray-700">CodeChef</span>
                <span className="font-bold text-orange-600">{contests.codechef}</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                <span className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="font-medium text-gray-700">CodeForces</span>
                <span className="font-bold text-blue-600">{contests.codeforces}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Rating Progress</h3>
              <div className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                <span className="font-medium text-gray-600">14 Sept 2020</span>
                <span className="mx-1">•</span>
                <span className="font-semibold text-[#116466]">September Challenge 2020</span>
              </div>
            </div>
            <div className="h-64 relative bg-gradient-to-b from-gray-50 to-white rounded-lg p-4">
              {(() => {
                const data = ratingHistory;
                const W = 420, H = 200;
                const pad = { l: 36, r: 12, t: 16, b: 28 };
                const plotW = W - pad.l - pad.r;
                const plotH = H - pad.t - pad.b;
                const min = Math.min(...data);
                const max = Math.max(...data);
                const yMin = min - Math.max(10, Math.round((max - min) * 0.1));
                const yMax = max + Math.max(10, Math.round((max - min) * 0.1));
                const xScale = (i) => pad.l + (i / (data.length - 1)) * plotW;
                const yScale = (v) => pad.t + (1 - (v - yMin) / (yMax - yMin)) * plotH;
                const pathD = 'M ' + data.map((r, i) => `${xScale(i)},${yScale(r)}`).join(' L ');
                const areaD = pathD + ` L ${pad.l + plotW},${pad.t + plotH} L ${pad.l},${pad.t + plotH} Z`;
                const gridLines = Array.from({ length: 5 }).map((_, idx) => {
                  const y = pad.t + (idx / 4) * plotH;
                  const v = Math.round(yMax - (idx / 4) * (yMax - yMin));
                  return { y, v };
                });
                const delta = data.length > 1 ? data[data.length - 1] - data[data.length - 2] : 0;
                return (
                  <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="drop-shadow-sm">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#116466" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    {gridLines.map((g, i) => (
                      <g key={i}>
                        <line x1={pad.l} x2={pad.l + plotW} y1={g.y} y2={g.y} stroke="#e5e7eb" strokeDasharray="4 4" />
                        <text x={pad.l - 8} y={g.y + 4} textAnchor="end" fontSize="10" fill="#6b7280">{g.v}</text>
                      </g>
                    ))}
                    <line x1={pad.l} x2={pad.l + plotW} y1={pad.t + plotH} y2={pad.t + plotH} stroke="#e5e7eb" />
                    <path d={areaD} fill="url(#areaGradient)" />
                    <motion.path d={pathD} stroke="url(#lineGradient)" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: 'easeInOut' }} />
                    {data.map((r, i) => (
                      <g key={i}>
                        <circle cx={xScale(i)} cy={yScale(r)} r="4.5" fill="#116466" />
                        <title>{r}</title>
                      </g>
                    ))}
                    <g>
                      <rect x={W - 132} y={pad.t + 6} width="120" height="46" rx="8" fill="#ffffff" stroke="#e5e7eb" />
                      <text x={W - 72} y={pad.t + 26} textAnchor="middle" fontSize="16" fontWeight="700" fill="#116466">{data[data.length - 1]}</text>
                      <text x={W - 72} y={pad.t + 42} textAnchor="middle" fontSize="10" fill="#6b7280">
                        Current • {delta >= 0 ? '+' : ''}{delta}
                      </text>
                    </g>
                  </svg>
                );
              })()}
            </div>
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <Award className="h-5 w-5 text-[#116466]" />
                Awards
              </h3>
              <Button size="sm" variant="ghost" className="text-[#116466] font-semibold hover:bg-[#116466]/10">
                Show more →
              </Button>
            </div>
            <AwardBadges awards={awards} />
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-700">DSA Topic Analysis</h3>
            </div>
            <BarChart data={dsaTopics} />
            <div className="p-4 border-t bg-gray-50 text-center">
              <Button size="sm" variant="ghost" className="text-[#116466] font-semibold hover:bg-[#116466]/10">
                Show more →
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-3 space-y-6">
          <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-700">Problems Solved</h3>
            </div>
            <Donut value={problems.fundamentals.value} total={problems.fundamentals.total} label="Fundamentals" difficulty={problems.fundamentals.difficulty} />
            <Donut value={problems.dsa.value} total={problems.dsa.total} label="DSA" difficulty={problems.dsa.difficulty} color="#0f766e" />
            <Donut value={problems.cp.value} total={problems.cp.total} label="Competitive Programming" difficulty={problems.cp.difficulty} color="#0d9488" />
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#116466]" />
              Contest Rankings
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">CODECHEF</span>
                  <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded font-medium">Rank 1794</span>
                </div>
                <div className="text-3xl font-bold text-orange-600">1718</div>
                <div className="text-xs text-gray-600 mt-1">Max 1794</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">CODEFORCES</span>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded font-medium">Pupil</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">1375</div>
                <div className="text-xs text-gray-600 mt-1">Max 1643</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
