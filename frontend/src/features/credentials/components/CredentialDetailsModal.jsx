import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Clock, XCircle, ExternalLink, Calendar, User, FileText, Award, Hash, Globe, Lock, Shield, Send } from 'lucide-react';
import { Button, Badge, Loader } from '@common';
import { useDispatch } from 'react-redux';
import { requestCredentialVerification } from '../redux/credentialsSlice';
import toast from 'react-hot-toast';

export default function CredentialDetailsModal({ isOpen, onClose, credential, loading, onSuccess }) {
  const dispatch = useDispatch();
  const [submittingVerification, setSubmittingVerification] = useState(false);
  if (!credential && !loading) return null;

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
              className="bg-card rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
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
              {loading ? (
                <div className="p-12 flex justify-center">
                  <Loader />
                </div>
              ) : credential ? (
                <div className="p-6 space-y-6">{/* Status indicator hidden, stored in meta */}
                  {credential.meta?.status && (
                    <input type="hidden" value={credential.meta.status} />
                  )}

                  {/* Title */}
                  <div>
                    <h3 className="text-2xl font-semibold">{credential.title}</h3>
                    {credential.issuer && (
                      <p className="text-muted-foreground mt-1">{credential.issuer}</p>
                    )}
                  </div>

                  {/* Public/Private Indicator */}
                  <div className="flex items-center gap-2">
                    {credential.isPublic ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-lg">
                        <Globe className="h-4 w-4 text-teal-600" />
                        <span className="text-sm font-medium text-teal-700">Public</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                        <Lock className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Private</span>
                      </div>
                    )}
                    {credential.isIssuerVerified && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Verified Issuer</span>
                      </div>
                    )}
                  </div>

                  {/* Core Information */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-2">
                      Core Information
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {credential.type && (
                        <div className="flex items-start gap-3">
                          <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Type</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {credential.type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      )}

                      {credential.credentialId && (
                        <div className="flex items-start gap-3">
                          <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Credential ID</p>
                            <p className="text-sm text-muted-foreground">{credential.credentialId}</p>
                          </div>
                        </div>
                      )}

                      {credential.issueDate && (
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Issue Date</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(credential.issueDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      )}

                      {credential.totalHours && (
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Total Hours</p>
                            <p className="text-sm text-muted-foreground">{credential.totalHours} hours</p>
                          </div>
                        </div>
                      )}

                      {credential.legalNameSnapshot && (
                        <div className="flex items-start gap-3">
                          <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Legal Name</p>
                            <p className="text-sm text-muted-foreground">{credential.legalNameSnapshot}</p>
                          </div>
                        </div>
                      )}

                      {credential.certificateName && (
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Certificate Name</p>
                            <p className="text-sm text-muted-foreground">{credential.certificateName}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {credential.description && (
                      <div className="pt-2">
                        <p className="text-sm font-medium mb-1">Description</p>
                        <p className="text-sm text-muted-foreground">{credential.description}</p>
                      </div>
                    )}

                    {credential.skills && credential.skills.length > 0 && (
                      <div className="pt-2">
                        <p className="text-sm font-medium mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {credential.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Source Information */}
                  {(credential.sourceUrl || credential.sourceDomain) && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-2">
                        Source Information
                      </h4>
                      
                      <div className="grid grid-cols-1 gap-4">
                        {credential.sourceUrl && (
                          <div className="flex items-start gap-3">
                            <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">Source URL</p>
                              <a
                                href={credential.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline break-all"
                              >
                                {credential.sourceUrl}
                              </a>
                            </div>
                          </div>
                        )}

                        {credential.sourceDomain && (
                          <div className="flex items-start gap-3">
                            <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Domain</p>
                              <p className="text-sm text-muted-foreground">{credential.sourceDomain}</p>
                              {credential.isDomainTrusted && (
                                <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600">
                                  <Shield className="h-3 w-3" />
                                  Trusted Domain
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Owner Information */}
                  {credential.user && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-2">
                        Owner Information
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Name</p>
                            <p className="text-sm text-muted-foreground">{credential.user.name}</p>
                          </div>
                        </div>

                        {credential.user.email && (
                          <div className="flex items-start gap-3">
                            <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Email</p>
                              <p className="text-sm text-muted-foreground">{credential.user.email}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {credential.createdAt && (
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Created</p>
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

                    {credential.updatedAt && (
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Last Updated</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(credential.updatedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Document Link */}
                  {(credential.file?.url || credential.documentUrl) && (
                    <div className="pt-4 border-t">
                      <a
                        href={credential.file?.url || credential.documentUrl}
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
                    <Button onClick={onClose} variant="outline" className="flex-1">
                      Close
                    </Button>
                    {credential.status === 'draft' && (
                      <Button 
                        onClick={async () => {
                          setSubmittingVerification(true);
                          try {
                            await dispatch(requestCredentialVerification(credential._id)).unwrap();
                            toast.success('Verification request submitted successfully!');
                            onSuccess?.();
                            onClose();
                          } catch (error) {
                            toast.error(error || 'Failed to submit verification request');
                          } finally {
                            setSubmittingVerification(false);
                          }
                        }}
                        disabled={submittingVerification}
                        className="flex-1 bg-teal-500 hover:bg-teal-600 text-white gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {submittingVerification ? 'Submitting...' : 'Request Verification'}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  No credential data available
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
