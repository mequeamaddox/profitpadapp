import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Line } from "react-chartjs-2";
import { DashboardMetrics } from "@shared/schema";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RANGES: Record<string, number> = { "12months": 12, "6months": 6, "3months": 3 };
const BRAND = "158 72% 32%";
const AXIS = "hsl(158 6% 45%)";
const FONT = "Plus Jakarta Sans";

export default function RevenueChart() {
  const [range, setRange] = useState("12months");
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const points = (metrics?.revenueData || []).slice(-RANGES[range]);
  const total = points.reduce((acc: number, item: any) => acc + (Number(item.revenue) || 0), 0);

  const chartData = {
    labels: points.map((item: any) => item.month),
    datasets: [
      {
        label: "Revenue",
        data: points.map((item: any) => item.revenue),
        borderColor: `hsl(${BRAND})`,
        backgroundColor: (ctx: any) => {
          const area = ctx.chart.chartArea;
          if (!area) return `hsl(${BRAND} / 0.1)`;
          const gradient = ctx.chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
          gradient.addColorStop(0, `hsl(${BRAND} / 0.25)`);
          gradient.addColorStop(1, `hsl(${BRAND} / 0)`);
          return gradient;
        },
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderWidth: 2.5,
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "hsl(165 28% 9%)",
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        titleFont: { family: FONT, weight: 600 as const },
        bodyFont: { family: FONT },
        callbacks: {
          label: (context: any) => `Revenue: $${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: "hsl(150 10% 91%)" },
        ticks: {
          color: AXIS,
          font: { family: FONT, size: 11 },
          maxTicksLimit: 5,
          callback: (value: any) => "$" + value.toLocaleString(),
        },
      },
      x: {
        border: { display: false },
        grid: { display: false },
        ticks: { color: AXIS, font: { family: FONT, size: 11 }, maxRotation: 0, autoSkipPadding: 8 },
      },
    },
  };

  return (
    <Card className="animate-fadeInUp h-full" style={{ animationDelay: "120ms" }}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Revenue</CardTitle>
            <p className="tabular mt-2 text-2xl font-extrabold tracking-tight">
              ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              <span className="ml-2 hidden text-sm font-medium text-muted-foreground sm:inline">
                last {RANGES[range]} months
              </span>
            </p>
          </div>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="h-9 w-[7.5rem] text-xs sm:w-36 sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12months">Last 12 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 md:h-72">
          {isLoading ? (
            <div className="h-full animate-pulse rounded-lg bg-muted" />
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
