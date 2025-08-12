import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, DollarSign, Percent } from "lucide-react";

interface ProfitCalculation {
  revenue: number;
  totalCosts: number;
  profit: number;
  profitMargin: number;
  roi: number;
}

export default function ProfitEstimator() {
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [platformFees, setPlatformFees] = useState("");
  const [otherExpenses, setOtherExpenses] = useState("");
  const [platform, setPlatform] = useState("");
  const [calculation, setCalculation] = useState<ProfitCalculation | null>(null);

  // Platform fee rates
  const platformFeeRates = {
    ebay: 0.1295, // 12.95% final value fee
    amazon: 0.15, // 15% referral fee
    mercari: 0.10, // 10% selling fee
    poshmark: 0.20, // 20% commission
    depop: 0.10, // 10% fee
    facebook: 0.05, // 5% selling fee
    vinted: 0.09, // 9% buyer protection fee
    other: 0.10 // Default 10%
  };

  const calculateProfit = () => {
    const purchase = parseFloat(purchasePrice) || 0;
    const selling = parseFloat(sellingPrice) || 0;
    const shipping = parseFloat(shippingCost) || 0;
    const fees = parseFloat(platformFees) || 0;
    const other = parseFloat(otherExpenses) || 0;

    // Auto-calculate platform fees if platform is selected and no manual fee entered
    let calculatedFees = fees;
    if (platform && !fees && selling > 0) {
      const feeRate = platformFeeRates[platform as keyof typeof platformFeeRates] || 0.10;
      calculatedFees = selling * feeRate;
    }

    const totalCosts = purchase + shipping + calculatedFees + other;
    const profit = selling - totalCosts;
    const profitMargin = selling > 0 ? (profit / selling) * 100 : 0;
    const roi = purchase > 0 ? (profit / purchase) * 100 : 0;

    setCalculation({
      revenue: selling,
      totalCosts,
      profit,
      profitMargin,
      roi
    });
  };

  const resetCalculator = () => {
    setPurchasePrice("");
    setSellingPrice("");
    setShippingCost("");
    setPlatformFees("");
    setOtherExpenses("");
    setPlatform("");
    setCalculation(null);
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return "text-green-600";
    if (profit < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getProfitBadgeVariant = (profitMargin: number) => {
    if (profitMargin >= 30) return "default"; // Good profit
    if (profitMargin >= 15) return "secondary"; // OK profit
    if (profitMargin >= 5) return "outline"; // Low profit
    return "destructive"; // Loss or very low profit
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Calculator className="h-6 w-6 text-primary" />
            <CardTitle>Profit Estimator</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Calculator</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Item Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sellingPrice">Selling Price ($)</Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ebay">eBay (12.95%)</SelectItem>
                        <SelectItem value="amazon">Amazon (15%)</SelectItem>
                        <SelectItem value="mercari">Mercari (10%)</SelectItem>
                        <SelectItem value="poshmark">Poshmark (20%)</SelectItem>
                        <SelectItem value="depop">Depop (10%)</SelectItem>
                        <SelectItem value="facebook">Facebook (5%)</SelectItem>
                        <SelectItem value="vinted">Vinted (9%)</SelectItem>
                        <SelectItem value="other">Other (10%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingCost">Shipping Cost ($)</Label>
                    <Input
                      id="shippingCost"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platformFees">Platform Fees ($)</Label>
                    <Input
                      id="platformFees"
                      type="number"
                      step="0.01"
                      placeholder="Auto-calculated if platform selected"
                      value={platformFees}
                      onChange={(e) => setPlatformFees(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otherExpenses">Other Expenses ($)</Label>
                    <Input
                      id="otherExpenses"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={otherExpenses}
                      onChange={(e) => setOtherExpenses(e.target.value)}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={calculateProfit} className="flex-1">
                      Calculate Profit
                    </Button>
                    <Button variant="outline" onClick={resetCalculator}>
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Profit Analysis</h3>
                  
                  {calculation ? (
                    <div className="space-y-4">
                      <Card className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Revenue</span>
                            <span className="font-semibold">${calculation.revenue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Costs</span>
                            <span className="font-semibold">${calculation.totalCosts.toFixed(2)}</span>
                          </div>
                          <hr />
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Net Profit</span>
                            <span className={`font-bold text-lg ${getProfitColor(calculation.profit)}`}>
                              ${calculation.profit.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </Card>

                      <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <Percent className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Profit Margin</span>
                          </div>
                          <div className="space-y-2">
                            <div className="text-2xl font-bold">{calculation.profitMargin.toFixed(1)}%</div>
                            <Badge variant={getProfitBadgeVariant(calculation.profitMargin)}>
                              {calculation.profitMargin >= 30 ? "Excellent" :
                               calculation.profitMargin >= 15 ? "Good" :
                               calculation.profitMargin >= 5 ? "Fair" : "Poor"}
                            </Badge>
                          </div>
                        </Card>

                        <Card className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">ROI</span>
                          </div>
                          <div className="space-y-2">
                            <div className="text-2xl font-bold">{calculation.roi.toFixed(1)}%</div>
                            <Badge variant={getProfitBadgeVariant(calculation.roi)}>
                              {calculation.roi >= 50 ? "Excellent" :
                               calculation.roi >= 25 ? "Good" :
                               calculation.roi >= 10 ? "Fair" : "Poor"}
                            </Badge>
                          </div>
                        </Card>
                      </div>

                      {/* Recommendations */}
                      <Card className="p-4 bg-blue-50">
                        <h4 className="font-semibold mb-2 text-blue-900">Recommendations</h4>
                        <div className="space-y-1 text-sm text-blue-800">
                          {calculation.profitMargin < 15 && (
                            <p>• Consider increasing the selling price or finding a lower-cost source</p>
                          )}
                          {calculation.profitMargin > 50 && (
                            <p>• Excellent profit margin! This item has strong potential</p>
                          )}
                          {calculation.profit < 0 && (
                            <p>• This item would result in a loss. Reconsider the purchase or pricing</p>
                          )}
                          {calculation.roi > 100 && (
                            <p>• Outstanding ROI! This is a highly profitable investment</p>
                          )}
                        </div>
                      </Card>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <div className="text-center">
                        <Calculator className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Enter item details and click "Calculate Profit" to see analysis</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Break-even Analysis */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Break-even Price
                  </h4>
                  {calculation && (
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-primary">
                        ${calculation.totalCosts.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Minimum selling price to break even
                      </p>
                    </div>
                  )}
                </Card>

                {/* Profit per Hour */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Time Investment</h4>
                  <div className="space-y-2">
                    <Label htmlFor="timeSpent">Hours spent (sourcing, listing, etc.)</Label>
                    <Input
                      id="timeSpent"
                      type="number"
                      step="0.5"
                      placeholder="2.0"
                    />
                    {calculation && (
                      <p className="text-sm text-gray-600 mt-2">
                        Profit per hour: ${(calculation.profit / 2).toFixed(2)}
                      </p>
                    )}
                  </div>
                </Card>

                {/* Profit Goals */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Target Analysis</h4>
                  <div className="space-y-2">
                    <Label htmlFor="targetMargin">Target Profit Margin (%)</Label>
                    <Input
                      id="targetMargin"
                      type="number"
                      placeholder="30"
                    />
                    {calculation && (
                      <p className="text-sm text-gray-600 mt-2">
                        Current: {calculation.profitMargin.toFixed(1)}%
                      </p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Market Comparison */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Market Insights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Platform Comparison</h5>
                    <div className="space-y-2 text-sm">
                      {Object.entries(platformFeeRates).map(([platform, rate]) => (
                        <div key={platform} className="flex justify-between">
                          <span className="capitalize">{platform === 'other' ? 'Other platforms' : platform}</span>
                          <span>{(rate * 100).toFixed(2)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Profit Benchmarks</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Excellent margin</span>
                        <span className="text-green-600">30%+</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Good margin</span>
                        <span className="text-blue-600">15-30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fair margin</span>
                        <span className="text-yellow-600">5-15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Poor margin</span>
                        <span className="text-red-600">&lt;5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}