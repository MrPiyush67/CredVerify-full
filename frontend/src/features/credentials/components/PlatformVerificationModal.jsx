import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Copy, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@common';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  requestPlatformVerification,
  verifyPlatformOwnership,
  clearVerificationData,
  fetchPlatformProfile,
} from '@features/platforms/redux/platformsSlice';

export default function PlatformVerificationModal({
  isOpen,
  onClose,
  platform,
  handle,
  platformName
}) {
  const dispatch = useDispatch();
  const { verificationData, isLoading, error } = useSelector((state) => state.platforms);
  const [step, setStep] = useState('request'); // 'request', 'instructions', 'verifying', 'success', 'error'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && platform && handle) {
      dispatch(requestPlatformVerification(platform));
      setStep('request');
    }

    return () => {
      if (!isOpen) {
        dispatch(clearVerificationData());
        setStep('request');
      }
    };
  }, [isOpen, platform, handle, dispatch]);

  useEffect(() => {
    if (verificationData && step === 'request') {
      setStep('instructions');
    }
  }, [verificationData, step]);

  const handleCopy = () => {
    if (verificationData?.code) {
      navigator.clipboard.writeText(verificationData.code);
      setCopied(true);
      toast.success('Verification code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVerify = async () => {
    setStep('verifying');
    try {
      await dispatch(verifyPlatformOwnership(platform)).unwrap();
      toast.success('Platform verified successfully!');
      // Close modal immediately and refresh profile
      onClose();
      await dispatch(fetchPlatformProfile());
    } catch (err) {
      setStep('error');
      toast.error(err || 'Verification failed');
    }
  };

  const getProfileUrl = () => {
    const urls = {
      leetcode: 'https://leetcode.com/profile/',
      github: 'https://github.com/settings/profile',
      codechef: 'https://www.codechef.com/users/edit',
      geeksforgeeks: 'https://auth.geeksforgeeks.org/profile.php',
      hackerrank: 'https://www.hackerrank.com/settings/account',
      atcoder: 'https://atcoder.jp/settings',
      codeforces: 'https://codeforces.com/settings/social',
    };
    return urls[platform] || '#';
  };

  const getInstructionField = () => {
    const fields = {
      leetcode: 'Name, About Me, or Bio',
      github: 'Name, Bio, or About',
      codechef: 'First Name, Bio, or About',
      geeksforgeeks: 'Display Name, Name, or About',
      hackerrank: 'First Name, Bio, or About',
      atcoder: 'Affiliation, Name, or Bio',
      codeforces: 'No verification needed (API-based)',
    };
    return fields[platform] || 'Name, Bio, or About';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Verify Profile</h3>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <AnimatePresence mode="wait">
                {/* Loading State */}
                {step === 'request' && (
                  <motion.div
                    key="request"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8"
                  >
                    <Loader2 className="h-12 w-12 text-[#116466] animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Generating verification code...</p>
                  </motion.div>
                )}

                {/* Instructions */}
                {step === 'instructions' && verificationData && (
                  <motion.div
                    key="instructions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Step 1 */}
                    <div className="text-gray-700">
                      <span className="font-semibold text-gray-900">Step 1:</span> Go to the{' '}
                      <a
                        href={getProfileUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        {getProfileUrl()}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    {/* Step 2 */}
                    <div className="text-gray-700">
                      <span className="font-semibold text-gray-900">Step 2:</span>{' '}
                      Add the verification code to any of the following fields: <strong>{getInstructionField()}</strong>
                    </div>

                    {/* Code Box */}
                    <div className="relative">
                      <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 font-mono text-lg text-center text-gray-900 font-semibold">
                        {verificationData.code}
                      </div>
                      <button
                        onClick={handleCopy}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-md transition-colors"
                        title="Copy code"
                      >
                        {copied ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Copy className="h-5 w-5 text-gray-600" />
                        )}
                      </button>
                    </div>

                    {/* Important Note */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-amber-900">⚠️ Important:</span>{' '}
                        You can add this code to any of the mentioned fields. Our system will automatically detect it.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="text-gray-700">
                      <span className="font-semibold text-gray-900">Step 3:</span> Save your changes on the platform.
                    </div>

                    {/* Step 4 */}
                    <div className="text-gray-700">
                      <span className="font-semibold text-gray-900">Step 4:</span> Click the verify button below to confirm.
                    </div>

                    {/* Note */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">Note:</span>{' '}
                        After successful verification, you can remove the code from your profile.
                      </p>
                    </div>

                    {/* Verify Button */}
                    <Button
                      onClick={handleVerify}
                      disabled={isLoading}
                      className="w-full bg-[#116466] hover:bg-[#0e4f50] text-white py-3 text-base font-medium"
                    >
                      {isLoading ? 'Verifying...' : 'Verify'}
                    </Button>
                  </motion.div>
                )}

                {/* Verifying State */}
                {step === 'verifying' && (
                  <motion.div
                    key="verifying"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8"
                  >
                    <Loader2 className="h-12 w-12 text-[#116466] animate-spin mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">Verifying your profile...</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Checking your {platformName} profile for the verification code
                    </p>
                  </motion.div>
                )}

                {/* Success State */}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-8"
                  >
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      Verification Successful!
                    </h4>
                    <p className="text-gray-600">
                      Your {platformName} account has been verified successfully.
                    </p>
                  </motion.div>
                )}

                {/* Error State */}
                {step === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="py-8"
                  >
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                      Verification Failed
                    </h4>
                    <p className="text-gray-600 mb-4 text-center">
                      {error || 'Could not verify your account. Please make sure the code is in your profile.'}
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setStep('instructions')}
                        className="px-6"
                      >
                        Try Again
                      </Button>
                      <Button
                        onClick={() => {
                          dispatch(requestPlatformVerification(platform));
                          setStep('request');
                        }}
                        className="bg-[#116466] hover:bg-[#0e4f50] text-white px-6"
                      >
                        Request New Code
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
