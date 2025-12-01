import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe,
  Lock,
  Shield,
  Award,
  Link as LinkIcon,
  Hash,
  Target
} from 'lucide-react';
import { Button } from '@common';

const DetailRow = ({ icon, label, value, highlight }) => {
  if (!value && value !== 0 && value !== false) return null;
  
  const IconComponent = icon;
  
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5">
        <IconComponent className={`h-4 w-4 ${highlight ? 'text-teal-600' : 'text-gray-400'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
        <dd className={`mt-1 text-sm ${highlight ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
        </dd>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="space-y-1">
    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-2 mb-3">
      {title}
    </h3>
    <dl className="space-y-1">{children}</dl>
  </div>
);

const getStatusColor = (status) => {
  switch (status) {
    case 'verified':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'pending':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'rejected':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'verified':
      return CheckCircle;
    case 'pending':
      return Clock;
    case 'rejected':
      return XCircle;
    default:
      return AlertCircle;
  }
};

export default function CredentialDetailsModal({ isOpen, onClose, credential }) {
  if (!credential) return null;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const StatusIcon = getStatusIcon(credential.status);

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="sticky top-0 bg-linear-to-r from-teal-600 to-teal-500 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6" />
                  <div>
                    <h2 className="text-xl font-bold">{credential.title}</h2>
                    {credential.issuer && (
                      <p className="text-teal-100 text-sm">Issued by {credential.issuer}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 space-y-6">
                {/* Status Banner */}
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${getStatusColor(credential.status)}`}>
                  <StatusIcon className="h-5 w-5" />
                  <div className="flex-1">
                    <span className="font-semibold capitalize">{credential.status}</span>
                    {credential.verificationNotes && (
                      <p className="text-sm mt-1 opacity-80">{credential.verificationNotes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {credential.isPublic ? (
                      <div className="flex items-center gap-1 px-2 py-1 bg-white/50 rounded">
                        <Globe className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Public</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 bg-white/50 rounded">
                        <Lock className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Private</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Core Information */}
                <Section title="Core Information">
                  <DetailRow
                    icon={Award}
                    label="Credential Title"
                    value={credential.title}
                    highlight
                  />
                  <DetailRow
                    icon={User}
                    label="Legal Name"
                    value={credential.legalNameSnapshot}
                  />
                  <DetailRow
                    icon={FileText}
                    label="Certificate Name"
                    value={credential.certificateName}
                  />
                  <DetailRow
                    icon={Target}
                    label="Name Match Confidence"
                    value={credential.nameMatchConfidence ? `${credential.nameMatchConfidence}%` : 'N/A'}
                  />
                  <DetailRow
                    icon={Hash}
                    label="Credential Type"
                    value={credential.type ? credential.type.replace('_', ' ').toUpperCase() : 'N/A'}
                  />
                  <DetailRow
                    icon={Clock}
                    label="Total Hours"
                    value={credential.totalHours ? `${credential.totalHours} hours` : 'N/A'}
                  />
                  <DetailRow
                    icon={User}
                    label="Issuing Organization"
                    value={credential.issuer}
                  />
                  <DetailRow
                    icon={Calendar}
                    label="Issue Date"
                    value={formatDate(credential.issueDate)}
                  />
                  {credential.expiryDate && (
                    <DetailRow
                      icon={Calendar}
                      label="Expiry Date"
                      value={formatDate(credential.expiryDate)}
                    />
                  )}
                </Section>

                {/* Source & Verification */}
                <Section title="Source & Verification">
                  {credential.sourceUrl && (
                    <DetailRow
                      icon={LinkIcon}
                      label="Source URL"
                      value={
                        <a
                          href={credential.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:underline break-all"
                        >
                          {credential.sourceUrl}
                        </a>
                      }
                    />
                  )}
                  <DetailRow
                    icon={Globe}
                    label="Source Domain"
                    value={credential.sourceDomain}
                  />
                  <DetailRow
                    icon={Shield}
                    label="Trusted Domain"
                    value={credential.isDomainTrusted}
                  />
                  <DetailRow
                    icon={Shield}
                    label="Issuer Verified"
                    value={credential.isIssuerVerified}
                    highlight={credential.isIssuerVerified}
                  />
                </Section>

                {/* User Information */}
                {credential.user && (
                  <Section title="Credential Owner">
                    <DetailRow
                      icon={User}
                      label="Name"
                      value={credential.user.name}
                    />
                    <DetailRow
                      icon={User}
                      label="Username"
                      value={credential.user.username}
                    />
                    <DetailRow
                      icon={Hash}
                      label="Email"
                      value={credential.user.email}
                    />
                  </Section>
                )}

                {/* Metadata */}
                {credential.meta && Object.keys(credential.meta).length > 0 && (
                  <Section title="Additional Metadata">
                    {Object.entries(credential.meta).map(([key, value]) => (
                      <DetailRow
                        key={key}
                        icon={Hash}
                        label={key.replace(/([A-Z])/g, ' $1').trim()}
                        value={typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      />
                    ))}
                  </Section>
                )}

                {/* Timeline */}
                <Section title="Timeline">
                  <DetailRow
                    icon={Calendar}
                    label="Created"
                    value={formatDate(credential.createdAt)}
                  />
                  <DetailRow
                    icon={Calendar}
                    label="Last Updated"
                    value={formatDate(credential.updatedAt)}
                  />
                </Section>

                {/* File Information */}
                {credential.file && (
                  <Section title="Attached File">
                    <DetailRow
                      icon={FileText}
                      label="File Name"
                      value={credential.file.fileName}
                    />
                    <DetailRow
                      icon={Hash}
                      label="File Type"
                      value={credential.file.fileType}
                    />
                    {credential.file.url && (
                      <div className="mt-4">
                        <a
                          href={credential.file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          View Original Document
                        </a>
                      </div>
                    )}
                  </Section>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end">
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
