import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Upload, X, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReceiptData {
  merchant?: string;
  date?: string;
  total?: number;
  tax?: number;
  subtotal?: number;
  items?: Array<{
    description: string;
    amount: number;
  }>;
  category?: string;
  paymentMethod?: string;
  address?: string;
}

interface ReceiptCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureSuccess: (imageUrl: string, receiptData?: ReceiptData) => void;
}

export default function ReceiptCapture({ isOpen, onClose, onCaptureSuccess }: ReceiptCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const { toast } = useToast();

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const retake = () => {
    setCapturedImage(null);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const uploadReceipt = async () => {
    if (!capturedImage) return;

    setIsUploading(true);
    try {
      // First, analyze the receipt with OCR
      let receiptData: ReceiptData | undefined;
      setIsAnalyzing(true);
      try {
        const ocrResponse = await fetch('/api/analyze-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: capturedImage })
        });

        if (ocrResponse.ok) {
          receiptData = await ocrResponse.json();
          toast({
            title: "Receipt Analyzed",
            description: "Receipt information extracted successfully!",
          });
        }
      } catch (ocrError) {
        console.warn('OCR analysis failed, continuing with upload:', ocrError);
        toast({
          title: "Analysis Note", 
          description: "Receipt saved, but automatic data extraction failed. You can fill in details manually.",
          variant: "default",
        });
      } finally {
        setIsAnalyzing(false);
      }

      // Get upload URL from backend
      const uploadResponse = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadURL } = await uploadResponse.json();

      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Upload to object storage
      const uploadResult = await fetch(uploadURL, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': 'image/jpeg'
        }
      });

      if (!uploadResult.ok) {
        throw new Error('Failed to upload receipt');
      }

      // Set ACL policy for the uploaded receipt
      const aclResponse = await fetch('/api/receipt-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptImageURL: uploadURL })
      });

      if (!aclResponse.ok) {
        throw new Error('Failed to process receipt upload');
      }

      const { objectPath } = await aclResponse.json();
      
      onCaptureSuccess(objectPath, receiptData);
      
      handleClose();
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to save receipt image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedImage(result);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setCapturedImage(null);
    onClose();
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Capture Receipt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!capturedImage ? (
            <>
              <div className="relative bg-black rounded-lg overflow-hidden">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full h-64 object-cover"
                />
                
                {/* Camera overlay for targeting */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-white border-dashed rounded-lg w-64 h-40 flex items-center justify-center">
                    <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                      Position receipt here
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={capture} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Receipt
                </Button>
                
                <Button variant="outline" onClick={switchCamera}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Switch Camera
                </Button>
              </div>

              <div className="relative">
                <div className="flex items-center text-sm text-slate-500 my-4">
                  <div className="flex-1 border-t border-slate-300"></div>
                  <span className="px-3">or</span>
                  <div className="flex-1 border-t border-slate-300"></div>
                </div>
                
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  <Button variant="outline" className="w-full" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload from Gallery
                    </span>
                  </Button>
                </label>
                <input
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <img 
                  src={capturedImage} 
                  alt="Captured receipt" 
                  className="w-full rounded-lg"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={uploadReceipt} 
                  disabled={isUploading || isAnalyzing}
                  className="flex-1"
                >
                  {isAnalyzing ? "Reading Receipt..." : isUploading ? "Saving..." : "Save Receipt"}
                </Button>
                
                <Button variant="outline" onClick={retake} disabled={isUploading}>
                  <X className="h-4 w-4 mr-2" />
                  Retake
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}