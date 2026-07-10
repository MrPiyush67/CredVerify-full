import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import digilockerApi from '../api/digilockerApi';
import DigilockerDocumentSelector from './DigilockerDocumentSelector';

export default function DigilockerModal({ isOpen, onClose }) {
  const [documents, setDocuments] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const params = new URLSearchParams(window.location.search);
      const digilockerParam = params.get('digilocker');
      const docsParam = params.get('docs');

      if (digilockerParam === 'connected') {
        if (docsParam) {
          try {
            const docs = JSON.parse(decodeURIComponent(docsParam));

            if (docs && Array.isArray(docs) && docs.length > 0) {
              setDocuments(docs);
              // Clean up URL
              window.history.replaceState({}, '', window.location.pathname);
            } else {
              fetchDocumentsFromBackend();
            }
          } catch (e) {
            console.error('Failed to parse documents from URL:', e.message);
            fetchDocumentsFromBackend();
          }
        } else {
          fetchDocumentsFromBackend();
        }
      } else {
        // Modal opened fresh - start OAuth flow immediately
        digilockerApi.startAuth();
      }
    } else {
      // Reset when closed
      setDocuments([]);
      setIsImporting(false);
    }
  }, [isOpen]);

  // Fallback: Fetch documents from backend API
  const fetchDocumentsFromBackend = async () => {
    try {
      const response = await digilockerApi.getFiles();
      const docs = response.data?.files || response.files || [];

      if (docs && docs.length > 0) {
        setDocuments(docs);
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        toast.error('No documents found in your DigiLocker account');
        onClose();
      }
    } catch (error) {
      console.error('Failed to fetch documents from DigiLocker:', error);
      toast.error('Failed to load documents from DigiLocker');
      onClose();
    }
  };

  const handleImport = async (selectedDocs) => {
    setIsImporting(true);
    const loadingToast = toast.loading(`Importing ${selectedDocs.length} document${selectedDocs.length > 1 ? 's' : ''}...`);

    try {
      const result = await digilockerApi.importFiles(selectedDocs);

      toast.dismiss(loadingToast);
      toast.success(`Successfully imported ${result.count} document${result.count > 1 ? 's' : ''}!`, {
        duration: 4000,
        icon: '✅',
      });

      onClose();
      window.location.reload();
    } catch (err) {
      toast.dismiss(loadingToast);
      const errorMsg = err.response?.data?.message || 'Failed to import documents';
      toast.error(errorMsg, { duration: 5000 });
      setIsImporting(false);
    }
  };

  // Show document selector when documents are available
  if (documents.length > 0) {
    return (
      <AnimatePresence>
        <DigilockerDocumentSelector
          documents={documents}
          onImport={handleImport}
          onClose={onClose}
          isLoading={isImporting}
        />
      </AnimatePresence>
    );
  }

  // Show nothing if not loading (OAuth flow handles everything)
  return null;
}
