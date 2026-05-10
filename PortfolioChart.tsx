import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const timeframes = [
  { label: '1H', value: '1h' },
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '1Y', value: '1y' },
];

// Mock chart data
const chartData = {
  '1h': Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 5}m`,
    value: 10000 + Math.random() * 500 - 250,
  })),
  '24h': Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: 10000 + Math.random() * 1000 - 500,
  })),
  '7d': Array.from({ length: 7 }, (_, i) => ({
    time: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    value: 10000 + Math.random() * 2000 - 1000,
  })),
  '30d': Array.from({ length: 30 }, (_, i) => ({
    time: `${i + 1}`,
    value: 10000 + Math.random() * 3000 - 1500,
  })),
  '1y': Array.from({ length: 12 }, (_, i) => ({
    time: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    value: 8000 + Math.random() * 4000,
  })),
};

const pieData = [
  { name: 'SOL', value: 45, color: 'hsl(var(--primary))' },
  { name: 'USDC', value: 25, color: 'hsl(var(--accent))' },
  { name: 'RAY', value: 15, color: 'hsl(var(--warning))' },
  { name: 'Others', value: 15, color: 'hsl(var(--muted))' },
];

export const PortfolioChart = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [chartType, setChartType] = useState<'line' | 'pie'>('line');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Portfolio Performance Chart */}
      <Card className="portfolio-card lg:col-span-2">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Portfolio Performance</h3>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
              >
                Performance
              </Button>
              <Button
                variant={chartType === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('pie')}
              >
                Allocation
              </Button>
            </div>
          </div>
          
          {chartType === 'line' && (
            <div className="flex items-center space-x-2">
              {timeframes.map((timeframe) => (
                <Button
                  key={timeframe.value}
                  variant={selectedTimeframe === timeframe.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe.value)}
                  className="text-xs"
                >
                  {timeframe.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          {chartType === 'line' ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData[selectedTimeframe as keyof typeof chartData]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Portfolio Allocation */}
      <Card className="portfolio-card">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6">Asset Allocation</h3>
          
          <div className="space-y-4">
            {pieData.map((asset, index) => (
              <div key={asset.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: asset.color }}
                  />
                  <span className="font-medium">{asset.name}</span>
                </div>
                <Badge variant="outline">
                  {asset.value}%
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-success">+12.5%</div>
                <div className="text-xs text-muted-foreground">This month</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">4</div>
                <div className="text-xs text-muted-foreground">Assets</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
