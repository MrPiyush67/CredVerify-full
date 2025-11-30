import React, { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

// Line chart for showing trends without stacking
export const SimpleLineChart = memo(function SimpleLineChart({
  data,
  height = 256,
  showGrid = true,
  showLegend = true,
  smooth = true,
}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className={`w-full flex items-center justify-center text-muted-foreground`} style={{ height }}>
        No data available
      </div>
    );
  }

  const dataKeys = Object.keys(data[0]).filter(
    (key) => key !== 'name' && key !== 'total' && typeof data[0][key] === 'number'
  );

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          {showLegend && <Legend />}
          {dataKeys.map((key) => (
            <Line
              key={key}
              type={smooth ? 'monotone' : 'linear'}
              dataKey={key}
              stroke={`var(--chart-${key}, var(--chart-verified))`}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export default SimpleLineChart;
