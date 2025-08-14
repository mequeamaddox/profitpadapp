import React, { useRef, useEffect, useState } from 'react';
import Quagga from 'quagga';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Camera, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { InventoryItem } from '@shared/schema';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string, productInfo?: any) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function BarcodeScanner({ onScanSuccess, onClose, isOpen }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [productInfo, setProductInfo] = useState<any>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Search for existing inventory item by barcode
  const { data: existingItem, isLoading: searchLoading } = useQuery<InventoryItem | null>({
    queryKey: ['/api/inventory/search', scannedCode],
    enabled: !!scannedCode,
    queryFn: async () => {
      if (!scannedCode) return null;
      try {
        const response = await fetch(`/api/inventory/search?barcode=${encodeURIComponent(scannedCode)}`);
        if (response.ok) {
          const items = await response.json();
          return items.length > 0 ? items[0] : null;
        }
      } catch (error) {
        console.error('Error searching for item:', error);
      }
      return null;
    }
  });

  useEffect(() => {
    if (isOpen && scannerRef.current) {
      setError('');
      setCameraError('');
      setScannedCode('');
      initializeScanner();
    }

    return () => {
      if (isInitialized) {
        try {
          Quagga.stop();
          setIsInitialized(false);
        } catch (e) {
          console.warn('Error stopping Quagga:', e);
        }
      }
    };
  }, [isOpen]);

  const initializeScanner = () => {
    if (!scannerRef.current) return;

    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: scannerRef.current,
        constraints: {
          width: 640,
          height: 480,
          facingMode: "environment" // Use back camera
        }
      },
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "upc_reader",
          "upc_e_reader"
        ]
      }
    }, (err: any) => {
      if (err) {
        console.error('Quagga initialization error:', err);
        setCameraError('Failed to access camera. Please check permissions.');
        return;
      }
      
      setIsInitialized(true);
      
      // Set up barcode detection
      Quagga.onDetected(async (data: any) => {
        const code = data.codeResult.code;
        if (code) {
          setScannedCode(code);
          setIsScanning(false);
          Quagga.stop();
          setIsInitialized(false);
          
          // Try to lookup product information
          await lookupProduct(code);
        }
      });
    });
  };

  const startScanning = async () => {
    if (!isInitialized) {
      initializeScanner();
      return;
    }

    try {
      setIsScanning(true);
      setError('');
      setCameraError('');
      Quagga.start();
    } catch (error) {
      console.error('Error starting barcode scan:', error);
      setError('Failed to start scanning. Please ensure camera permissions are granted.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (isInitialized) {
      try {
        Quagga.stop();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
    }
  };

  const lookupProduct = async (code: string) => {
    setLookupLoading(true);
    try {
      // Focus on retail product APIs - electronics, books, toys, clothing, etc.
      const apis = [
        `https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`,
        `https://api.barcodelookup.com/v3/products?barcode=${code}&formatted=y&key=demo`
      ];

      let productData = null;
      
      // Try UPCItemDB first (best for retail products like electronics, books, toys)
      try {
        const response = await fetch(apis[0]);
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          const item = data.items[0];
          productData = {
            title: item.title,
            brand: item.brand,
            description: item.description,
            category: item.category,
            source: 'UPCItemDB'
          };
        }
      } catch (e) {
        console.log('UPCItemDB failed, trying barcode lookup');
      }

      // Fallback to Barcode Lookup (good for general retail items)
      if (!productData) {
        try {
          const response = await fetch(apis[1]);
          const data = await response.json();
          if (data.products && data.products.length > 0) {
            const product = data.products[0];
            productData = {
              title: product.product_name || product.title,
              brand: product.brand,
              description: product.description,
              category: product.category,
              source: 'Barcode Lookup'
            };
          }
        } catch (e) {
          console.log('Barcode Lookup API failed');
        }
      }

      setProductInfo(productData);
    } catch (error) {
      console.error('Product lookup failed:', error);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleUseBarcode = () => {
    if (scannedCode) {
      // Pass barcode and product info to the form
      onScanSuccess(scannedCode, productInfo);
      onClose();
    }
  };

  const handleCameraError = (error: string) => {
    console.error('Camera error:', error);
    setCameraError('Camera access denied or not available. Please check your camera permissions.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Barcode Scanner
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera View */}
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {cameraError ? (
              <div className="flex items-center justify-center h-full text-center p-4">
                <div>
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{cameraError}</p>
                </div>
              </div>
            ) : (
              <div 
                ref={scannerRef}
                className="w-full h-full"
                style={{ minHeight: '300px' }}
              />
            )}
            
            {/* Scanning overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-32 border-2 border-blue-500 rounded-lg relative">
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-10 animate-pulse"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 animate-pulse"></div>
                </div>
              </div>
            )}
          </div>

          {/* Scanner Controls */}
          <div className="flex gap-2 justify-center">
            {!isScanning ? (
              <Button onClick={startScanning} disabled={!!cameraError}>
                <Search className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="outline">
                Stop Scanning
              </Button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Scanned Result */}
          {scannedCode && (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">Barcode Found:</p>
                <p className="font-mono text-green-700">{scannedCode}</p>
              </div>

              {/* Product Lookup */}
              {lookupLoading && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-700">Looking up product information...</p>
                </div>
              )}

              {productInfo && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{productInfo.source}</Badge>
                  </div>
                  <p className="font-medium">{productInfo.title}</p>
                  {productInfo.brand && <p className="text-sm text-gray-600">Brand: {productInfo.brand}</p>}
                  {productInfo.category && <p className="text-sm text-gray-600">Category: {productInfo.category}</p>}
                </div>
              )}

              {/* Existing Item Found */}
              {searchLoading ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">Searching inventory...</p>
                </div>
              ) : existingItem ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">Found in Inventory</Badge>
                  </div>
                  <p className="font-medium">{existingItem.title}</p>
                  <p className="text-sm text-gray-600">SKU: {existingItem.sku}</p>
                  <p className="text-sm text-gray-600">Purchase Price: ${existingItem.purchasePrice}</p>
                </div>
              ) : !productInfo ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    Product info not found. You can add details manually.
                  </p>
                </div>
              ) : null}

              <Button onClick={handleUseBarcode} className="w-full">
                {productInfo ? 'Use Product Info' : existingItem ? 'Select This Item' : 'Add New Product'}
              </Button>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center">
            Point your camera at a barcode to scan it. Make sure the barcode is clearly visible and well-lit.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}