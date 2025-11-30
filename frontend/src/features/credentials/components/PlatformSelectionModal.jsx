import { useState } from 'react';
import { X, Upload, QrCode, Hash, CheckCircle } from 'lucide-react';
import { Button, Input } from '@common';
import { BrowserQRCodeReader } from '@zxing/browser';

/**
 * Generic Platform Selection Modal
 * Handles: PDF Upload, QR Code Upload/Scan, Credential ID Entry
 */
export default function PlatformSelectionModal({ 
  isOpen, 
  onClose, 
  uploadMethod, 
  platforms = [],
  onSubmit 
}) {
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [uploadData, setUploadData] = useState({
    file: null,
    verificationUrl: '',
    credentialId: '',
    qrData: ''
  });
  const [qrProcessing, setQrProcessing] = useState(false);
  const [qrError, setQrError] = useState('');

  if (!isOpen) return null;

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    // Reset upload data when switching platforms
    setUploadData({
      file: null,
      verificationUrl: '',
      credentialId: '',
      qrData: ''
    });
    setQrError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadData(prev => ({ ...prev, file }));
    }
  };

  const handleQrImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQrProcessing(true);
    setQrError('');
    
    try {
      const url = URL.createObjectURL(file);
      const reader = new BrowserQRCodeReader();
      const result = await reader.decodeFromImageUrl(url);
      setUploadData(prev => ({ ...prev, qrData: result?.text || '', file }));
      URL.revokeObjectURL(url);
    } catch (err) {
      setQrError('Unable to decode QR code. Please try a clearer image or enter data manually.');
    } finally {
      setQrProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedPlatform) return;

    const payload = {
      platformId: selectedPlatform.id,
      platformName: selectedPlatform.name,
      uploadMethod,
      ...uploadData
    };

    onSubmit(payload);
    handleClose();
  };

  const handleClose = () => {
    setSelectedPlatform(null);
    setUploadData({
      file: null,
      verificationUrl: '',
      credentialId: '',
      qrData: ''
    });
    setQrError('');
    onClose();
  };

  const isSubmitDisabled = () => {
    if (!selectedPlatform) return true;
    
    if (uploadMethod === 'PDF Certificate Upload') {
      return !uploadData.file;
    } else if (uploadMethod === 'QR Code Verification') {
      return !uploadData.qrData && !uploadData.file;
    } else if (uploadMethod === 'Credential ID Verification') {
      return !uploadData.credentialId;
    }
    
    return false;
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-[95%] max-w-3xl border max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-semibold">{uploadMethod}</h3>
            <p className="text-sm text-muted-foreground">
              {!selectedPlatform ? 'Select a platform to continue' : `Upload credential from ${selectedPlatform.name}`}
            </p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {!selectedPlatform ? (
            // Platform Selection Grid
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">Choose Platform</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => handlePlatformSelect(platform)}
                    className="text-left border rounded-lg p-4 hover:bg-gray-50 hover:border-[#116466] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {platform.domain ? (
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${platform.domain}&sz=128`}
                          alt={`${platform.name} icon`}
                          className="h-8 w-8"
                        />
                      ) : (
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#116466] text-white text-xs font-bold">
                          {platform.icon || platform.name.substring(0, 2)}
                        </span>
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{platform.name}</div>
                        {platform.note && (
                          <div className="text-xs text-muted-foreground mt-0.5">{platform.note}</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Upload Form based on method
            <div className="space-y-4">
              {/* Platform Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {selectedPlatform.domain ? (
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${selectedPlatform.domain}&sz=128`}
                      alt={`${selectedPlatform.name} icon`}
                      className="h-8 w-8"
                    />
                  ) : (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#116466] text-white text-xs font-bold">
                      {selectedPlatform.icon || selectedPlatform.name.substring(0, 2)}
                    </span>
                  )}
                  <div>
                    <div className="font-medium">{selectedPlatform.name}</div>
                    <div className="text-xs text-muted-foreground">{uploadMethod}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPlatform(null)}
                >
                  Change Platform
                </Button>
              </div>

              {/* PDF Upload */}
              {uploadMethod === 'PDF Certificate Upload' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Upload Certificate PDF</label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-[#116466] transition-colors">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label htmlFor="pdf-upload" className="cursor-pointer">
                        {uploadData.file ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-[#116466] flex items-center justify-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              {uploadData.file.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {(uploadData.file.size / 1024).toFixed(2)} KB
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-sm font-medium text-gray-700">
                              Click to upload or drag and drop
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              PDF or image (Max 10MB)
                            </div>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {selectedPlatform.hasVerificationUrl && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {selectedPlatform.verificationUrlLabel || 'Verification URL (optional)'}
                      </label>
                      <Input
                        type="url"
                        placeholder="https://example.com/verify/12345"
                        value={uploadData.verificationUrl}
                        onChange={(e) => setUploadData(prev => ({ ...prev, verificationUrl: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Provide the URL where this certificate can be verified online
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* QR Code Upload */}
              {uploadMethod === 'QR Code Verification' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Upload QR Code Image</label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-[#116466] transition-colors">
                      <QrCode className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrImageUpload}
                        className="hidden"
                        id="qr-upload"
                      />
                      <label htmlFor="qr-upload" className="cursor-pointer">
                        {uploadData.file ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-[#116466] flex items-center justify-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              {uploadData.file.name}
                            </div>
                            {qrProcessing && (
                              <div className="text-xs text-gray-600">Decoding QR code...</div>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="text-sm font-medium text-gray-700">
                              Upload QR code image
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Clear image of QR code from your certificate
                            </div>
                          </>
                        )}
                      </label>
                    </div>
                    {qrError && (
                      <div className="text-xs text-red-600 mt-2">{qrError}</div>
                    )}
                  </div>

                  {selectedPlatform.supportsManualInput && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Or Paste QR Data Manually
                      </label>
                      <Input
                        type="text"
                        placeholder="Paste the QR code data here"
                        value={uploadData.qrData}
                        onChange={(e) => setUploadData(prev => ({ ...prev, qrData: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        If QR scan fails, you can manually paste the data
                      </p>
                    </div>
                  )}

                  {selectedPlatform.verificationPortal && (
                    <div className="p-3 bg-blue-50 rounded-md">
                      <p className="text-xs text-blue-900">
                        <strong>Verification Portal:</strong> {selectedPlatform.verificationPortal}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Credential ID Entry */}
              {uploadMethod === 'Credential ID Verification' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Enter Credential ID</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder={selectedPlatform.placeholder || 'Enter credential ID'}
                        value={uploadData.credentialId}
                        onChange={(e) => setUploadData(prev => ({ ...prev, credentialId: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {selectedPlatform.verificationUrl && uploadData.credentialId && (
                    <div className="p-3 bg-green-50 rounded-md border border-green-200">
                      <p className="text-xs text-green-900 mb-1 font-medium">Verification Link:</p>
                      <a
                        href={`${selectedPlatform.verificationUrl}${uploadData.credentialId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline break-all"
                      >
                        {selectedPlatform.verificationUrl}{uploadData.credentialId}
                      </a>
                    </div>
                  )}

                  {selectedPlatform.verificationUrl && !uploadData.credentialId && (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-xs text-gray-600">
                        <strong>Verification URL:</strong> {selectedPlatform.verificationUrl}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {selectedPlatform && (
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedPlatform(null)}>
              Back
            </Button>
            <Button
              className="bg-[#116466] text-white hover:bg-[#0e4f50]"
              onClick={handleSubmit}
              disabled={isSubmitDisabled()}
            >
              Submit Credential
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
