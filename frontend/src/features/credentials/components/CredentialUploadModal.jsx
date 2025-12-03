import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Link as LinkIcon } from 'lucide-react';
import { Button, Input, Label } from '@common';
import { addCredential, selectCredentialsLoading } from '../redux/credentialsSlice';
import toast from 'react-hot-toast';

export default function CredentialUploadModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const loading = useSelector(selectCredentialsLoading);

  const [title, setTitle] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [uploadType, setUploadType] = useState('link'); // 'file' or 'link'

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !documentUrl.trim()) {
      toast.error('Please provide both title and document URL');
      return;
    }

    try {
      await dispatch(addCredential({ title, documentUrl })).unwrap();
      toast.success('Credential submitted successfully');
      handleClose();
      onSuccess();
    } catch (error) {
      toast.error(error || 'Failed to submit credential');
    }
  };

  const handleClose = () => {
    setTitle('');
    setDocumentUrl('');
    setUploadType('link');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Add New Credential</h2>
                <button
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Credential Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Bachelor's Degree in Computer Science"
                    required
                  />
                </div>

                {/* Upload Type */}
                <div className="space-y-2">
                  <Label>Document Source *</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={uploadType === 'link' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUploadType('link')}
                      className="flex-1 gap-2"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Link
                    </Button>
                    <Button
                      type="button"
                      variant={uploadType === 'file' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUploadType('file')}
                      className="flex-1 gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </Button>
                  </div>
                </div>

                {/* Document URL/Upload */}
                <div className="space-y-2">
                  <Label htmlFor="documentUrl">
                    {uploadType === 'link' ? 'Document URL *' : 'Upload Document *'}
                  </Label>
                  {uploadType === 'link' ? (
                    <Input
                      id="documentUrl"
                      type="url"
                      value={documentUrl}
                      onChange={(e) => setDocumentUrl(e.target.value)}
                      placeholder="https://example.com/document.pdf"
                      required
                    />
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        File upload feature coming soon
                      </p>
                      <p className="text-xs text-muted-foreground">
                        For now, please use a document link
                      </p>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-600">
                    Your credential will be submitted for verification by our admin team.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading || !title || !documentUrl}
                  >
                    {loading ? 'Submitting...' : 'Submit Credential'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
