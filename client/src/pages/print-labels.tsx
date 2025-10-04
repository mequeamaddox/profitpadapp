import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { type InventoryItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import JsBarcode from "jsbarcode";

export default function PrintLabels() {
  const [, setLocation] = useLocation();
  const barcodeRefs = useRef<{ [key: string]: SVGSVGElement | null }>({});

  const { data: items = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const activeItems = items.filter(item => !item.archived && item.status !== "sold");

  useEffect(() => {
    activeItems.forEach(item => {
      const ref = barcodeRefs.current[item.id];
      if (ref && item.sku) {
        try {
          JsBarcode(ref, item.sku, {
            format: "CODE128",
            width: 2,
            height: 60,
            displayValue: true,
            fontSize: 14,
            margin: 10,
          });
        } catch (error) {
          console.error("Barcode generation error:", error);
        }
      }
    });
  }, [activeItems]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="print:hidden sticky top-0 bg-background border-b z-10 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation("/inventory")}
              data-testid="button-back-inventory"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Inventory
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Print Barcode Labels</h1>
              <p className="text-sm text-muted-foreground">
                {activeItems.length} active items ready to print
              </p>
            </div>
          </div>
          <Button onClick={handlePrint} data-testid="button-print">
            <Printer className="w-4 h-4 mr-2" />
            Print Labels
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {activeItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No active inventory items to print. Add items first!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-3">
            {activeItems.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 bg-white print:break-inside-avoid"
                data-testid={`label-${item.id}`}
              >
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-2 h-10">
                    {item.title}
                  </h3>
                  <div className="flex justify-center">
                    <svg
                      ref={(el) => {
                        barcodeRefs.current[item.id] = el;
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {item.platform && <p>Platform: {item.platform}</p>}
                    {item.category && <p>Category: {item.category}</p>}
                    {item.condition && <p>Condition: {item.condition}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media print {
          @page {
            size: letter;
            margin: 0.5in;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .print\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
