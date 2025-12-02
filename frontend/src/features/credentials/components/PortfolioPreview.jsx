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
  // Use provided data with fallbacks to empty/zero values
  const platforms = portfolioData?.platforms || [];
  const githubHandle = portfolioData?.githubHandle || null;
  const leetcodeHandle = portfolioData?.leetcodeHandle || null;

  const problems = portfolioData?.problems || {
    fundamentals: { value: 0, total: 300, difficulty: { Easy: 0, Medium: 0, Hard: 0 } },
    dsa: { value: 0, total: 1500, difficulty: { Easy: 0, Medium: 0, Hard: 0 } },
    cp: { value: 0, total: 250, difficulty: { Easy: 0, Medium: 0, Hard: 0 } },
  };

  const dsaTopics = portfolioData?.dsaTopics && portfolioData.dsaTopics.length > 0 
    ? portfolioData.dsaTopics 
    : [];

  const contests = portfolioData?.contests || { codechef: 0, codeforces: 0 };
  const awards = portfolioData?.awards || [];

  const ratingHistory = portfolioData?.ratingHistory && portfolioData.ratingHistory.length > 0 
    ? portfolioData.ratingHistory 
    : [0];
    
  const totalQuestions = portfolioData?.totalQuestions || 0;
  const activeDays = portfolioData?.activeDays || 0;
  const globalRank = portfolioData?.globalRank || 0;
  const maxRank = portfolioData?.maxRank || 0;
  const contestRating = portfolioData?.contestRating || 0;
  const maxContestRating = portfolioData?.maxContestRating || 0;
  const contestRank = portfolioData?.contestRank || 'N/A';

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column */}
        <div className="md:col-span-3 space-y-6">
          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 flex flex-col items-center text-center shadow-sm">
            <div className="h-28 w-28 rounded-full bg-linear-to-br from-[#116466] to-[#0d9488] mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
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
              {githubHandle && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 text-[#116466] border-[#116466]"
                  onClick={() => window.open(`https://github.com/${githubHandle}`, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" /> GitHub
                </Button>
              )}
              {leetcodeHandle && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 text-[#116466] border-[#116466]"
                  onClick={() => window.open(`https://leetcode.com/${leetcodeHandle}`, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" /> LeetCode
                </Button>
              )}
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
            <div className="text-4xl font-bold text-[#116466] mb-1">{globalRank || 'N/A'}</div>
            <div className="text-xs text-gray-600 mb-4">
              Global Rank {maxRank > 0 && <span className="text-[#116466] font-semibold">(Max {maxRank})</span>}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
              <div className="p-2 bg-gray-50 rounded">
                <div className="font-bold text-gray-800">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                <div className="text-gray-500 text-[10px]">Last Refresh</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="font-bold text-gray-800">{activeDays || 0}</div>
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
            {totalQuestions > 0 ? (
              <Heatmap />
            ) : (
              <div className="p-6 text-center text-sm text-gray-500">
                No contribution data available yet
              </div>
            )}
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Total Contests</h3>
              <span className="text-xs bg-[#116466]/10 text-[#116466] px-3 py-1 rounded-full font-semibold">
                {(contests.codechef || 0) + (contests.codeforces || 0)}
              </span>
            </div>

            <div className="flex gap-6 text-sm flex-wrap">
              {contests.codechef > 0 && (
                <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
                  <span className="h-3 w-3 rounded-full bg-orange-500" />
                  <span className="font-medium text-gray-700">CodeChef</span>
                  <span className="font-bold text-orange-600">{contests.codechef}</span>
                </div>
              )}
              {contests.codeforces > 0 && (
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                  <span className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="font-medium text-gray-700">CodeForces</span>
                  <span className="font-bold text-blue-600">{contests.codeforces}</span>
                </div>
              )}
              {contests.codechef === 0 && contests.codeforces === 0 && (
                <div className="text-sm text-gray-500">No contest data available</div>
              )}
            </div>
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Rating Progress</h3>
              {contestRating > 0 && (
                <div className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                  <span className="font-medium text-gray-600">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="mx-1">•</span>
                  <span className="font-semibold text-[#116466]">Latest Update</span>
                </div>
              )}
            </div>
            {ratingHistory.length > 0 && ratingHistory[0] > 0 ? (
              <div className="h-64 relative bg-linear-to-b from-gray-50 to-white rounded-lg p-4">
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
            ) : (
              <div className="p-6 text-center text-sm text-gray-500">
                No rating progress data available yet
              </div>
            )}
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <Award className="h-5 w-5 text-[#116466]" />
                Achievements
              </h3>
            </div>
            {awards.length > 0 ? (
              <AwardBadges awards={awards} />
            ) : (
              <div className="p-6 text-center text-sm text-gray-500">
                No achievements yet. Keep solving!
              </div>
            )}
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-700">DSA Topic Analysis</h3>
            </div>
            {dsaTopics.length > 0 ? (
              <>
                <BarChart data={dsaTopics} />
                <div className="p-4 border-t bg-gray-50 text-center">
                  <div className="text-xs text-gray-600">Based on {totalQuestions} total problems solved</div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-sm text-gray-500">
                No topic data available yet
              </div>
            )}
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
              {contestRating > 0 || maxContestRating > 0 ? (
                <>
                  {maxContestRating > 0 && (
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">CONTEST RATING</span>
                        <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded font-medium">
                          {contestRank}
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-orange-600">{contestRating || 0}</div>
                      <div className="text-xs text-gray-600 mt-1">Max {maxContestRating}</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border text-center text-sm text-gray-500">
                  No contest rating data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
