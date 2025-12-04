import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreVertical,
  Eye,
  Download,
  Trash2,
  Lock,
  Unlock,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Globe,
  Shield
} from 'lucide-react';
import { Card } from '@common';

const getStatusIcon = (status) => {
  switch (status) {
    case 'verified':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <FileText className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusBadge = (status) => {
  const styles = {
    verified: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    draft: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  return styles[status] || styles.draft;
};

export default function CredentialsGridView({
  credentials,
  onViewDetails,
  onTogglePublic,
  onDelete,
  onDownload,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleMenuToggle = (credentialId, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === credentialId ? null : credentialId);
  };

  const handleAction = (action, credential, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    action(credential);
  };

  // Close menu when clicking outside
  const handleClickOutside = () => {
    if (openMenuId) setOpenMenuId(null);
  };

  return (
    <div className="relative" onClick={handleClickOutside}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {credentials.map((credential, index) => (
          <motion.div
            key={credential._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
          >
            <Card
              className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer border hover:border-teal-200"
              onClick={() => onViewDetails(credential)}
            >
              {/* PDF Thumbnail */}
              <div className="relative aspect-3/4 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                {credential.file?.url ? (
                  <div className="relative w-full h-full">
                    {credential.file.fileType?.includes('pdf') ? (
                      <iframe
                        src={`${credential.file.url}#view=FitH`}
                        className="w-full h-full border-0"
                        title={credential.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : credential.file.fileType?.includes('image') ? (
                      <img
                        src={credential.file.url}
                        alt={credential.title}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#116466]/10 to-[#0d9488]/10">
                        <FileText className="h-16 w-16 text-[#116466] mb-2" />
                        <span className="text-xs text-[#116466] font-medium">Document</span>
                      </div>
                    )}
                    {/* Fallback for errors */}
                    <div className="absolute inset-0 flex-col items-center justify-center bg-gradient-to-br from-[#116466]/10 to-[#0d9488]/10" style={{ display: 'none' }}>
                      <FileText className="h-16 w-16 text-[#116466] mb-2" />
                      <span className="text-xs text-[#116466] font-medium">No Preview</span>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#116466]/10 to-[#0d9488]/10">
                    <FileText className="h-20 w-20 text-[#116466] mb-3" />
                    <span className="text-sm font-medium text-[#116466]">No Document</span>
                  </div>
                )}
                    {/* Status Badge Overlay */}
                    <div className="absolute top-2 left-2">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(credential.status)}`}>
                        {getStatusIcon(credential.status)}
                        <span className="capitalize">{credential.status}</span>
                      </div>
                    </div>
                    {/* Public/Private Indicator */}
                    <div className="absolute top-2 right-2">
                      {credential.isPublic ? (
                        <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm" title="Public">
                          <Globe className="h-3.5 w-3.5 text-teal-600" />
                        </div>
                      ) : (
                        <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm" title="Private">
                          <Lock className="h-3.5 w-3.5 text-gray-600" />
                        </div>
                      )}
                    </div>
                    {/* Verified Badge */}
                    {credential.status === 'verified' && credential.isIssuerVerified && (
                      <div className="absolute bottom-2 right-2">
                        <div className="bg-green-500 p-1.5 rounded-full shadow-lg" title="Verified by issuer">
                          <Shield className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <FileText className="h-16 w-16 text-gray-300 mb-2" />
                    <span className="text-xs text-gray-400">No preview available</span>
                  </div>
                )}
              </div>

              {/* Credential Info */}
              <div className="p-3 border-t">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-900 truncate" title={credential.title}>
                      {credential.title}
                    </h3>
                    {credential.issuer && (
                      <p className="text-xs text-gray-500 truncate mt-0.5" title={credential.issuer}>
                        {credential.issuer}
                      </p>
                    )}
                    {credential.type && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {credential.type.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* More Options Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => handleMenuToggle(credential._id, e)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="More options"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-600" />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {openMenuId === credential._id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => handleAction(onViewDetails, credential, e)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                          
                          {credential.file?.url && (
                            <button
                              onClick={(e) => handleAction(onDownload, credential, e)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </button>
                          )}
                          
                          <button
                            onClick={(e) => handleAction(onTogglePublic, credential, e)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                          >
                            {credential.isPublic ? (
                              <>
                                <Lock className="h-4 w-4" />
                                Make Private
                              </>
                            ) : (
                              <>
                                <Unlock className="h-4 w-4" />
                                Make Public
                              </>
                            )}
                          </button>
                          
                          <div className="border-t border-gray-100 my-1"></div>
                          
                          <button
                            onClick={(e) => handleAction(onDelete, credential, e)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
