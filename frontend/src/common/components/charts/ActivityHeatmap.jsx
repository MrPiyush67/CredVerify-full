import React, { memo } from 'react';

function groupByWeeks(data) {
  // Ensure data is sorted oldest -> newest
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) return [];

  // Pad start so first column begins on Sunday (0) to match typical heatmaps
  const firstDate = new Date(sorted[0].date + 'T00:00:00');
  const pad = firstDate.getDay(); // 0..6
  const padded = [];
  for (let i = 0; i < pad; i++) {
    const d = new Date(firstDate);
    d.setDate(firstDate.getDate() - (pad - i));
    padded.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  const full = [...padded, ...sorted];

  // Build week columns (each 7 days)
  const weeks = [];
  for (let i = 0; i < full.length; i += 7) {
    weeks.push(full.slice(i, i + 7));
  }
  return weeks;
}

function getColor(count) {
  // Simple color scale without CSS variables
  const colors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];
  const level = Math.max(0, Math.min(4, count));
  return colors[level];
}

export const ActivityHeatmap = memo(function ActivityHeatmap({ data = [], className = '', title }) {
  const weeks = React.useMemo(() => {
    return groupByWeeks(data);
  }, [data]);

  if (weeks.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        {title ? <h3 className="text-sm font-medium">{title}</h3> : null}
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          No activity data available
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {title ? <h3 className="text-sm font-medium">{title}</h3> : null}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} activity`}
                aria-label={`${day.date}: ${day.count} activity`}
                className="h-3 w-3 rounded-[3px] border border-gray-200 dark:border-gray-700"
                style={{ backgroundColor: getColor(day.count) }}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="text-muted-foreground text-xs">Darker squares indicate more activity (last 12 months)</p>
    </div>
  );
});

export default ActivityHeatmap;
