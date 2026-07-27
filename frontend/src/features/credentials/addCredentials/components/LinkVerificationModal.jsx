import { useState } from 'react';
import { Link as LinkIcon, CheckCircle2, ExternalLink } from 'lucide-react';
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
import toast from 'react-hot-toast';

/**
 * Link Verification Modal — UI only.
 * Replace `simulateVerify` with your real API call.
 */
export default function LinkVerificationModal({ isOpen, onClose, onSubmit }) {
  const [verificationLink, setVerificationLink] = useState('');
  const [courseLink, setCourseLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidUrl = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const simulateVerify = () =>
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            url: verificationLink,
            domain: new URL(verificationLink).hostname,
            extractedText: 'Demo certificate text extracted from page.',
          }),
        1200,
      ),
    );

  const handleSubmit = async () => {
    if (!verificationLink.trim()) {
      toast.error('Please enter a verification link');
      return;
    }
    if (!isValidUrl(verificationLink)) {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await simulateVerify();
      toast.success('Certificate verified successfully!');
      onSubmit?.({ uploadMethod: 'Link Verification', ...result });
      handleClose();
    } catch {
      toast.error('Failed to verify certificate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setVerificationLink('');
    setCourseLink('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Link Verification</DialogTitle>
          <DialogDescription>
            Enter your certificate verification link
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <AlertTitle>How it works</AlertTitle>
            <AlertDescription>
              <ol className="list-decimal list-inside space-y-1">
                <li>Copy the verification/certificate URL from the platform</li>
                <li>Paste it in the field below</li>
                <li>We'll scrape the page and extract certificate details</li>
                <li>
                  Your certificate will be verified and saved to your profile
                </li>
              </ol>
              <div className="mt-3 space-y-1">
                <p className="font-medium">Example verification links:</p>
                <ul className="space-y-0.5 ml-4">
                  <li>• Coursera: https://coursera.org/verify/ABC123XYZ</li>
                  <li>• NPTEL: https://nptel.ac.in/noc/certificate/verify</li>
                  <li>• HackerRank: https://hackerrank.com/certificates/abc123</li>
                  <li>• Udemy: https://udemy.com/certificate/UC-abc123/</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          <div>
            <Label className="mb-2 block">Certificate Verification Link</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder="https://coursera.org/verify/ABC123XYZ"
                value={verificationLink}
                onChange={(e) => setVerificationLink(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Paste the complete URL where your certificate can be verified
            </p>
          </div>

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

          {verificationLink && isValidUrl(verificationLink) && (
            <Alert>
              <AlertTitle className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Valid URL detected
              </AlertTitle>
              <AlertDescription>
                <div className="flex items-start justify-between gap-2">
                  <p className="break-all">{verificationLink}</p>
                  <a
                    href={verificationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 shrink-0"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <p className="mt-2">
                  <strong>Domain:</strong> {new URL(verificationLink).hostname}
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !verificationLink.trim() ||
              !isValidUrl(verificationLink) ||
              isSubmitting
            }
          >
            {isSubmitting ? 'Verifying...' : 'Verify & Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
