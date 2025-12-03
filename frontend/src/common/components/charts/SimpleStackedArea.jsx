import React, { memo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

// Colors come from CSS variables defined in index.css: --chart-<key>
export const SimpleStackedArea = memo(function SimpleStackedArea({
  data,
  height = 256,
  showGrid = true,
  showLegend = true,
  stackId = '1',
  fillOpacity = 0.5,
}) {
  // Safety check for data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className={`w-full flex items-center justify-center text-muted-foreground`} style={{ height }}>
        No data available
      </div>
    );
  }

  // Numeric series keys (exclude label/domain key 'name' and 'total')
  const dataKeys = Object.keys(data[0]).filter(
    (key) => key !== 'name' && key !== 'total' && typeof data[0][key] === 'number'
  );

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          {showLegend && <Legend />}
          {dataKeys.map((key) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId={stackId}
              stroke={`var(--chart-${key}, var(--chart-verified))`}
              fill={`var(--chart-${key}, var(--chart-verified))`}
              fillOpacity={fillOpacity}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

export default SimpleStackedArea;
