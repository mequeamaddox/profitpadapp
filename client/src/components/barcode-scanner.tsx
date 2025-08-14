import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
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
  const webcamRef = useRef<Webcam>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

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
    if (isOpen) {
      codeReader.current = new BrowserMultiFormatReader();
      setError('');
      setCameraError('');
      setScannedCode('');
    }

    return () => {
      if (codeReader.current) {
        try {
          codeReader.current.reset();
        } catch (e) {
          // Ignore reset errors
        }
      }
    };
  }, [isOpen]);

  const startScanning = async () => {
    if (!webcamRef.current || !codeReader.current) return;

    try {
      setIsScanning(true);
      setError('');
      setCameraError('');

      const videoElement = webcamRef.current.video;
      if (!videoElement) {
        throw new Error('Camera not available');
      }

      // Start continuous scanning with ZXing
      codeReader.current.decodeFromVideoDevice(null, videoElement, (result, error) => {
        if (result) {
          setScannedCode(result.getText());
          setIsScanning(false);
          // Stop scanning after successful decode
          if (codeReader.current) {
            codeReader.current.reset();
          }
        }
        // Continue scanning on error (no barcode found)
      });

    } catch (error) {
      console.error('Error starting barcode scan:', error);
      setError('Failed to start scanning. Please ensure camera permissions are granted.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (codeReader.current) {
      try {
        codeReader.current.reset();
      } catch (e) {
        // Ignore reset errors
      }
    }
  };

  const handleUseBarcode = () => {
    if (scannedCode) {
      onScanSuccess(scannedCode, existingItem);
      onClose();
    }
  };

  const handleCameraError = (error: string | DOMException) => {
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
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 640,
                  height: 480,
                  facingMode: { ideal: "environment" } // Use back camera on mobile
                }}
                onUserMediaError={handleCameraError}
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Scanning overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
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
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    Item not found in inventory. You can add it as a new product.
                  </p>
                </div>
              )}

              <Button onClick={handleUseBarcode} className="w-full">
                {existingItem ? 'Select This Item' : 'Add New Product'}
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