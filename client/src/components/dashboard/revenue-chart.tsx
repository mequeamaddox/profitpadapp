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

export default function RevenueChart() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const chartData = {
    labels: metrics?.revenueData?.map((item: any) => item.month) || [],
    datasets: [
      {
        label: "Revenue",
        data: metrics?.revenueData?.map((item: any) => item.revenue) || [],
        borderColor: "hsl(221 83% 53%)",
        backgroundColor: "hsla(221, 83%, 53%, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "hsl(221 83% 53%)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Revenue: $${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "hsl(var(--border) / 0.3)",
        },
        ticks: {
          color: "hsl(var(--muted-foreground))",
          callback: function(value: any) {
            return "$" + value.toLocaleString();
          },
        },
      },
      x: {
        grid: {
          color: "hsl(var(--border) / 0.2)",
        },
        ticks: {
          color: "hsl(var(--muted-foreground))",
        },
      },
    },
  };

  return (
    <Card className="card-premium animate-fadeInUp" style={{ animationDelay: '200ms' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span className="text-foreground">Monthly Revenue</span>
            {!isLoading && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 gradient-primary rounded-full animate-pulse shadow-sm"></div>
                <span className="text-xs text-muted-foreground">Live Data</span>
              </div>
            )}
          </CardTitle>
          <Select defaultValue="12months">
            <SelectTrigger className="w-40">
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
        <div className="h-64">
          {isLoading ? (
            <div className="h-full relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
              {/* Animated shimmer overlay */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              
              {/* Chart placeholder with animated bars */}
              <div className="p-6 h-full flex flex-col justify-end">
                <div className="flex items-end justify-between h-full space-x-2">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end">
                      <div 
                        className="bg-gradient-to-t from-blue-200 to-blue-300 rounded-t animate-pulse-soft w-full"
                        style={{ 
                          height: `${Math.random() * 80 + 20}%`,
                          animationDelay: `${i * 100}ms`
                        }}
                      ></div>
                    </div>
                  ))}
                </div>
                
                {/* Axis labels placeholder */}
                <div className="flex justify-between mt-4 text-xs text-slate-400">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                    <span key={month} className="animate-pulse" style={{ animationDelay: `${i * 50}ms` }}>
                      {month}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-bounceIn">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
