import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, TrendingUp, TrendingDown, DollarSign, Package, BarChart3, FileText } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { cn } from "@/lib/utils";
import type { SalesRecord, InventoryItem, User, Expense } from "@shared/schema";
import TaxReports from "@/components/reports/tax-reports";

interface ReportMetrics {
  totalRevenue: string;
  totalProfit: string;
  totalSales: number;
  averageProfit: string;
  profitMargin: string;
  topSellingItems: Array<{
    title: string;
    quantity: number;
    revenue: string;
    profit: string;
  }>;
  salesByPlatform: Array<{
    platform: string;
    count: number;
    revenue: string;
  }>;
  monthlyTrends: Array<{
    month: string;
    sales: number;
    profit: string;
  }>;
}

const dateRangePresets = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "This month", value: "month" },
  { label: "Last 3 months", value: "3m" },
  { label: "This year", value: "year" },
  { label: "Custom range", value: "custom" }
];

export default function Reports() {
  const [dateRange, setDateRange] = useState("30d");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data: sales = [] } = useQuery<SalesRecord[]>({
    queryKey: ["/api/sales"],
  });

  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: reportMetrics } = useQuery<ReportMetrics>({
    queryKey: ["/api/reports/metrics", { dateRange, startDate, endDate, platform: selectedPlatform, category: selectedCategory }],
  });

  const getDateRangeForPreset = (preset: string) => {
    const now = new Date();
    switch (preset) {
      case "7d":
        return { start: subDays(now, 7), end: now };
      case "30d":
        return { start: subDays(now, 30), end: now };
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "3m":
        return { start: subDays(now, 90), end: now };
      case "year":
        return { start: startOfYear(now), end: endOfYear(now) };
      default:
        return { start: startDate, end: endDate };
    }
  };

  const handleExportReport = (format: "csv" | "pdf") => {
    const { start, end } = getDateRangeForPreset(dateRange);
    const params = new URLSearchParams({
      format,
      dateRange,
      ...(start && { startDate: start.toISOString() }),
      ...(end && { endDate: end.toISOString() }),
      ...(selectedPlatform !== "all" && { platform: selectedPlatform }),
      ...(selectedCategory !== "all" && { category: selectedCategory })
    });
    
    window.open(`/api/reports/export?${params}`);
  };

  const uniquePlatforms = Array.from(new Set(sales.map(sale => sale.platform).filter(Boolean)));
  const uniqueCategories = Array.from(new Set(inventory.map(item => item.category).filter(Boolean)));

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Reports" subtitle="Comprehensive analytics and insights for your business" />
        <div className="flex-1 overflow-y-auto p-6" style={{ paddingBottom: '150px' }}>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Customize your report parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRangePresets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <>
                <div>
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {uniquePlatforms.map((platform) => (
                    <SelectItem key={platform || "unknown"} value={platform || ""}>
                      {platform || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category || "unknown"} value={category || ""}>
                      {category || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${reportMetrics?.totalRevenue || "0.00"}</div>
            <p className="text-xs text-muted-foreground">
              From {reportMetrics?.totalSales || 0} sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${reportMetrics?.totalProfit || "0.00"}</div>
            <p className="text-xs text-muted-foreground">
              {reportMetrics?.profitMargin || "0"}% margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Profit</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${reportMetrics?.averageProfit || "0.00"}</div>
            <p className="text-xs text-muted-foreground">
              Per sale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Inventory</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">
              Items in stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
          <TabsTrigger value="platforms">Platform Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="taxes">Sales Tax</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Items</CardTitle>
                <CardDescription>Best performing products by quantity sold</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportMetrics?.topSellingItems?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.quantity} sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.revenue}</p>
                        <p className="text-sm text-green-600">+${item.profit}</p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-4">No sales data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>Latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sales.slice(0, 5).map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{sale.itemTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(sale.saleDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${sale.salePrice}</p>
                        <Badge variant={parseFloat(sale.profit) > 0 ? "default" : "destructive"}>
                          ${sale.profit}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {sales.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No sales recorded yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Summary</CardTitle>
              <CardDescription>Current inventory status and valuation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                      <Badge variant="outline">{item.condition}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.purchasePrice}</p>
                      <p className="text-sm text-muted-foreground">{item.platform}</p>
                    </div>
                  </div>
                ))}
                {inventory.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No inventory items found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>Sales breakdown by selling platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportMetrics?.salesByPlatform?.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <p className="font-medium">{platform.platform}</p>
                      <p className="text-sm text-muted-foreground">{platform.count} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${platform.revenue}</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground text-center py-4">No platform data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportMetrics?.monthlyTrends?.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <p className="font-medium">{trend.month}</p>
                      <p className="text-sm text-muted-foreground">{trend.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${trend.profit}</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground text-center py-4">No trend data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes" className="space-y-4">
          <TaxReports />
        </TabsContent>
      </Tabs>
        </div>
      </main>
    </div>
  );
}