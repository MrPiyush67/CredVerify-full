import { useState } from 'react';
import { X, Upload, QrCode, CheckCircle, Info } from 'lucide-react';
import { Button } from '@common';
import { BrowserQRCodeReader } from '@zxing/browser';
import toast from 'react-hot-toast';
import { env } from '@utils/env';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Certificate/QR Upload Modal
 * Simplified - No platform selection, just upload certificate or QR code
 */
export default function CertificateQrUploadModal({
  isOpen,
  onClose,
  onSubmit
}) {
  const [uploadData, setUploadData] = useState({
    file: null,
    qrData: '',
  });
  const [qrProcessing, setQrProcessing] = useState(false);
  const [qrError, setQrError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadData(prev => ({ ...prev, file }));

      // Auto-detect if it's an image and try to extract QR code
      if (file.type.startsWith('image/')) {
        tryExtractQrFromImage(file);
      }
    }
  };

  const tryExtractQrFromImage = async (file) => {
    setQrProcessing(true);
    setQrError('');

    try {
      const url = URL.createObjectURL(file);
      const reader = new BrowserQRCodeReader();
      const result = await reader.decodeFromImageUrl(url);

      if (result?.text) {
        setUploadData(prev => ({ ...prev, qrData: result.text }));
        toast.success('QR code detected in image!');
      }

      URL.revokeObjectURL(url);
    } catch (err) {
      // Silently fail - user can still upload the image/PDF
    } finally {
      setQrProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!uploadData.file) {
      toast.error('Please upload a certificate file');
      return;
    }

    // Prepare FormData for API call
    const formData = new FormData();
    formData.append('certificateImage', uploadData.file);

    try {
      // Call the manual verification API
      const response = await fetch(`${env.API_URL}/credentials/manual-verify`, {
        method: 'POST',
        credentials: 'include', // Send cookies for authentication
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Certificate verified successfully!');

        // Pass data back to parent component
        onSubmit({
          uploadMethod: 'Certificate/QR Upload',
          file: uploadData.file,
          verificationUrl: result.data.url,
          domain: result.data.domain,
          extractedText: result.data.extractedText,
          screenshot: result.data.screenshot,
          qrCodeFound: result.data.qrCodeFound,
        });

        handleClose();
      } else {
        toast.error(result.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify certificate. Please try again.');
    }
  };

  const handleClose = () => {
    setUploadData({
      file: null,
      qrData: '',
    });
    setQrError('');
    onClose();
  };

  const isSubmitDisabled = !uploadData.file;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl border max-h-[90vh] overflow-y-auto scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-semibold">Certificate/QR Upload</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your certificate or QR code for verification
                </p>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Instructions Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div className="space-y-2 text-sm text-blue-900">
                    <p className="font-medium">How it works:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Upload your certificate image (JPEG, PNG) or PDF</li>
                      <li>If your certificate has a QR code, we'll automatically detect and extract it</li>
                      <li>We'll scrape the verification page and extract certificate details</li>
                      <li>Your certificate will be verified and saved to your profile</li>
                    </ol>
                    <p className="text-xs mt-2">
                      <strong>Supported formats:</strong> Images with QR codes (Skill India, NSDC, DigiLocker) or PDF certificates (HackerRank, IGNOU, etc.)
                    </p>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="text-sm font-medium mb-2 block">Upload Certificate</label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-[#116466] transition-colors">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <QrCode className="h-8 w-8 text-gray-400" />
                  </div>

                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="certificate-upload"
                  />

                  <label htmlFor="certificate-upload" className="cursor-pointer">
                    {uploadData.file ? (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-[#116466] flex items-center justify-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          {uploadData.file.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(uploadData.file.size / 1024).toFixed(2)} KB
                        </div>
                        {qrProcessing && (
                          <div className="text-xs text-blue-600 animate-pulse">
                            🔍 Scanning for QR code...
                          </div>
                        )}
                        {uploadData.qrData && (
                          <div className="text-xs text-green-600 font-medium">
                            ✓ QR code detected!
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          Click to upload or drag and drop
                        </div>
                        <div className="text-xs text-muted-foreground">
                          PDF, JPEG, PNG (Max 10MB)
                        </div>
                      </>
                    )}
                  </label>
                </div>
                {qrError && (
                  <div className="text-xs text-amber-600 mt-2 p-2 bg-amber-50 rounded">
                    {qrError}
                  </div>
                )}
              </div>

              {/* QR Data Preview (if detected) */}
              {uploadData.qrData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-green-900 mb-1">QR Code Data Detected:</p>
                  <p className="text-xs text-green-800 break-all font-mono bg-white p-2 rounded">
                    {uploadData.qrData}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                className="bg-[#116466] text-white hover:bg-[#0e4f50]"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                {qrProcessing ? 'Processing...' : 'Verify & Upload'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
