import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Clock, XCircle, ExternalLink, Calendar, User } from 'lucide-react';
import { Button, Badge } from '@common';

const getStatusIcon = (status) => {
  switch (status) {
    case 'verified':
      return <CheckCircle className="h-4 w-4" />;
    case 'pending':
      return <Clock className="h-4 w-4" />;
    default:
      return <XCircle className="h-4 w-4" />;
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

export default function CredentialDetailsModal({ isOpen, onClose, credential }) {
  if (!credential) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Credential Details</h2>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <Badge className={`${getStatusColor(credential.status)} flex items-center gap-2 px-3 py-1`}>
                    {getStatusIcon(credential.status)}
                    <span className="capitalize">{credential.status}</span>
                  </Badge>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-2xl font-semibold">{credential.title}</h3>
                  {credential.issuer && (
                    <p className="text-muted-foreground mt-1">{credential.issuer}</p>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Submitted Date */}
                  {credential.createdAt && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Submitted</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(credential.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Verified Date */}
                  {credential.verifiedAt && (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Verified</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(credential.verifiedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Verified By */}
                  {credential.verifiedBy && (
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Verified By</p>
                        <p className="text-sm text-muted-foreground">
                          {credential.verifiedBy.name}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {credential.status === 'unverified' && credential.rejectionReason && (
                    <div className="col-span-full p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm font-medium text-red-600 mb-1">Rejection Reason</p>
                      <p className="text-sm text-red-600">{credential.rejectionReason}</p>
                    </div>
                  )}
                </div>

                {/* Document Link */}
                {credential.documentUrl && (
                  <div className="pt-4 border-t">
                    <a
                      href={credential.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Document
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button onClick={onClose} className="flex-1">
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
