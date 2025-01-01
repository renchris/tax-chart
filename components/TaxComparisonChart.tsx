'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calculateCanadianTax, calculateUSTax } from "@/lib/tax-rates";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

const generateDataPoints = () => {
  const dataPoints = [];
  for (let income = 0; income <= 200000; income += 5000) {
    const canadianTax = calculateCanadianTax(income, 'CAD');
    const usTax = calculateUSTax(income, 'CAD');
    
    dataPoints.push({
      income,
      canadianTotal: canadianTax.totalTax,
      canadianPercent: canadianTax.effectiveRate,
      canadianMarginal: canadianTax.marginalRate,
      usFederal: usTax.federalTax,
      usPercent: usTax.effectiveRate,
      usMarginal: usTax.marginalRate,
    });
  }
  return dataPoints;
};

const chartConfig = {
  amount: {
    label: "Tax Amount",
    color: "hsl(var(--chart-1))",
  },
  percentage: {
    label: "Effective Rate",
    color: "hsl(var(--chart-2))",
  },
  marginal: {
    label: "Marginal Rate",
    color: "hsl(var(--chart-3))",
  },
} as const;

type ViewType = 'amount' | 'percentage' | 'marginal';

const CustomTooltip = ({ active, payload, label, view }: any) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <div className="font-medium text-foreground">Annual Income: ${label.toLocaleString()}</div>
      <div className="grid gap-1.5">
        {payload.map((item: any, index: number) => {
          const value = view === 'amount' 
            ? `$${item.value.toLocaleString()}` 
            : `${item.value.toFixed(1)}%`;
          const percentage = view === 'amount' 
            ? ` (${((item.value / label) * 100).toFixed(1)}%)` 
            : '';
          const rateType = view === 'marginal' ? 'Marginal' : view === 'percentage' ? 'Effective' : '';
          return (
            <div key={index} className="flex flex-1 justify-between items-center gap-2">
              <div className="flex items-center gap-1">
                <div 
                  className="h-2 w-2 rounded-full" 
                  style={{ 
                    backgroundColor: item.name.includes('Canadian') ? '#ef4444' : '#3b82f6',
                    opacity: 0.8 
                  }} 
                />
                <span className="text-muted-foreground">
                  {item.name} {rateType}
                </span>
              </div>
              <span className="font-mono font-medium tabular-nums text-foreground">
                {value}{percentage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export function TaxComparisonChart() {
  const [view, setView] = useState<ViewType>('amount');
  const data = generateDataPoints();

  const totals = {
    amount: {
      canadian: data[data.length - 1].canadianTotal,
      us: data[data.length - 1].usFederal,
    },
    percentage: {
      canadian: data[data.length - 1].canadianPercent,
      us: data[data.length - 1].usPercent,
    },
    marginal: {
      canadian: data[data.length - 1].canadianMarginal,
      us: data[data.length - 1].usMarginal,
    },
  };

  const getDataKey = (system: 'canadian' | 'us') => {
    switch (view) {
      case 'amount':
        return system === 'canadian' ? 'canadianTotal' : 'usFederal';
      case 'percentage':
        return system === 'canadian' ? 'canadianPercent' : 'usPercent';
      case 'marginal':
        return system === 'canadian' ? 'canadianMarginal' : 'usMarginal';
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Tax Comparison</CardTitle>
          <CardDescription>Canada vs US Tax Systems (2024)</CardDescription>
        </div>
        <div className="flex">
          {(Object.keys(chartConfig) as Array<keyof typeof chartConfig>).map((key) => (
            <button
              key={key}
              data-active={view === key}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
              onClick={() => setView(key)}
            >
              <span className="text-xs text-muted-foreground">
                {chartConfig[key].label}
              </span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {key === 'amount' 
                  ? `$${totals[key].canadian.toLocaleString()}`
                  : `${totals[key].canadian.toFixed(1)}%`}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="canadianTax" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="usTax" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3"
                className="stroke-muted"
                vertical={false}
              />
              <XAxis 
                dataKey="income" 
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                className="text-sm text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                minTickGap={16}
                style={{ fontSize: '10px', userSelect: 'none' }}
              />
              <YAxis 
                tickFormatter={(value) => view === 'amount' ? `$${value.toLocaleString()}` : `${value}%`}
                className="text-sm text-muted-foreground"
                tickLine={false}
                axisLine={false}
                style={{ fontSize: '10px', userSelect: 'none' }}
                width={30}
              />
              <Tooltip content={(props) => <CustomTooltip {...props} view={view} />} />
              <Area
                type="monotone"
                dataKey={getDataKey('canadian')}
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#canadianTax)"
                name="Canadian Total Tax"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey={getDataKey('us')}
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#usTax)"
                name="US Federal Tax"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 