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
  const circumference = 2 * Math.PI * 45;
  const strokeDash = (pct / 100) * circumference;

  const difficultyColors = {
    Easy: '#22c55e',
    Medium: '#f59e0b',
    Hard: '#ef4444'
  };

  return (
    <div className="flex items-center justify-between p-6 border-b last:border-b-0">
      <div className="flex items-center gap-6">
        <svg width={120} height={120} className="shrink-0">
          <circle cx={60} cy={60} r={45} stroke="#e5e7eb" strokeWidth={14} fill="none" />
          <circle cx={60} cy={60} r={45} stroke={color} strokeWidth={14} fill="none"
            strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)" />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-[#116466]">{value}</text>
        </svg>
        <div>
          <div className="text-lg font-semibold text-gray-800">{label}</div>
          {difficulty && (
            <div className="flex gap-3 mt-2">
              {Object.entries(difficulty).map(([level, count]) => (
                <span key={level} className="text-sm font-medium" style={{ color: difficultyColors[level] }}>
                  {level}: {count}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="text-right shrink-0 min-w-[80px]">
        <div className="text-3xl font-bold text-[#116466] truncate">{pct}%</div>
        <div className="text-sm text-gray-500 truncate">of {total}</div>
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

const Heatmap = ({ activeDays = 0, months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'] }) => {
  // Generate more realistic heatmap based on active days
  const generateHeatmapData = () => {
    if (activeDays === 0) return Array.from({ length: 28 }).map(() => 0);
    
    // Distribute active days across the heatmap with some variation
    const avgPerDay = activeDays / 168; // 6 months * 28 days
    return Array.from({ length: 28 }).map(() => {
      const random = Math.random();
      if (random < 0.3) return 0; // 30% chance of no activity
      if (random < 0.6) return Math.min(4, Math.floor(avgPerDay * (0.5 + Math.random())));
      return Math.min(4, Math.floor(avgPerDay * (1 + Math.random())));
    });
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
                return <div key={i} className="h-2.5 w-2.5 rounded-sm hover:ring-2 ring-[#116466] transition-all cursor-pointer" style={{ background: shades[intensity] }} title={`${intensity} contributions`} />;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AwardBadges = ({ awards }) => {
  const platformBadges = {
    leetcode: { bg: '#FDB515', icon: '⚡', name: 'LeetCode' },
    codeforces: { bg: '#1F8ACB', icon: '🏆', name: 'Codeforces' },
    codechef: { bg: '#B3804A', icon: '👨‍🍳', name: 'CodeChef' },
    github: { bg: '#24292e', icon: '⭐', name: 'GitHub' },
    hackerrank: { bg: '#00EA64', icon: '💚', name: 'HackerRank' },
    atcoder: { bg: '#000000', icon: '⚔️', name: 'AtCoder' },
    geeksforgeeks: { bg: '#2F8D46', icon: '🎯', name: 'GeeksforGeeks' },
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
      {awards.map((a) => {
        const platformKey = a.name.toLowerCase().replace(/\s+/g, '');
        const badge = platformBadges[platformKey] || { bg: '#116466', icon: '✨', name: a.name };
        const isProfessional = a.category === 'professional' || a.isProfessional;
        
        return (
          <div key={a.name} className="group">
            <div className="relative bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              {/* Professional badge ribbon */}
              {isProfessional && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-[9px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <span>⭐</span>
                    <span>PRO</span>
                  </div>
                </div>
              )}
              
              {/* Platform badge */}
              <div className="flex flex-col items-center text-center">
                {/* Icon circle */}
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-3 shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: badge.bg }}
                >
                  {badge.icon}
                </div>
                
                {/* Platform name */}
                <h4 className="text-sm font-bold text-gray-800 mb-1 line-clamp-1">{badge.name}</h4>
                
                {/* Stats preview */}
                {a.stats && Object.keys(a.stats).length > 0 && (
                  <div className="w-full mt-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-gray-600">
                      <span className="font-semibold">{Object.values(a.stats)[0]}</span>
                      <span>{Object.keys(a.stats)[0]}</span>
                    </div>
                  </div>
                )}
                
                {/* Verified checkmark */}
                <div className="mt-2 flex items-center gap-1 text-[10px] text-teal-600 font-semibold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PortfolioPreview = React.forwardRef(({ portfolioData, userName = 'Your Name', userBio = 'Software Engineer', userAvatar = null }, ref) => {
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

  const contests = portfolioData?.contests || {};
  const totalContests = Object.values(contests).reduce((sum, val) => sum + (val || 0), 0);
  const contestEntries = Object.entries(contests).filter(([_, count]) => count > 0);
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
  const contributions = portfolioData?.contributions || 0;

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column */}
        <div className="md:col-span-3 space-y-6">
          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 flex flex-col items-center text-center shadow-sm">
            {/* Profile Avatar */}
            {userAvatar ? (
              <div className="h-28 w-28 rounded-full mb-4 overflow-hidden shadow-lg border-4 border-[#116466]">
                <img 
                  src={userAvatar} 
                  alt={userName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div class="h-full w-full bg-gradient-to-br from-[#116466] to-[#0d9488] flex items-center justify-center text-white text-3xl font-bold">${userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>`;
                  }}
                />
              </div>
            ) : (
              <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#116466] to-[#0d9488] mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            )}
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

        {/* Main Middle Column - Adjusted for better layout */}
        <div className="md:col-span-5 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total Questions" value={totalQuestions} icon={BarChart3} />
            <StatCard label="Total Active Days" value={activeDays} icon={TrendingUp} />
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Total Contests</h3>
              <span className="text-xs bg-[#116466]/10 text-[#116466] px-3 py-1 rounded-full font-semibold">
                {totalContests}
              </span>
            </div>

            <div className="flex gap-6 text-sm flex-wrap">
              {contestEntries.length > 0 ? (
                contestEntries.map(([platform, count]) => {
                  const platformColors = {
                    leetcode: { bg: 'bg-yellow-50', text: 'text-yellow-600', dot: 'bg-yellow-500' },
                    codechef: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500' },
                    codeforces: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
                    atcoder: { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500' },
                    hackerrank: { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' },
                  };
                  const platformNames = {
                    leetcode: 'LeetCode',
                    codechef: 'CodeChef',
                    codeforces: 'CodeForces',
                    atcoder: 'AtCoder',
                    hackerrank: 'HackerRank',
                  };
                  const colors = platformColors[platform] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-500' };
                  return (
                    <div key={platform} className={`flex items-center gap-2 ${colors.bg} px-3 py-2 rounded-lg`}>
                      <span className={`h-3 w-3 rounded-full ${colors.dot}`} />
                      <span className="font-medium text-gray-700">{platformNames[platform] || platform}</span>
                      <span className={`font-bold ${colors.text}`}>{count}</span>
                    </div>
                  );
                })
              ) : (
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
              <div className="h-72 relative bg-gradient-to-b from-gray-50 to-white rounded-lg p-4">
              {(() => {
                const data = ratingHistory;
                const W = 480, H = 240;
                const pad = { l: 50, r: 20, t: 30, b: 40 };
                const plotW = W - pad.l - pad.r;
                const plotH = H - pad.t - pad.b;
                const min = Math.min(...data);
                const max = Math.max(...data);
                const yMin = min - Math.max(10, Math.round((max - min) * 0.1));
                const yMax = max + Math.max(10, Math.round((max - min) * 0.1));
                const xScale = (i) => data.length > 1 ? pad.l + (i / (data.length - 1)) * plotW : pad.l + plotW / 2;
                const yScale = (v) => (yMax - yMin) > 0 ? pad.t + (1 - (v - yMin) / (yMax - yMin)) * plotH : pad.t + plotH / 2;
                const pathD = 'M ' + data.map((r, i) => `${xScale(i)},${yScale(r)}`).join(' L ');
                const areaD = pathD + ` L ${pad.l + plotW},${pad.t + plotH} L ${pad.l},${pad.t + plotH} Z`;
                const gridLines = Array.from({ length: 6 }).map((_, idx) => {
                  const y = pad.t + (idx / 5) * plotH;
                  const v = Math.round(yMax - (idx / 5) * (yMax - yMin));
                  return { y, v };
                });
                const delta = data.length > 1 ? data[data.length - 1] - data[data.length - 2] : 0;
                const currentRating = data[data.length - 1];
                return (
                  <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} className="drop-shadow-sm">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#116466" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    {gridLines.map((g, i) => (
                      <g key={i}>
                        <line x1={pad.l} x2={pad.l + plotW} y1={g.y} y2={g.y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 3" />
                        <text x={pad.l - 10} y={g.y + 4} textAnchor="end" fontSize="11" fill="#6b7280" fontWeight="500">{g.v}</text>
                      </g>
                    ))}
                    {/* X axis */}
                    <line x1={pad.l} x2={pad.l + plotW} y1={pad.t + plotH} y2={pad.t + plotH} stroke="#9ca3af" strokeWidth="2" />
                    {/* Y axis */}
                    <line x1={pad.l} x2={pad.l} y1={pad.t} y2={pad.t + plotH} stroke="#9ca3af" strokeWidth="2" />
                    {/* Area fill */}
                    <path d={areaD} fill="url(#areaGradient)" />
                    {/* Line */}
                    <motion.path d={pathD} stroke="url(#lineGradient)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: 'easeInOut' }} />
                    {/* Data points */}
                    {data.map((r, i) => (
                      <g key={i}>
                        <circle cx={xScale(i)} cy={yScale(r)} r="5" fill="#ffffff" stroke="#116466" strokeWidth="2" />
                        <title>Rating: {r}</title>
                      </g>
                    ))}
                    {/* Current rating badge */}
                    <g>
                      <rect x={W - 140} y={pad.t + 10} width="120" height="54" rx="10" fill="#ffffff" stroke="#116466" strokeWidth="2" />
                      <text x={W - 80} y={pad.t + 34} textAnchor="middle" fontSize="20" fontWeight="700" fill="#116466">{currentRating}</text>
                      <text x={W - 80} y={pad.t + 50} textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600">
                        Current ({delta >= 0 ? '+' : ''}{delta})
                      </text>
                    </g>
                    {/* Axis labels */}
                    <text x={pad.l + plotW / 2} y={H - 5} textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="600">Contest Timeline</text>
                    <text x="15" y={pad.t + plotH / 2} textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="600" transform={`rotate(-90 15 ${pad.t + plotH / 2})`}>Rating</text>
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
        </div>

        {/* Right Column - Wider for better visibility */}
        <div className="md:col-span-4 space-y-6">
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
});

PortfolioPreview.displayName = 'PortfolioPreview';

export default PortfolioPreview;
