import React, { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

// Bar chart for comparing discrete values
export const SimpleBarChart = memo(function SimpleBarChart({
  data,
  height = 256,
  showGrid = true,
  showLegend = true,
  stacked = false,
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
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          {showLegend && <Legend />}
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              stackId={stacked ? 'stack' : undefined}
              fill={`var(--chart-${key}, hsl(${index * 60}, 70%, 50%))`}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default SimpleBarChart;
