import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import digilockerApi from '../api/digilockerApi';
import DigilockerDocumentSelector from './DigilockerDocumentSelector';

export default function DigilockerModal({ isOpen, onClose }) {
  const [documents, setDocuments] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    console.log('\n========================================');
    console.log('📱 [DigilockerModal] useEffect triggered');
    console.log('========================================');
    console.log('   isOpen:', isOpen);
    console.log('   Current documents state:', documents.length);
    console.log('========================================\n');
    
    if (isOpen) {
      const params = new URLSearchParams(window.location.search);
      const digilockerParam = params.get('digilocker');
      const docsParam = params.get('docs');
      
      console.log('🔍 [DigilockerModal] Checking URL params:');
      console.log('   Full URL:', window.location.href);
      console.log('   digilocker param:', digilockerParam);
      console.log('   docs param present:', !!docsParam);
      console.log('   docs param length:', docsParam?.length || 0);
      
      if (digilockerParam === 'connected') {
        if (docsParam) {
          try {
            console.log('🔄 [DigilockerModal] Parsing documents from URL...');
            console.log('   Raw docs param (first 200 chars):', docsParam.substring(0, 200));
            
            const docs = JSON.parse(decodeURIComponent(docsParam));
            
            console.log('✅ [DigilockerModal] Successfully parsed documents');
            console.log('   Parsed documents count:', docs.length);
            console.log('   Documents:', docs);
            
            if (docs && Array.isArray(docs) && docs.length > 0) {
              console.log('✅ [DigilockerModal] Setting documents to state');
              setDocuments(docs);
              // Clean up URL
              window.history.replaceState({}, '', window.location.pathname);
            } else {
              console.warn('⚠️ [DigilockerModal] Parsed data is not a valid array or is empty');
              console.warn('   Trying to fetch from backend API instead...');
              fetchDocumentsFromBackend();
            }
          } catch (e) {
            console.error('❌ [DigilockerModal] Failed to parse documents from URL');
            console.error('   Error:', e.message);
            console.error('   Error stack:', e.stack);
            console.error('   Docs param (first 500 chars):', docsParam.substring(0, 500));
            console.warn('   Trying to fetch from backend API instead...');
            fetchDocumentsFromBackend();
          }
        } else {
          console.warn('⚠️ [DigilockerModal] DigiLocker connected but no docs param in URL');
          console.warn('   Trying to fetch from backend API instead...');
          fetchDocumentsFromBackend();
        }
      } else {
        // Modal opened fresh - start OAuth flow immediately
        console.log('🚀 [DigilockerModal] Modal opened - starting DigiLocker OAuth flow...');
        digilockerApi.startAuth();
      }
    } else {
      // Reset when closed
      console.log('🔒 [DigilockerModal] Modal closed - resetting state');
      setDocuments([]);
      setIsImporting(false);
    }
  }, [isOpen]);

  // Fallback: Fetch documents from backend API
  const fetchDocumentsFromBackend = async () => {
    try {
      console.log('📡 [DigilockerModal] Fetching documents from backend API...');
      const response = await digilockerApi.getFiles();
      const docs = response.data?.files || response.files || [];
      
      console.log('✅ [DigilockerModal] Received documents from backend:', docs.length);
      
      if (docs && docs.length > 0) {
        setDocuments(docs);
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        console.error('❌ [DigilockerModal] No documents received from backend');
        toast.error('No documents found in your DigiLocker account');
        onClose();
      }
    } catch (error) {
      console.error('❌ [DigilockerModal] Failed to fetch documents from backend:', error);
      toast.error('Failed to load documents from DigiLocker');
      onClose();
    }
  };

  const handleImport = async (selectedDocs) => {
    console.log('\n========================================');
    console.log('🚀🚀🚀 [MODAL] IMPORT STARTED');
    console.log('========================================');
    console.log('📄 Selected documents count:', selectedDocs.length);
    console.log('📄 Selected documents:', selectedDocs.map(d => ({ name: d.name, uri: d.uri })));
    console.log('========================================\n');
    
    setIsImporting(true);
    const loadingToast = toast.loading(`Importing ${selectedDocs.length} document${selectedDocs.length > 1 ? 's' : ''}...`);
    
    try {
      console.log('📤 [MODAL] Calling digilockerApi.importFiles...');
      const result = await digilockerApi.importFiles(selectedDocs);
      
      console.log('\n========================================');
      console.log('✅✅✅ [MODAL] IMPORT SUCCESS');
      console.log('========================================');
      console.log('✅ Import API response:', result);
      console.log('✅ Successfully imported:', result.count, 'credentials');
      console.log('✅ Created credential IDs:', result.credentials?.map(c => c._id));
      console.log('========================================\n');
      
      toast.dismiss(loadingToast);
      toast.success(`Successfully imported ${result.count} document${result.count > 1 ? 's' : ''}!`, {
        duration: 4000,
        icon: '✅',
      });
      
      console.log('🔄 [MODAL] Reloading page to show new credentials...');
      onClose();
      window.location.reload();
    } catch (err) {
      console.log('\n========================================');
      console.error('❌❌❌ [MODAL] IMPORT ERROR');
      console.log('========================================');
      console.error('❌ Error object:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error data:', err.response?.data);
      console.log('========================================\n');
      
      toast.dismiss(loadingToast);
      const errorMsg = err.response?.data?.message || 'Failed to import documents';
      toast.error(errorMsg, { duration: 5000 });
      setIsImporting(false);
    }
  };

  // Show document selector when documents are available
  console.log('\n🔍 [DigilockerModal] Render check:');
  console.log('   documents.length:', documents.length);
  console.log('   Should render selector:', documents.length > 0);
  
  if (documents.length > 0) {
    console.log('\n========================================');
    console.log('📱 [MODAL] RENDERING DOCUMENT SELECTOR');
    console.log('========================================');
    console.log('📄 Documents count:', documents.length);
    console.log('📄 First document:', documents[0]);
    console.log('📄 isImporting:', isImporting);
    console.log('========================================\n');
    
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
  console.log('⚠️ [DigilockerModal] Not rendering selector - documents.length:', documents.length);
  return null;
}
