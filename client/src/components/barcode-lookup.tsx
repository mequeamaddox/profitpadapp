import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search, Scan, TrendingUp, TrendingDown, AlertCircle, DollarSign, Package, Calendar } from "lucide-react";
import BarcodeScanner from "@/components/barcode-scanner";
import { apiRequest } from "@/lib/queryClient";

interface ProductLookupData {
  title: string;
  brand?: string;
  category?: string;
  upc: string;
  estimatedValue: {
    low: number;
    average: number;
    high: number;
  };
  demandLevel: "Low" | "Medium" | "High";
  salesVelocity: number; // sales per month
  competitorCount: number;
  lastSaleDate?: string;
  marketTrend: "Rising" | "Stable" | "Declining";
  suggestedListPrice: number;
  profitPotential: "Low" | "Medium" | "High";
  notes?: string[];
}

export default function BarcodeLookup() {
  const [barcode, setBarcode] = useState("");
  const [lookupData, setLookupData] = useState<ProductLookupData | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const lookupMutation = useMutation({
    mutationFn: async (upc: string) => {
      return await apiRequest("POST", "/api/barcode-lookup", { upc });
    },
    onSuccess: (data) => {
      setLookupData(data);
    },
  });

  const handleBarcodeScanned = (scannedBarcode: string) => {
    setBarcode(scannedBarcode);
    setIsScannerOpen(false);
    handleLookup(scannedBarcode);
  };

  const handleLookup = (upc?: string) => {
    const codeToLookup = upc || barcode;
    if (!codeToLookup.trim()) return;
    
    lookupMutation.mutate(codeToLookup.trim());
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case "High": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "Rising": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "Declining": return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getProfitColor = (level: string) => {
    switch (level) {
      case "High": return "text-green-600";
      case "Medium": return "text-yellow-600";
      case "Low": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Product Research & Barcode Lookup
          </CardTitle>
          <p className="text-sm text-slate-600">
            Get estimated resale value and market demand data for any product
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter UPC/Barcode (e.g., 123456789012)"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              onClick={() => setIsScannerOpen(true)}
              className="shrink-0"
            >
              <Scan className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => handleLookup()}
              disabled={!barcode.trim() || lookupMutation.isPending}
              className="shrink-0"
            >
              {lookupMutation.isPending ? "Looking up..." : "Lookup"}
            </Button>
          </div>

          {lookupMutation.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">
                  Product not found or lookup service unavailable
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scanner Modal */}
      {isScannerOpen && (
        <BarcodeScanner
          onScan={handleBarcodeScanned}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* Lookup Results */}
      {lookupData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Analysis
              </div>
              <Badge className={getProfitColor(lookupData.profitPotential)}>
                {lookupData.profitPotential} Profit Potential
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Info */}
            <div>
              <h3 className="font-semibold text-lg mb-2">{lookupData.title}</h3>
              <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                {lookupData.brand && <span>Brand: {lookupData.brand}</span>}
                {lookupData.category && <span>• Category: {lookupData.category}</span>}
                <span>• UPC: {lookupData.upc}</span>
              </div>
            </div>

            <Separator />

            {/* Market Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Estimated Value */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Estimated Value</span>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-blue-700">
                    Low: ${lookupData.estimatedValue.low.toFixed(2)}
                  </div>
                  <div className="text-lg font-semibold text-blue-900">
                    Avg: ${lookupData.estimatedValue.average.toFixed(2)}
                  </div>
                  <div className="text-sm text-blue-700">
                    High: ${lookupData.estimatedValue.high.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Demand Level */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="font-medium text-slate-900 mb-2">Market Demand</div>
                <Badge className={getDemandColor(lookupData.demandLevel)}>
                  {lookupData.demandLevel}
                </Badge>
                <div className="text-sm text-slate-600 mt-2">
                  {lookupData.salesVelocity} sales/month
                </div>
                <div className="text-xs text-slate-500">
                  {lookupData.competitorCount} active sellers
                </div>
              </div>

              {/* Market Trend */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="font-medium text-slate-900 mb-2">Market Trend</div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(lookupData.marketTrend)}
                  <span className="text-sm">{lookupData.marketTrend}</span>
                </div>
                {lookupData.lastSaleDate && (
                  <div className="text-xs text-slate-500 mt-2">
                    Last sale: {new Date(lookupData.lastSaleDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Recommendation */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-900">Pricing Recommendation</span>
              </div>
              <div className="text-lg font-bold text-green-900 mb-1">
                Suggested List Price: ${lookupData.suggestedListPrice.toFixed(2)}
              </div>
              <div className="text-sm text-green-700">
                Based on current market conditions and competitor pricing
              </div>
            </div>

            {/* Additional Notes */}
            {lookupData.notes && lookupData.notes.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="font-medium text-amber-900 mb-2">Market Insights</div>
                <ul className="space-y-1">
                  {lookupData.notes.map((note, index) => (
                    <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}