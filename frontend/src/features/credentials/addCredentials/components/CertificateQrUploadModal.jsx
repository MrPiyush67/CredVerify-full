import { useState } from 'react';
import { Upload, QrCode, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { BrowserQRCodeReader } from '@zxing/browser';
import toast from 'react-hot-toast';

/**
 * Certificate/QR Upload Modal — UI only.
 * Replace `simulateVerify` with your real API call.
 */
export default function CertificateQrUploadModal({ isOpen, onClose, onSubmit }) {
  const [file, setFile] = useState(null);
  const [qrData, setQrData] = useState('');
  const [courseLink, setCourseLink] = useState('');
  const [qrProcessing, setQrProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);

    if (selected.type.startsWith('image/')) {
      tryExtractQrFromImage(selected);
    }
  };

  const tryExtractQrFromImage = async (imageFile) => {
    setQrProcessing(true);
    try {
      const url = URL.createObjectURL(imageFile);
      const reader = new BrowserQRCodeReader();
      const result = await reader.decodeFromImageUrl(url);
      if (result?.text) {
        setQrData(result.text);
        toast.success('QR code detected in image!');
      }
      URL.revokeObjectURL(url);
    } catch (_) {
      // No QR found — user can still upload the file as-is
    } finally {
      setQrProcessing(false);
    }
  };

  const simulateVerify = () =>
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            url: 'https://example.com/verify/DEMO123',
            domain: 'example.com',
            extractedText: 'Demo certificate text extracted from upload.',
            qrCodeFound: !!qrData,
          }),
        1200,
      ),
    );

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please upload a certificate file');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await simulateVerify();
      toast.success('Certificate verified successfully!');
      onSubmit?.({
        uploadMethod: 'Certificate/QR Upload',
        file,
        ...result,
      });
      handleClose();
    } catch {
      toast.error('Failed to verify certificate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setQrData('');
    setCourseLink('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Certificate/QR Upload</DialogTitle>
          <DialogDescription>
            Upload your certificate or QR code for verification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <AlertTitle>How it works</AlertTitle>
            <AlertDescription>
              <ol className="list-decimal list-inside space-y-1">
                <li>Upload your certificate image (JPEG, PNG) or PDF</li>
                <li>
                  If your certificate has a QR code, we'll automatically
                  detect and extract it
                </li>
                <li>
                  We'll scrape the verification page and extract certificate
                  details
                </li>
                <li>
                  Your certificate will be verified and saved to your profile
                </li>
              </ol>
              <p className="mt-2">
                <strong>Supported formats:</strong> Images with QR codes
                (Skill India, NSDC, DigiLocker) or PDF certificates
                (HackerRank, IGNOU, etc.)
              </p>
            </AlertDescription>
          </Alert>

          <div>
            <Label className="mb-2 block">Upload Certificate</Label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="certificate-upload"
            />
            <label
              htmlFor="certificate-upload"
              className="block border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <QrCode className="h-8 w-8 text-muted-foreground" />
              </div>

              {file ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-primary flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    {file.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </div>
                  {qrData && (
                    <div className="text-xs text-primary font-medium">
                      ✓ QR code detected!
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-sm font-medium mb-1">
                    Click to upload or drag and drop
                  </div>
                  <div className="text-xs text-muted-foreground">
                    PDF, JPEG, PNG (Max 10MB)
                  </div>
                </>
              )}
            </label>
          </div>

          {qrData && (
            <Alert>
              <AlertTitle>QR code data detected</AlertTitle>
              <AlertDescription>
                <p className="break-all font-mono text-xs bg-muted p-2 rounded">
                  {qrData}
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label className="mb-2 block">
              Course Link{' '}
              <span className="text-muted-foreground font-normal">
                (Optional - for NCrF/NSQF analysis)
              </span>
            </Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder="https://udemy.com/course/your-course-name/"
                value={courseLink}
                onChange={(e) => setCourseLink(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Provide the course URL to calculate NCrF credits and NSQF level
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!file || isSubmitting}>
            {isSubmitting
              ? 'Processing...'
              : qrProcessing
                ? 'Scanning...'
                : 'Verify & Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
