import { useState } from 'react';
import { X, Link as LinkIcon, CheckCircle, Info, ExternalLink } from 'lucide-react';
import { Button, Input } from '@common';
import toast from 'react-hot-toast';
import { env } from '@utils/env';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Link Verification Modal
 * Simplified - Direct verification link input (no platform selection)
 */
export default function LinkVerificationModal({
  isOpen,
  onClose,
  onSubmit
}) {
  const [verificationLink, setVerificationLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!verificationLink.trim()) {
      toast.error('Please enter a verification link');
      return;
    }

    // Validate URL format
    try {
      new URL(verificationLink);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the manual verification API with direct link
      const response = await fetch(`${env.API_URL}/credentials/manual-verify`, {
        method: 'POST',
        credentials: 'include', // Send cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          link: verificationLink,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Certificate verified successfully!');

        // Pass data back to parent component
        onSubmit({
          uploadMethod: 'Link Verification',
          verificationUrl: result.data.url,
          domain: result.data.domain,
          extractedText: result.data.extractedText,
          screenshot: result.data.screenshot,
        });

        handleClose();
      } else {
        toast.error(result.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify certificate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setVerificationLink('');
    setIsSubmitting(false);
    onClose();
  };

  const isValidUrl = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

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
                <h3 className="text-lg font-semibold">Link Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your certificate verification link
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
                      <li>Copy the verification/certificate URL from the platform</li>
                      <li>Paste it in the field below</li>
                      <li>We'll scrape the page and extract certificate details</li>
                      <li>Your certificate will be verified and saved to your profile</li>
                    </ol>
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-medium">Example verification links:</p>
                      <ul className="text-xs space-y-0.5 ml-4">
                        <li>• Coursera: https://coursera.org/verify/ABC123XYZ</li>
                        <li>• NPTEL: https://nptel.ac.in/noc/certificate/verify</li>
                        <li>• HackerRank: https://hackerrank.com/certificates/abc123</li>
                        <li>• Udemy: https://udemy.com/certificate/UC-abc123/</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Link Input */}
              <div>
                <label className="text-sm font-medium mb-2 block">Certificate Verification Link</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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

              {/* Link Preview */}
              {verificationLink && isValidUrl(verificationLink) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-green-900 mb-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Valid URL detected
                      </p>
                      <p className="text-xs text-green-800 break-all">
                        {verificationLink}
                      </p>
                    </div>
                    <a
                      href={verificationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 shrink-0"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              )}

              {/* URL Domain Info */}
              {verificationLink && isValidUrl(verificationLink) && (
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <p className="text-xs text-gray-600">
                    <strong>Domain:</strong> {new URL(verificationLink).hostname}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                className="bg-[#116466] text-white hover:bg-[#0e4f50]"
                onClick={handleSubmit}
                disabled={!verificationLink.trim() || !isValidUrl(verificationLink) || isSubmitting}
              >
                {isSubmitting ? 'Verifying...' : 'Verify & Upload'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
