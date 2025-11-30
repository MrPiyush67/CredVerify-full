import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ExternalLink, Calendar, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@common/ui/Card.jsx';
import { Badge, Button, Input, Label } from '@common';
import { verifyCredentialRequest, rejectCredentialRequest, selectCredentialsLoading } from '@features/credentials/redux/credentialsSlice';
import toast from 'react-hot-toast';

export default function RequestCard({ credential, onSuccess }) {
  const dispatch = useDispatch();
  const loading = useSelector(selectCredentialsLoading);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleVerify = async () => {
    try {
      await dispatch(verifyCredentialRequest(credential._id)).unwrap();
      toast.success('Credential verified successfully');
      onSuccess();
    } catch (error) {
      toast.error(error || 'Failed to verify credential');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await dispatch(rejectCredentialRequest({ id: credential._id, reason: rejectionReason })).unwrap();
      toast.success('Credential rejected');
      setShowRejectDialog(false);
      setRejectionReason('');
      onSuccess();
    } catch (error) {
      toast.error(error || 'Failed to reject credential');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default:
        return 'bg-red-500/10 text-red-600 border-red-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              {credential.credentialist?.name || credential.user?.name || 'Unknown User'}
            </CardTitle>
            <Badge className={getStatusColor(credential.status)}>
              {credential.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{credential.credentialist?.email || credential.user?.email}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Credential Title */}
            <div>
              <p className="text-sm font-medium mb-1">Credential Title:</p>
              <p className="text-sm text-muted-foreground">{credential.title}</p>
            </div>

            {/* Submitted Date */}
            {credential.createdAt && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Submitted: {new Date(credential.createdAt).toLocaleDateString()}
              </div>
            )}

            {/* Verified/Rejected Info */}
            {credential.status === 'verified' && credential.verifiedBy && (
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                <p className="text-xs font-medium text-green-700 dark:text-green-300">
                  ✓ Verified by {credential.verifiedBy.name}
                </p>
                {credential.verifiedAt && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                    on {new Date(credential.verifiedAt).toLocaleDateString()}
                  </p>
                )}
                {credential.verificationNotes && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    "{credential.verificationNotes}"
                  </p>
                )}
              </div>
            )}

            {credential.status === 'rejected' && (
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                <p className="text-xs font-medium text-red-700 dark:text-red-300">
                  ✗ Rejected
                  {credential.verifiedBy && ` by ${credential.verifiedBy.name}`}
                </p>
                {credential.verifiedAt && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    on {new Date(credential.verifiedAt).toLocaleDateString()}
                  </p>
                )}
                {credential.rejectionReason && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    Reason: "{credential.rejectionReason}"
                  </p>
                )}
              </div>
            )}

            {/* Document Link */}
            {credential.documentUrl && (
              <div>
                <a
                  href={credential.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Document
                </a>
              </div>
            )}

            {/* Rejection Reason Input */}
            {showRejectDialog && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 pt-2 border-t"
              >
                <Label htmlFor={`reason-${credential._id}`}>Rejection Reason</Label>
                <Input
                  id={`reason-${credential._id}`}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                />
              </motion.div>
            )}

            {/* Actions - Only show for pending requests */}
            {credential.status === 'pending' && (
              <div className="flex items-center gap-2 pt-2">
                {showRejectDialog ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowRejectDialog(false);
                        setRejectionReason('');
                      }}
                      disabled={loading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleReject}
                      disabled={loading || !rejectionReason.trim()}
                      className="flex-1 bg-red-600 hover:bg-red-700 gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Confirm Reject
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRejectDialog(true)}
                      disabled={loading}
                      className="flex-1 gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleVerify}
                      disabled={loading}
                      className="flex-1 gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Verify
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

