import React, { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Pie chart for showing distribution/percentages
export const SimplePieChart = memo(function SimplePieChart({
  data,
  height = 300,
  showLegend = true,
  innerRadius = 0, // Set to > 0 for donut chart
}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className={`w-full flex items-center justify-center text-muted-foreground`} style={{ height }}>
        No data available
      </div>
    );
  }

  const COLORS = [
    'var(--chart-verified, #28cb8b)',
    'var(--chart-pending, #2196f3)',
    'var(--chart-rejected, #ef5350)',
    'var(--chart-active, #66bb6a)',
    'var(--chart-draft, #ffa726)',
    'var(--chart-closed, #78909c)',
  ];

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

export default SimplePieChart;
