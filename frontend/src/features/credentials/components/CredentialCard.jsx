import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, XCircle, Eye, MoreVertical, Download, Lock, Trash2, Share2, FileText, Globe } from 'lucide-react';
import { Card, CardContent, Button } from '@common';
import { useDispatch } from 'react-redux';
import { removeCredential, editCredential } from '../redux/credentialsSlice';
import toast from 'react-hot-toast';

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

export default function CredentialCard({ credential, onViewDetails, subcategory }) {
  const dispatch = useDispatch();
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleTogglePublic = async (credential, isPublic) => {
    try {
      await dispatch(editCredential({
        id: credential._id,
        data: { isPublic }
      })).unwrap();

      toast.success(`Credential ${isPublic ? 'made public' : 'made private'}`);
    } catch (error) {
      console.error('Failed to toggle visibility:', error.message || error);
      toast.error(error.message || error || 'Failed to toggle visibility');
    }
  };

  const handleDelete = async (credential, e) => {
    e.stopPropagation();
    setOpenMenuId(null);

    toast((t) => (
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="font-medium text-gray-900">Delete credential?</p>
          <p className="text-sm text-gray-600 mt-1">
            Remove "{credential.title}" permanently
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                await dispatch(removeCredential(credential._id)).unwrap();
                toast.success('Credential deleted successfully', { id: t.id });
              } catch (error) {
                console.error('Failed to delete credential:', error);
                toast.error('Failed to delete credential', { id: t.id });
              }
            }}
            className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      icon: '🗑️',
    });
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
          navigator.clipboard.writeText(shareUrl);
          alert('Link copied to clipboard!');
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === credential._id ? null : credential._id);
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer min-w-[300px] max-w-[300px]" onClick={() => onViewDetails(credential)}>
      {/* Image Preview Section */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {credential.file?.url ? (
          <div className="relative w-full h-full">
            {credential.file.fileType?.includes('image') ? (
              <img
                src={credential.file.url}
                alt={credential.title}
                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : credential.file.fileType?.includes('pdf') ? (
              <iframe
                src={`${credential.file.url}#view=FitH`}
                className="w-full h-full border-0"
                title={credential.title}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#116466]/10 to-[#0d9488]/10">
                <FileText className="h-16 w-16 text-[#116466] mb-2" />
                <span className="text-sm font-medium text-[#116466]">Document</span>
              </div>
            )}
            <div className="w-full h-full flex-col items-center justify-center bg-gradient-to-br from-[#116466]/10 to-[#0d9488]/10" style={{ display: 'none' }}>
              <FileText className="h-16 w-16 text-[#116466] mb-2" />
              <span className="text-sm font-medium text-[#116466]">No Preview</span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#116466]/10 to-[#0d9488]/10">
            <FileText className="h-20 w-20 text-[#116466] mb-3" />
            <span className="text-sm font-medium text-[#116466]">No Document Attached</span>
          </div>
        )}

        {/* Overlay gradient for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* More Options - Positioned on image */}
        <div className="absolute top-2 right-2 z-10">
          <div className="relative">
            <button
              onClick={handleMenuToggle}
              className="p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-md transition-all duration-200 hover:scale-110"
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
          <div className="flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-md text-xs font-medium w-fit">
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

        {/* Subcategory Badge - Positioned at bottom */}
        {subcategory && (
          <div className="absolute bottom-2 left-2">
            <div className="flex items-center px-2.5 py-1 bg-blue-50/90 backdrop-blur-sm rounded-full shadow-md text-xs font-medium w-fit">
              <span className="text-blue-700">{subcategory}</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <CardContent className="p-4 space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base line-clamp-1 text-gray-900 flex-1">
              {credential.title}
            </h3>
            {/* Status Badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 ${getStatusColor(credential.status)}`}>
              {getStatusIcon(credential.status)}
              <span className="capitalize">{credential.status || 'draft'}</span>
            </span>
          </div>
          {credential.issuer && (
            <p className="text-sm text-gray-600 line-clamp-1">
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
  );
}
