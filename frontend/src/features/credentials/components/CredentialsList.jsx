import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, XCircle, Eye, ChevronLeft, ChevronRight, MoreVertical, Download, Lock, Unlock, Trash2, Share2, FileText, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@common';
import { useDispatch } from 'react-redux';
import { removeCredential, editCredential } from '../redux/credentialsSlice';

const getStatusIcon = (status) => {
  switch (status) {
    case 'verified':
      return <CheckCircle className="h-3 w-3" />;
    case 'pending':
      return <Clock className="h-3 w-3" />;
    default:
      return <XCircle className="h-3 w-3" />;
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

export default function CredentialsList({ credentials, onViewDetails, pagination, onPageChange }) {
  const dispatch = useDispatch();
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleTogglePublic = async (credential, isPublic) => {
    try {
      await dispatch(editCredential({
        id: credential._id,
        data: { isPublic }
      })).unwrap();
    } catch (error) {
      console.error('Failed to toggle public status:', error);
    }
  };

  const handleDelete = async (credential, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (window.confirm(`Are you sure you want to delete "${credential.title}"?`)) {
      try {
        await dispatch(removeCredential(credential._id)).unwrap();
      } catch (error) {
        console.error('Failed to delete credential:', error);
      }
    }
  };

  const handleDownload = (credential, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (credential.file?.url) {
      window.open(credential.file.url, '_blank');
    }
  };

  const handleShare = async (credential, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    const shareUrl = `${window.location.origin}/credentials/${credential._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: credential.title,
          text: `Check out my credential: ${credential.title}`,
          url: shareUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          // Fallback to clipboard
          navigator.clipboard.writeText(shareUrl);
          alert('Link copied to clipboard!');
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const handleMenuToggle = (credentialId, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === credentialId ? null : credentialId);
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {credentials.map((credential) => (
          <motion.div key={credential._id} variants={item}>
            <Card className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer" onClick={() => onViewDetails(credential)}>
              {/* Image Preview Section */}
              <div className="relative h-48 bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
                {credential.file?.url ? (
                  <div className="relative w-full h-full">
                    {credential.file.fileType?.includes('image') ? (
                      <img
                        src={credential.file.url}
                        alt={credential.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : credential.file.fileType?.includes('pdf') ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-red-50 to-orange-50">
                        <FileText className="h-16 w-16 text-red-500 mb-2" />
                        <span className="text-sm font-medium text-red-700">PDF Document</span>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50">
                        <FileText className="h-16 w-16 text-blue-500 mb-2" />
                        <span className="text-sm font-medium text-blue-700">Document</span>
                      </div>
                    )}
                    <div className="w-full h-full flex-col items-center justify-center bg-linear-to-br from-gray-100 to-gray-200" style={{ display: 'none' }}>
                      <FileText className="h-16 w-16 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-500">No Preview</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-teal-50 to-blue-50">
                    {/* Demo PDF preview */}
                    <div className="relative w-full h-full">
                      <iframe
                        src="https://www.orimi.com/pdf-test.pdf#page=1&view=FitH"
                        className="w-full h-full border-0"
                        title={credential.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full flex-col items-center justify-center bg-linear-to-br from-gray-100 to-gray-200" style={{ display: 'none' }}>
                        <FileText className="h-16 w-16 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-500">Preview Unavailable</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Overlay gradient for better text visibility */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* More Options - Positioned on image */}
                <div className="absolute top-2 right-2 z-10">
                  <div className="relative">
                    <button
                      onClick={(e) => handleMenuToggle(credential._id, e)}
                      className="p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                      title="More options"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-700" />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {openMenuId === credential._id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {credential.file?.url && (
                            <button
                              onClick={(e) => handleDownload(credential, e)}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download</span>
                            </button>
                          )}
                          
                          <button
                            onClick={(e) => handleShare(credential, e)}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                          >
                            <Share2 className="h-4 w-4" />
                            <span>Share</span>
                          </button>
                          
                          <div className="border-t border-gray-100 my-1"></div>
                          
                          <button
                            onClick={(e) => handleDelete(credential, e)}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Public/Private Badge */}
                <div className="absolute top-2 left-2">
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-md text-xs font-medium">
                    {credential.isPublic ? (
                      <>
                        <Globe className="h-3 w-3 text-teal-600" />
                        <span className="text-teal-700">Public</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 text-gray-600" />
                        <span className="text-gray-700">Private</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-base line-clamp-1 text-gray-900">
                    {credential.title}
                  </h3>
                  {credential.issuer && (
                    <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                      {credential.issuer}
                    </p>
                  )}
                </div>

                {credential.createdAt && (
                  <p className="text-xs text-gray-500">
                    {new Date(credential.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                )}

                {/* Public/Private Toggle */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs font-medium text-gray-600">Visibility</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePublic(credential, !credential.isPublic);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                      credential.isPublic ? 'bg-teal-600' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={credential.isPublic}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        credential.isPublic ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* View Details Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(credential);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}
