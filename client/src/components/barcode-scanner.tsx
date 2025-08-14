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
          width: 800,
          height: 600,
          facingMode: "environment" // Use back camera
        }
      },
      locator: {
        patchSize: "medium", // x-small, small, medium, large, x-large
        halfSample: true
      },
      numOfWorkers: 2,
      frequency: 10,
      decoder: {
        readers: [
          "ean_reader", // Most common for retail products
          "ean_8_reader", // 8-digit EAN
          "code_128_reader", // Common in shipping/inventory
          "upc_reader", // UPC-A (standard retail)
          "upc_e_reader", // UPC-E (compact)
          "code_39_reader" // Industrial/inventory codes
        ]
      },
      locate: true
    }, (err: any) => {
      if (err) {
        console.error('Quagga initialization error:', err);
        setCameraError('Failed to access camera. Please check permissions.');
        return;
      }
      
      setIsInitialized(true);
      
      // Set up barcode detection with validation
      Quagga.onDetected(async (data: any) => {
        const code = data.codeResult.code;
        const format = data.codeResult.format;
        
        // Validate barcode length and format for retail products
        if (code && isValidRetailBarcode(code, format)) {
          console.log(`Valid barcode detected: ${code} (${format})`);
          setScannedCode(code);
          setIsScanning(false);
          Quagga.stop();
          setIsInitialized(false);
          
          // Try to lookup product information
          await lookupProduct(code);
        } else {
          console.warn(`Invalid or partial barcode: ${code} (${format})`);
        }
      });
    });
  };

  // Validate barcode format for retail products
  const isValidRetailBarcode = (code: string, format: string): boolean => {
    if (!code || code.length < 8) return false;
    
    // UPC-A: 12 digits
    if (format === 'upc_a' || format === 'ean_13') {
      return /^\d{12,13}$/.test(code);
    }
    
    // UPC-E: 8 digits  
    if (format === 'upc_e' || format === 'ean_8') {
      return /^\d{8}$/.test(code);
    }
    
    // Code 128: Variable length but typically 8-20 characters
    if (format === 'code_128') {
      return code.length >= 8 && code.length <= 20;
    }
    
    // Code 39: Variable length but typically 6-20 characters
    if (format === 'code_39') {
      return code.length >= 6 && code.length <= 20;
    }
    
    return true; // Allow other formats through
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
      // Enhanced retail APIs with excellent Home Depot coverage
      const apis = [
        `https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`,
        `https://api.barcodelookup.com/v3/products?barcode=${code}&formatted=y&key=demo`,
        `https://go-upc.com/api/v1/code/${code}` // Go-UPC has excellent Home Depot coverage
      ];

      let productData = null;
      
      // Try UPCItemDB first (excellent Home Depot, retail coverage)
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
            source: 'UPCItemDB',
            retailer: item.brand?.toLowerCase().includes('depot') ? 'Home Depot' : undefined
          };
        }
      } catch (e) {
        console.log('UPCItemDB failed, trying Barcode Lookup API');
      }

      // Fallback to Barcode Lookup (strong Home Depot product database)
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
              source: 'Barcode Lookup',
              retailer: product.brand?.toLowerCase().includes('depot') ? 'Home Depot' : undefined
            };
          }
        } catch (e) {
          console.log('Barcode Lookup failed, trying Go-UPC');
        }
      }

      // Third fallback - Go-UPC (1 billion products, strong Home Depot coverage)
      if (!productData) {
        try {
          const response = await fetch(apis[2]);
          const data = await response.json();
          if (data.product) {
            productData = {
              title: data.product.name,
              brand: data.product.brand,
              description: data.product.description,
              category: data.product.category,
              source: 'Go-UPC',
              retailer: data.product.brand?.toLowerCase().includes('depot') ? 'Home Depot' : undefined
            };
          }
        } catch (e) {
          console.log('Go-UPC failed - all APIs exhausted');
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
            
            {/* Enhanced Scanning overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  {/* Main scanning frame */}
                  <div className="w-64 h-40 border-2 border-green-500 rounded-lg relative bg-transparent">
                    <div className="absolute inset-0 bg-green-500 bg-opacity-5 animate-pulse rounded-lg"></div>
                    
                    {/* Corner markers */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-500"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-500"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-500"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-500"></div>
                    
                    {/* Scanning line */}
                    <div className="absolute top-1/2 left-2 right-2 h-1 bg-red-500 animate-pulse shadow-lg"></div>
                  </div>
                  
                  {/* Instructions */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-70 px-2 py-1 rounded text-sm">
                    Align barcode in frame
                  </div>
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
                    {productInfo.retailer && <Badge variant="outline" className="text-orange-700 border-orange-700">🏪 {productInfo.retailer}</Badge>}
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