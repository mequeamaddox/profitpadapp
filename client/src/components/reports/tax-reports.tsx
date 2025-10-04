import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, Calculator, DollarSign, FileText, TrendingUp } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { cn } from "@/lib/utils";
import { type SalesRecord, type User } from "@shared/schema";

export default function TaxReports() {
  const [dateRange, setDateRange] = useState("currentMonth");
  const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(new Date()));

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data: sales = [] } = useQuery<SalesRecord[]>({
    queryKey: ["/api/sales"],
  });

  // Calculate tax estimations based on date range
  const calculateTaxEstimates = () => {
    if (!user?.salesTaxRate || parseFloat(user.salesTaxRate) === 0) {
      return {
        totalSales: 0,
        totalTaxCollected: 0,
        totalTaxBase: 0,
        salesCount: 0,
        averageTaxPerSale: 0,
        estimatedTaxLiability: 0,
      };
    }

    const taxRate = parseFloat(user.salesTaxRate);
    const taxInclusive = user.taxInclusiveSales;

    // Filter sales by date range
    const filteredSales = sales.filter((sale) => {
      const saleDate = new Date(sale.saleDate);
      return (!startDate || saleDate >= startDate) && (!endDate || saleDate <= endDate);
    });

    let totalSales = 0;
    let totalTaxCollected = 0;
    let totalTaxBase = 0;

    filteredSales.forEach((sale) => {
      const salePrice = parseFloat(sale.salePrice);
      totalSales += salePrice;

      // Use recorded tax amount if available, otherwise calculate
      if (sale.salesTaxAmount && parseFloat(sale.salesTaxAmount) > 0) {
        totalTaxCollected += parseFloat(sale.salesTaxAmount);
        if (sale.taxIncluded) {
          totalTaxBase += salePrice - parseFloat(sale.salesTaxAmount);
        } else {
          totalTaxBase += salePrice;
        }
      } else {
        // Estimate tax based on user settings
        if (taxInclusive) {
          const taxAmount = salePrice - (salePrice / (1 + taxRate));
          totalTaxCollected += taxAmount;
          totalTaxBase += salePrice - taxAmount;
        } else {
          const taxAmount = salePrice * taxRate;
          totalTaxCollected += taxAmount;
          totalTaxBase += salePrice;
          totalSales += taxAmount; // Add tax to total when tax-exclusive
        }
      }
    });

    return {
      totalSales,
      totalTaxCollected,
      totalTaxBase,
      salesCount: filteredSales.length,
      averageTaxPerSale: filteredSales.length > 0 ? totalTaxCollected / filteredSales.length : 0,
      estimatedTaxLiability: totalTaxCollected,
    };
  };

  const taxEstimates = calculateTaxEstimates();

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    const now = new Date();
    
    switch (value) {
      case "last7Days":
        setStartDate(subDays(now, 7));
        setEndDate(now);
        break;
      case "last30Days":
        setStartDate(subDays(now, 30));
        setEndDate(now);
        break;
      case "currentMonth":
        setStartDate(startOfMonth(now));
        setEndDate(endOfMonth(now));
        break;
      case "currentYear":
        setStartDate(startOfYear(now));
        setEndDate(endOfYear(now));
        break;
      case "custom":
        // Keep current dates for custom range
        break;
    }
  };

  const exportTaxReport = () => {
    const reportData = [
      ["Tax Report", ""],
      ["Report Period", `${format(startDate!, "MMM dd, yyyy")} - ${format(endDate!, "MMM dd, yyyy")}`],
      ["Tax Rate", `${(parseFloat(user?.salesTaxRate || "0") * 100).toFixed(2)}%`],
      ["Tax Method", user?.taxInclusiveSales ? "Tax-Inclusive" : "Tax-Exclusive"],
      [""],
      ["Summary", ""],
      ["Total Sales", `$${taxEstimates.totalSales.toFixed(2)}`],
      ["Taxable Base", `$${taxEstimates.totalTaxBase.toFixed(2)}`],
      ["Total Tax Collected", `$${taxEstimates.totalTaxCollected.toFixed(2)}`],
      ["Number of Sales", taxEstimates.salesCount.toString()],
      ["Average Tax per Sale", `$${taxEstimates.averageTaxPerSale.toFixed(2)}`],
      [""],
      ["Detailed Sales", ""],
      ["Date", "Item", "Sale Price", "Tax Amount", "Tax Base"],
    ];

    // Add filtered sales data
    const filteredSales = sales.filter((sale) => {
      const saleDate = new Date(sale.saleDate);
      return (!startDate || saleDate >= startDate) && (!endDate || saleDate <= endDate);
    });

    filteredSales.forEach((sale) => {
      const salePrice = parseFloat(sale.salePrice);
      let taxAmount = 0;
      let taxBase = 0;

      if (sale.salesTaxAmount && parseFloat(sale.salesTaxAmount) > 0) {
        taxAmount = parseFloat(sale.salesTaxAmount);
        taxBase = sale.taxIncluded ? salePrice - taxAmount : salePrice;
      } else {
        const taxRate = parseFloat(user?.salesTaxRate || "0");
        if (user?.taxInclusiveSales) {
          taxAmount = salePrice - (salePrice / (1 + taxRate));
          taxBase = salePrice - taxAmount;
        } else {
          taxAmount = salePrice * taxRate;
          taxBase = salePrice;
        }
      }

      reportData.push([
        format(new Date(sale.saleDate), "MM/dd/yyyy"),
        sale.itemTitle || "Unknown Item",
        `$${salePrice.toFixed(2)}`,
        `$${taxAmount.toFixed(2)}`,
        `$${taxBase.toFixed(2)}`,
      ]);
    });

    // Convert to CSV and download
    const csvContent = reportData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tax-report-${format(startDate!, "yyyy-MM-dd")}-to-${format(endDate!, "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (!user?.salesTaxRate || parseFloat(user.salesTaxRate) === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sales Tax Not Configured</h3>
          <p className="text-gray-500 mb-4">
            Configure your sales tax rate in Settings to view tax estimations and reports.
          </p>
          <Button onClick={() => window.location.href = '/settings'}>
            Go to Settings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Report Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label htmlFor="dateRange">Quick Select</Label>
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7Days">Last 7 Days</SelectItem>
                  <SelectItem value="last30Days">Last 30 Days</SelectItem>
                  <SelectItem value="currentMonth">Current Month</SelectItem>
                  <SelectItem value="currentYear">Current Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                    {startDate ? format(startDate, "MMM dd, yyyy") : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
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
                    {endDate ? format(endDate, "MMM dd, yyyy") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button onClick={exportTaxReport} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tax Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${taxEstimates.totalTaxCollected.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Estimated tax liability for period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxable Sales Base</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${taxEstimates.totalTaxBase.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Sales amount before tax
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${taxEstimates.totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {taxEstimates.salesCount} sales transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Tax per Sale</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${taxEstimates.averageTaxPerSale.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Tax rate: {(parseFloat(user.salesTaxRate) * 100).toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Tax Settings</CardTitle>
          <CardDescription>
            Your current sales tax configuration used for calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Tax Rate:</strong> {(parseFloat(user.salesTaxRate) * 100).toFixed(4)}%
            </div>
            <div>
              <strong>Tax Method:</strong> {user.taxInclusiveSales ? "Tax-Inclusive" : "Tax-Exclusive"}
            </div>
            <div>
              <strong>Calculation:</strong> {user.taxInclusiveSales 
                ? "Tax is included in sale prices" 
                : "Tax is added on top of sale prices"}
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Important Tax Notes</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• These are estimates based on your sales data and tax settings</p>
              <p>• Consult with a tax professional for accurate tax filing guidance</p>
              <p>• Some sales platforms may collect and remit taxes automatically</p>
              <p>• Keep detailed records and receipts for all business transactions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}