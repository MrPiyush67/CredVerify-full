import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderKey, CheckCircle, Loader2, FileText, Download, AlertCircle } from 'lucide-react';
import { Button } from '@common';
import toast from 'react-hot-toast';
import digilockerApi from '../api/digilockerApi';

export default function DigilockerModal({ isOpen, onClose }) {
  const [step, setStep] = useState('connect'); // 'connect', 'loading', 'select', 'importing'
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState(null);


  useEffect(() => {
    if (isOpen) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('digilocker') === 'connected') {
        // Remove query param
        window.history.replaceState({}, '', window.location.pathname);
        // Fetch files
        fetchFiles();
      }
    }
  }, [isOpen]);

  const handleConnect = async () => {
    setStep('loading');
    setError(null);
    
    try {
      // Test authentication first
      console.log('🔍 Testing authentication before DigiLocker redirect...');
      const testResponse = await fetch('http://localhost:5000/api/digilocker/test-auth', {
        credentials: 'include'
      });
      const testData = await testResponse.json();
      
      console.log('Auth test result:', testData);
      
      if (!testData.authenticated) {
        setError(`Authentication failed: ${testData.message}`);
        toast.error(`Please login first: ${testData.message}`);
        setStep('connect');
        return;
      }
      
      console.log('✅ User authenticated:', testData.user.email);
      console.log('🚀 Redirecting to DigiLocker OAuth...');
      
      // Proceed with OAuth
      digilockerApi.startAuth();
    } catch (err) {
      console.error('❌ DigiLocker connection error:', err);
      setError(err.message || 'Failed to connect to DigiLocker');
      toast.error('Failed to connect. Please try again.');
      setStep('connect');
    }
  };

  const fetchFiles = async () => {
    setStep('loading');
    setError(null);
    try {
      const data = await digilockerApi.getFiles();
      setFiles(data.files || []);
      setStep('select');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch Digilocker files');
      setStep('connect');
      toast.error('Failed to fetch files from Digilocker');
    }
  };

  const handleFileToggle = (file) => {
    setSelectedFiles(prev =>
      prev.some(f => f.uri === file.uri)
        ? prev.filter(f => f.uri !== file.uri)
        : [...prev, file]
    );
  };

  const handleImport = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one document');
      return;
    }

    setStep('importing');
    try {
      const result = await digilockerApi.importFiles(selectedFiles);
      toast.success(`Successfully imported ${result.count} document${result.count > 1 ? 's' : ''}`);
      onClose();
      // Optionally refresh credentials list
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import documents');
      toast.error('Failed to import documents');
      setStep('select');
    }
  };

  const handleClose = () => {
    setStep('connect');
    setFiles([]);
    setSelectedFiles([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-linear-to-r from-[#116466] to-[#0e4f50]">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/20">
                <FolderKey className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Add with Digilocker</h2>
                <p className="text-sm text-white/80">Import verified government documents</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-2 hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 min-h-[400px]">
            <AnimatePresence mode="wait">
              {/* Step 1: Connect */}
              {step === 'connect' && (
                <motion.div
                  key="connect"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-[#116466]/10 flex items-center justify-center mb-6">
                    <FolderKey className="h-10 w-10 text-[#116466]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Connect your Digilocker Account</h3>
                  <p className="text-muted-foreground mb-8 max-w-md">
                    Securely import verified documents from your Digilocker account. We use sandbox Digilocker for testing.
                  </p>
                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}
                  <Button
                    onClick={handleConnect}
                    className="bg-[#116466] text-white hover:bg-[#0e4f50] px-8"
                  >
                    Connect Digilocker
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Loading */}
              {step === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <Loader2 className="h-12 w-12 text-[#116466] animate-spin mb-6" />
                  <h3 className="text-xl font-semibold mb-3">Fetching your documents...</h3>
                  <p className="text-muted-foreground">Please wait while we connect to Digilocker</p>
                </motion.div>
              )}

              {/* Step 3: Select Files */}
              {step === 'select' && (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Select Documents to Import</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose the documents you want to add to your credentials
                    </p>
                  </div>

                  {files.length === 0 ? (
                    <div className="py-12 text-center">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-muted-foreground">No documents found in your Digilocker account</p>
                    </div>
                  ) : (
                    <>
                      <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto mb-4">
                        {files.map((file, idx) => {
                          const isSelected = selectedFiles.some(f => f.uri === file.uri);
                          return (
                            <div
                              key={file.uri || idx}
                              onClick={() => handleFileToggle(file)}
                              className={`p-4 cursor-pointer transition-colors ${
                                isSelected ? 'bg-[#116466]/5 border-l-4 border-l-[#116466]' : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`mt-0.5 shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center ${
                                    isSelected
                                      ? 'bg-[#116466] border-[#116466]'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  {isSelected && <CheckCircle className="h-4 w-4 text-white" />}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {file.name || file.doctype || file.documentType || 'Document'}
                                  </div>
                                  {file.date && (
                                    <div className="text-sm text-muted-foreground mt-1">
                                      Date: {new Date(file.date).toLocaleDateString()}
                                    </div>
                                  )}
                                  {file.type && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Type: {file.type}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {selectedFiles.length} of {files.length} selected
                        </span>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={handleClose}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleImport}
                            disabled={selectedFiles.length === 0}
                            className="bg-[#116466] text-white hover:bg-[#0e4f50]"
                          >
                            Import Selected
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Step 4: Importing */}
              {step === 'importing' && (
                <motion.div
                  key="importing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <Loader2 className="h-12 w-12 text-[#116466] animate-spin mb-6" />
                  <h3 className="text-xl font-semibold mb-3">Importing documents...</h3>
                  <p className="text-muted-foreground">
                    Adding {selectedFiles.length} document{selectedFiles.length > 1 ? 's' : ''} to your credentials
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
