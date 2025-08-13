import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp, AlertTriangle, Target, Package } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DashboardMetrics, Pallet, InventoryItem } from "@shared/schema";

interface BreakEvenData {
  totalInvestment: number;
  currentProfit: number;
  remainingToBreakEven: number;
  breakEvenPercentage: number;
  projectedBreakEvenDays: number;
  averageDailyProfit: number;
}

interface PalletBreakEven {
  pallet: Pallet;
  totalCost: number;
  itemsSold: number;
  totalItems: number;
  currentProfit: number;
  remainingToBreakEven: number;
  breakEvenPercentage: number;
  items: InventoryItem[];
}

export default function BreakEvenAnalysis() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: pallets = [] } = useQuery<Pallet[]>({
    queryKey: ["/api/pallets"],
  });

  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Break-Even Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-8 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Break-Even Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">
            No data available for analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalInvestment = parseFloat(metrics.inventoryValue?.totalInvestment || "0");
  const currentProfit = parseFloat(metrics.totalProfit || "0");
  const remainingToBreakEven = Math.max(0, totalInvestment - currentProfit);
  const breakEvenPercentage = totalInvestment > 0 ? (currentProfit / totalInvestment) * 100 : 0;
  
  // Estimate break-even timeline based on recent sales trend
  const recentSales = metrics.recentSales || [];
  const last30DaysProfit = recentSales
    .filter(sale => {
      const saleDate = new Date(sale.saleDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return saleDate >= thirtyDaysAgo;
    })
    .reduce((sum, sale) => sum + parseFloat(sale.profit || "0"), 0);
  
  const averageDailyProfit = last30DaysProfit / 30;
  const projectedBreakEvenDays = averageDailyProfit > 0 ? Math.ceil(remainingToBreakEven / averageDailyProfit) : 0;

  const breakEvenData: BreakEvenData = {
    totalInvestment,
    currentProfit,
    remainingToBreakEven,
    breakEvenPercentage: Math.min(100, breakEvenPercentage),
    projectedBreakEvenDays,
    averageDailyProfit,
  };

  const isBreakEvenReached = currentProfit >= totalInvestment;

  // Separate inventory into pallet-based and individual purchases
  const palletLinkedItems = inventory.filter(item => item.palletId);
  const individualItems = inventory.filter(item => !item.palletId);

  // Calculate pallet-specific break-even data - ONLY use pallet-linked inventory
  const palletBreakEvens: PalletBreakEven[] = pallets.map(pallet => {
    // Get ONLY items that are explicitly linked to this pallet via palletId
    const palletItems = inventory.filter(item => item.palletId === pallet.id);
    
    console.log(`Pallet ${pallet.name}: Found ${palletItems.length} linked items out of ${inventory.length} total inventory items`);
    
    // Use pallet's total items (from pallet creation) and linked items for sold count
    const totalItems = pallet.totalItems || 0;
    const soldItems = palletItems.filter(item => item.status === 'sold');
    const itemsSold = soldItems.length;
    
    // Calculate actual profit ONLY from sold items that are linked to this specific pallet
    const actualProfit = soldItems.reduce((sum, item) => {
      const profit = parseFloat(item.soldPrice || "0") - parseFloat(item.purchasePrice || "0");
      console.log(`  Item ${item.name}: Profit = ${profit} (sold: ${item.soldPrice}, cost: ${item.purchasePrice})`);
      return sum + profit;
    }, 0);
    
    const totalCost = parseFloat(pallet.totalCost || "0");
    const remainingToBreakEven = Math.max(0, totalCost - actualProfit);
    const breakEvenPercentage = totalCost > 0 ? (actualProfit / totalCost) * 100 : 0;

    console.log(`Pallet ${pallet.name} Break-even: ${actualProfit}/${totalCost} = ${breakEvenPercentage.toFixed(1)}%`);

    return {
      pallet,
      totalCost,
      itemsSold,
      totalItems,
      currentProfit: actualProfit,
      remainingToBreakEven,
      breakEvenPercentage: Math.min(100, breakEvenPercentage),
      items: palletItems, // Only pallet-linked items
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Break-Even Analysis
        </CardTitle>
        <p className="text-sm text-slate-600">
          Track progress toward recovering your inventory investment
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="overall" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overall">Overall Analysis</TabsTrigger>
            <TabsTrigger value="pallets">By Pallet</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overall" className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Break-Even Progress</span>
                <span className={`font-semibold ${isBreakEvenReached ? 'text-green-600' : 'text-blue-600'}`}>
                  {breakEvenData.breakEvenPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={breakEvenData.breakEvenPercentage} 
                className="h-3"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>$0</span>
                <span>${totalInvestment.toFixed(2)} (Break-Even)</span>
              </div>
            </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Investment</span>
            </div>
            <div className="text-lg font-semibold text-blue-900">
              ${totalInvestment.toFixed(2)}
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Current Profit</span>
            </div>
            <div className="text-lg font-semibold text-green-900">
              ${currentProfit.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Break-Even Status */}
        {isBreakEvenReached ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-semibold text-green-900">Break-Even Achieved!</span>
            </div>
            <p className="text-sm text-green-700">
              You've recovered your inventory investment. All future profits are pure gain!
            </p>
            <div className="mt-2 text-sm text-green-600">
              Excess profit: <span className="font-semibold">${(currentProfit - totalInvestment).toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-semibold text-orange-900">Remaining to Break-Even</span>
              </div>
              <div className="text-2xl font-bold text-orange-900 mb-1">
                ${remainingToBreakEven.toFixed(2)}
              </div>
              <p className="text-sm text-orange-700">
                You need ${remainingToBreakEven.toFixed(2)} more in profit to recover your investment
              </p>
            </div>

            {/* Projection */}
            {averageDailyProfit > 0 && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-600 mb-1">Estimated Break-Even Timeline</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {projectedBreakEvenDays} days
                    </div>
                    <div className="text-xs text-slate-500">
                      Based on ${averageDailyProfit.toFixed(2)}/day avg profit
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600">Target Date</div>
                    <div className="font-medium text-slate-900">
                      {new Date(Date.now() + projectedBreakEvenDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
          </TabsContent>
          
          <TabsContent value="pallets" className="space-y-4">
            {palletBreakEvens.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No pallets found. Create a pallet to track its break-even analysis.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary of inventory mix */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">Inventory Overview</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Pallet Items:</span>
                      <span className="font-medium ml-2">{palletLinkedItems.length} items</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Individual Purchases:</span>
                      <span className="font-medium ml-2">{individualItems.length} items</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Pallet analysis shows only items tagged to specific pallets. Individual purchases are tracked in overall analysis.
                  </p>
                </div>
                
                {palletBreakEvens.map((palletData) => {
                  const isPalletBreakEven = palletData.currentProfit >= palletData.totalCost;
                  
                  return (
                    <Card key={palletData.pallet.id} className="border border-slate-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{palletData.pallet.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                              isPalletBreakEven 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {palletData.breakEvenPercentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        {palletData.pallet.description && (
                          <p className="text-sm text-slate-600">{palletData.pallet.description}</p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Pallet Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Break-Even Progress</span>
                            <span className={`font-semibold ${isPalletBreakEven ? 'text-green-600' : 'text-blue-600'}`}>
                              ${palletData.currentProfit.toFixed(2)} / ${palletData.totalCost.toFixed(2)}
                            </span>
                          </div>
                          <Progress value={palletData.breakEvenPercentage} className="h-2" />
                        </div>

                        {/* Pallet Stats */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-slate-900">{palletData.totalItems}</div>
                            <div className="text-xs text-slate-500">Total Items</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">{palletData.itemsSold}</div>
                            <div className="text-xs text-slate-500">Items Sold</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              {palletData.totalItems - palletData.itemsSold}
                            </div>
                            <div className="text-xs text-slate-500">Remaining</div>
                          </div>
                        </div>

                        {/* Status */}
                        {isPalletBreakEven ? (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="font-semibold text-green-900">Pallet Break-Even Achieved!</span>
                            </div>
                            <p className="text-sm text-green-700 mt-1">
                              Excess profit: ${(palletData.currentProfit - palletData.totalCost).toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                              <span className="font-semibold text-orange-900">
                                ${palletData.remainingToBreakEven.toFixed(2)} to break-even
                              </span>
                            </div>
                            <p className="text-sm text-orange-700 mt-1">
                              {palletData.totalItems - palletData.itemsSold} items remaining to sell
                              {palletData.items.length === 0 && palletData.totalItems > 0 && (
                                <span className="block text-xs text-orange-600 mt-1">
                                  Tip: Tag individual inventory items to this pallet to track specific sales
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}