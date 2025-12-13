"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { lookupProduct } from "@/app/actions/products";
import { createClient } from "@/utils/supabase/client";

type ScanBarcodeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onProductScanned: (productInfo: { description: string; amount: number; category: string }) => void;
};

type InputMethod = "manual" | "camera" | "upload";
type Step = "input" | "details";

const CATEGORIES = [
  { value: "food", label: "Food", emoji: "🍽️" },
  { value: "transportation", label: "Transportation", emoji: "🚌" },
  { value: "school", label: "School Supplies", emoji: "📓" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
  { value: "shopping", label: "Shopping", emoji: "🛒" },
  { value: "utilities", label: "Utilities", emoji: "💡" },
  { value: "health", label: "Health", emoji: "💊" },
  { value: "other", label: "Other", emoji: "📦" },
];

export default function ScanBarcodeModal({ isOpen, onClose, onProductScanned }: ScanBarcodeModalProps) {
  const [step, setStep] = useState<Step>("input");
  const [inputMethod, setInputMethod] = useState<InputMethod>("manual");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Barcode input
  const [manualBarcode, setManualBarcode] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningRef = useRef<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Product details
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productQuantity, setProductQuantity] = useState("1");
  const [productCategory, setProductCategory] = useState("food");
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [productSource, setProductSource] = useState<"user" | "openfoodfacts" | null>(null);
  const [saveForLater, setSaveForLater] = useState(true);

  // Stop camera function
  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
  }, []);

  // Cleanup on unmount or when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, stopCamera]);

  if (!isOpen) return null;

  const resetModal = () => {
    setStep("input");
    setInputMethod("manual");
    setManualBarcode("");
    setProductName("");
    setProductPrice("");
    setProductQuantity("1");
    setProductCategory("food");
    setScannedBarcode("");
    setProductSource(null);
    setSaveForLater(true);
    setError(null);
    setCameraError(null);
    setIsLoading(false);
    stopCamera();
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const lookupBarcode = async (barcode: string) => {
    setIsLoading(true);
    setError(null);
    setScannedBarcode(barcode);

    try {
      const result = await lookupProduct(barcode);
      if (result && result.product) {
        setProductName(result.product.name);
        setProductCategory(result.product.category || "food");
        if (result.product.price) {
          setProductPrice(result.product.price.toString());
        }
        setProductSource(result.source);
        setStep("details");
      } else {
        setError("Product not found. You can enter details manually below.");
        setProductName("");
        setProductCategory("food");
        setProductSource(null);
        setStep("details");
      }
    } catch (err) {
      console.error("Lookup error:", err);
      setError("Lookup failed (network/auth/CORS?). Enter details manually or try again.");
      setProductName("");
      setProductCategory("food");
      setProductSource(null);
      setStep("details");
    } finally {
      setIsLoading(false);
    }
  };

  // Manual barcode input
  const handleManualSubmit = () => {
    const barcode = manualBarcode.trim();
    if (!barcode) {
      setError("Please enter a barcode");
      return;
    }
    if (!/^\d{8,14}$/.test(barcode)) {
      setError("Please enter a valid barcode (8-14 digits)");
      return;
    }
    lookupBarcode(barcode);
  };

  // Image upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const reader = new BrowserMultiFormatReader();
      const imageUrl = URL.createObjectURL(file);
      const result = await reader.decodeFromImageUrl(imageUrl);
      URL.revokeObjectURL(imageUrl);
      
      const barcode = result.getText();
      await lookupBarcode(barcode);
    } catch {
      setError("Could not detect barcode. Try a clearer image.");
      setIsLoading(false);
    }
  };

  // Start camera scanning
  const startCamera = async () => {
    setCameraError(null);
    setError(null);
    
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile devices
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready and playing
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current;
          if (!video) {
            reject(new Error("Video element not found"));
            return;
          }
          
          const onCanPlay = () => {
            video.removeEventListener("canplay", onCanPlay);
            video.play()
              .then(() => resolve())
              .catch(reject);
          };
          
          video.addEventListener("canplay", onCanPlay);
          
          // Timeout fallback
          setTimeout(() => {
            video.removeEventListener("canplay", onCanPlay);
            video.play().then(() => resolve()).catch(reject);
          }, 1000);
        });
        
        // Video is now playing, show it
        setIsCameraActive(true);
        
        // Start barcode scanning
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;
        scanningRef.current = true;
        
        // Continuous scanning loop
        const scan = async () => {
          if (!scanningRef.current || !videoRef.current || !readerRef.current) {
            return;
          }
          
          try {
            // Create a canvas to capture the current video frame
            const canvas = document.createElement("canvas");
            const video = videoRef.current;
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext("2d");
            
            if (ctx && canvas.width > 0 && canvas.height > 0) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = canvas.toDataURL("image/png");
              
              try {
                const result = await reader.decodeFromImageUrl(imageData);
                if (result) {
                  const barcodeText = result.getText();
                  stopCamera();
                  await lookupBarcode(barcodeText);
                  return;
                }
              } catch {
                // No barcode found in this frame, continue scanning
              }
            }
          } catch {
            // Error processing frame, continue
          }
          
          // Continue scanning
          if (scanningRef.current) {
            setTimeout(scan, 200); // Scan every 200ms
          }
        };
        
        // Start scanning after a short delay
        setTimeout(scan, 500);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Could not access camera. Please check permissions or try another browser.");
      setIsCameraActive(false);
    }
  };

  // Submit product details
  const handleSubmitDetails = async () => {
    if (!productName.trim()) {
      setError("Please enter a product name");
      return;
    }
    if (!productPrice || parseFloat(productPrice) <= 0) {
      setError("Please enter a valid price");
      return;
    }

    const quantity = parseInt(productQuantity) || 1;
    const unitPrice = parseFloat(productPrice);
    const totalAmount = unitPrice * quantity;

    if (saveForLater && scannedBarcode) {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!user || userError) {
          setError("Not authenticated. Please log in again.");
          setIsLoading(false);
          return;
        }
        const { error } = await supabase
          .from("products")
          .upsert({
            user_id: user.id,
            barcode: scannedBarcode,
            name: productName.trim(),
            price: unitPrice,
            category: productCategory,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id,barcode" });
        if (error) {
          setError(error.message || "Failed to save product");
          setIsLoading(false);
          return;
        }
      } catch (err) {
        setError("Network error while saving product");
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    }

    const description = quantity > 1 
      ? `${productName.trim()} (x${quantity})`
      : productName.trim();

    onProductScanned({
      description,
      amount: totalAmount,
      category: productCategory,
    });
    handleClose();
  };

  // Handle tab change
  const handleTabChange = (method: InputMethod) => {
    if (method !== "camera") {
      stopCamera();
    }
    setInputMethod(method);
    setError(null);
    setCameraError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {step === "input" ? "Scan Barcode" : "Product Details"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {step === "input" && (
          <>
            {/* Input Method Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => handleTabChange("manual")}
                className={`flex-1 py-2 text-sm font-medium transition cursor-pointer ${
                  inputMethod === "manual"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ✏️ Manual
              </button>
              <button
                onClick={() => handleTabChange("camera")}
                className={`flex-1 py-2 text-sm font-medium transition cursor-pointer ${
                  inputMethod === "camera"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                📹 Camera
              </button>
              <button
                onClick={() => handleTabChange("upload")}
                className={`flex-1 py-2 text-sm font-medium transition cursor-pointer ${
                  inputMethod === "upload"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                📷 Upload
              </button>
            </div>

            {/* Manual Input */}
            {inputMethod === "manual" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter Barcode Number
                  </label>
                  <input
                    type="text"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g., 4807770270123"
                    maxLength={14}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none font-mono text-lg tracking-wider"
                    onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the barcode number from the product packaging (8-14 digits)
                  </p>
                </div>
                <button
                  onClick={handleManualSubmit}
                  disabled={isLoading || !manualBarcode.trim()}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Looking up...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Look Up Product
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Camera Scan */}
            {inputMethod === "camera" && (
              <div className="space-y-4">
                {cameraError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    {cameraError}
                  </div>
                )}
                
                {/* Always render video element, just hide when not active */}
                <div className="space-y-3">
                  <div 
                    className="relative bg-black rounded-lg overflow-hidden" 
                    style={{ minHeight: "256px", display: isCameraActive ? "block" : "none" }}
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: "100%", height: "256px", objectFit: "cover" }}
                    />
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-24 border-2 border-orange-500 rounded-lg relative">
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-orange-500 animate-pulse"></div>
                      </div>
                    </div>
                    {/* Scanning indicator */}
                    <div className="absolute bottom-2 left-0 right-0 text-center">
                      <span className="bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                        🔍 Scanning for barcode...
                      </span>
                    </div>
                  </div>
                  
                  {!isCameraActive ? (
                    <button
                      onClick={startCamera}
                      className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 transition cursor-pointer"
                    >
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600 font-medium">Click to start camera</p>
                      <p className="text-sm text-gray-400 mt-1">Point at barcode to scan</p>
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="w-full py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition cursor-pointer"
                    >
                      Stop Camera
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Upload Image */}
            {inputMethod === "upload" && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-400 transition"
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-gray-600 font-medium">Scanning barcode...</p>
                    </div>
                  ) : (
                    <>
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600 font-medium">Click to upload barcode image</p>
                      <p className="text-sm text-gray-400 mt-1">Supports JPG, PNG, or GIF</p>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Take a clear photo of the barcode for best results
                </p>
              </div>
            )}

            {/* Info */}
            <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p>💡 Products are looked up from Open Food Facts database.</p>
              <p className="mt-1">Previously scanned products are saved for quick access!</p>
            </div>
          </>
        )}

        {step === "details" && (
          <div className="space-y-4">
            {/* Barcode Display */}
            <div className="bg-gray-100 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500">Barcode</p>
              <p className="font-mono font-bold text-gray-800">{scannedBarcode}</p>
            </div>

            {/* Product Source Message */}
            {productSource === "user" ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
                ✅ Found in your saved products! Price auto-filled.
              </div>
            ) : productSource === "openfoodfacts" ? (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-lg text-sm">
                🌐 Found in Open Food Facts database. Please enter the price.
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded-lg text-sm">
                ⚠️ Product not found. Please enter the details manually.
              </div>
            )}

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
            </div>

            {/* Price and Quantity Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Price (₱) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={productQuantity}
                  onChange={(e) => setProductQuantity(e.target.value)}
                  placeholder="1"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            {/* Total Display */}
            {productPrice && parseFloat(productPrice) > 0 && (
              <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span className="text-lg font-bold text-orange-600">
                    ₱{(parseFloat(productPrice) * (parseInt(productQuantity) || 1)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Save for later checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="saveForLater"
                checked={saveForLater}
                onChange={(e) => setSaveForLater(e.target.checked)}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="saveForLater" className="text-sm text-gray-600">
                Save product for quick access next time
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setStep("input"); setError(null); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleSubmitDetails}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg transition font-medium cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Add Expense"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Cancel Button (only on input step) */}
        {step === "input" && (
          <button
            onClick={handleClose}
            className="mt-4 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
