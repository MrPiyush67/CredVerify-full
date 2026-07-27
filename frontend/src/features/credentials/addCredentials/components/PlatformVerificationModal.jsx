import { useState, useEffect } from 'react';
import { Copy, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';

const PROFILE_URLS = {
  leetcode: 'https://leetcode.com/profile/',
  github: 'https://github.com/settings/profile',
  codechef: 'https://www.codechef.com/users/edit',
  geeksforgeeks: 'https://auth.geeksforgeeks.org/profile.php',
  hackerrank: 'https://www.hackerrank.com/settings/account',
  atcoder: 'https://atcoder.jp/settings',
  codeforces: 'https://codeforces.com/settings/social',
};

const INSTRUCTION_FIELDS = {
  leetcode: 'Name, About Me, or Bio',
  github: 'Name, Bio, or About',
  codechef: 'First Name, Bio, or About',
  geeksforgeeks: 'Display Name, Name, or About',
  hackerrank: 'First Name, Bio, or About',
  atcoder: 'Affiliation, Name, or Bio',
  codeforces: 'First Name, Last Name, or Organization',
};

/**
 * Platform Verification Modal — UI only.
 * Replace `simulateRequestCode` / `simulateVerify` with your real API calls.
 */
export default function PlatformVerificationModal({
  isOpen,
  onClose,
  platform = 'leetcode',
  platformName = 'LeetCode',
}) {
  const [step, setStep] = useState('request'); // 'request', 'instructions', 'verifying', 'success', 'error'
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const requestCode = () => {
    setStep('request');
    setTimeout(() => {
      setCode(Math.random().toString(36).slice(2, 10).toUpperCase());
      setStep('instructions');
    }, 900);
  };

  useEffect(() => {
    if (isOpen) requestCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, platform]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Verification code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    setStep('verifying');
    setTimeout(() => {
      // Demo: succeed most of the time
      const success = Math.random() > 0.2;
      if (success) {
        setStep('success');
        toast.success('Platform verified successfully!');
        setTimeout(onClose, 2000);
      } else {
        setError('Could not find the verification code in your profile.');
        setStep('error');
        toast.error('Verification failed');
      }
    }, 1400);
  };

  const profileUrl = PROFILE_URLS[platform] || '#';
  const instructionField = INSTRUCTION_FIELDS[platform] || 'Name, Bio, or About';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Profile</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'request' && (
            <motion.div
              key="request"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                Generating verification code...
              </p>
            </motion.div>
          )}

          {step === 'instructions' && (
            <motion.div
              key="instructions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div>
                <span className="font-semibold">Step 1:</span> Go to the{' '}
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  {profileUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div>
                <span className="font-semibold">Step 2:</span> Add the
                verification code to any of the following fields:{' '}
                <strong>{instructionField}</strong>
              </div>

              <div className="relative">
                <div className="bg-muted border rounded-lg px-4 py-3 font-mono text-lg text-center font-semibold">
                  {code}
                </div>
                <button
                  onClick={handleCopy}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-accent rounded-md transition-colors"
                  title="Copy code"
                >
                  {copied ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Copy className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>

              <Alert>
                <AlertDescription>
                  <span className="font-semibold">Important:</span> You can
                  add this code to any of the mentioned fields. Our system
                  will automatically detect it.
                </AlertDescription>
              </Alert>

              <div>
                <span className="font-semibold">Step 3:</span> Save your
                changes on the platform.
              </div>

              <div>
                <span className="font-semibold">Step 4:</span> Click the
                verify button below to confirm.
              </div>

              <Alert>
                <AlertDescription>
                  <span className="font-semibold">Note:</span> After
                  successful verification, you can remove the code from your
                  profile.
                </AlertDescription>
              </Alert>

              <Button onClick={handleVerify} className="w-full">
                Verify
              </Button>
            </motion.div>
          )}

          {step === 'verifying' && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
              <p className="font-medium">Verifying your profile...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Checking your {platformName} profile for the verification code
              </p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-8"
            >
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">
                Verification Successful!
              </h4>
              <p className="text-muted-foreground">
                Your {platformName} account has been verified successfully.
              </p>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-8"
            >
              <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <h4 className="text-xl font-semibold mb-2 text-center">
                Verification Failed
              </h4>
              <p className="text-muted-foreground mb-4 text-center">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setStep('instructions')}>
                  Try Again
                </Button>
                <Button onClick={requestCode}>Request New Code</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
