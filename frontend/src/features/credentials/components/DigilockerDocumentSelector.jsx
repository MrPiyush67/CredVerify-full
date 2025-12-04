import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Check, Calendar, Building2 } from 'lucide-react';
import { Button } from '@common';
import toast from 'react-hot-toast';

export default function DigilockerDocumentSelector({ documents, onImport, onClose, isLoading }) {
  const [selectedDocs, setSelectedDocs] = useState([]);

  console.log('\n========================================');
  console.log('📱 [FRONTEND] DigilockerDocumentSelector RENDERED');
  console.log('========================================');
  console.log('📄 Total documents received:', documents?.length || 0);
  console.log('📄 Documents:', documents);
  console.log('📝 Selected documents:', selectedDocs.length);
  console.log('⏳ Is loading:', isLoading);
  console.log('========================================\n');

  const toggleDocument = (doc) => {
    console.log('🔘 [SELECTOR] Toggling document:', doc.name);
    setSelectedDocs(prev => {
      const isSelected = prev.some(d => d.uri === doc.uri);
      const newSelection = isSelected
        ? prev.filter(d => d.uri !== doc.uri)
        : [...prev, doc];
      console.log('📝 [SELECTOR] New selection count:', newSelection.length);
      return newSelection;
    });
  };

  const handleImport = () => {
    if (selectedDocs.length === 0) {
      console.warn('⚠️ [SELECTOR] No documents selected');
      toast.error('Please select at least one document');
      return;
    }
    console.log('\n========================================');
    console.log('🚀 [SELECTOR] IMPORT BUTTON CLICKED');
    console.log('========================================');
    console.log('📄 Selected documents:', selectedDocs.length);
    console.log('📄 Documents to import:', selectedDocs.map(d => ({ name: d.name, uri: d.uri })));
    console.log('========================================\n');
    onImport(selectedDocs);
  };

  const handleSelectAll = () => {
    if (selectedDocs.length === documents.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs([...documents]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blur Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Document Selection Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#116466] via-[#0F766E] to-[#14b8a6] px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Select Documents to Import</h2>
              <p className="text-white/90 mt-1">Choose documents from your DigiLocker account</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Document List */}
        <div className="p-6">
          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-[#116466]">{selectedDocs.length}</span> of{' '}
              <span className="font-semibold">{documents.length}</span> selected
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-sm"
            >
              {selectedDocs.length === documents.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          {/* Document Grid */}
          <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
            {documents.map((doc) => {
              const isSelected = selectedDocs.some(d => d.uri === doc.uri);
              
              return (
                <motion.div
                  key={doc.uri}
                  layout
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => toggleDocument(doc)}
                  className={`
                    relative p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${isSelected 
                      ? 'border-[#116466] bg-[#116466]/5 shadow-md' 
                      : 'border-gray-200 hover:border-[#14b8a6] hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className={`
                      mt-1 shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
                      ${isSelected ? 'bg-[#116466] border-[#116466]' : 'border-gray-300'}
                    `}>
                      {isSelected && (
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      )}
                    </div>

                    {/* Document Icon */}
                    <div className={`
                      shrink-0 w-12 h-12 rounded-lg flex items-center justify-center
                      ${isSelected ? 'bg-[#14b8a6]/20' : 'bg-gray-100'}
                    `}>
                      <FileText className={`w-6 h-6 ${isSelected ? 'text-[#116466]' : 'text-gray-500'}`} />
                    </div>

                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base mb-2">
                        {doc.name || doc.doctype || 'Document'}
                      </h3>
                      
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        {doc.issuerName && (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span>{doc.issuerName}</span>
                          </div>
                        )}
                        {doc.date && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{new Date(doc.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                          </div>
                        )}
                        {doc.nsqfLevel && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            NSQF Level {doc.nsqfLevel}
                          </span>
                        )}
                        {doc.category && (
                          <span className={`
                            px-2 py-0.5 rounded-full text-xs font-medium
                            ${doc.category === 'skill' ? 'bg-purple-100 text-purple-700' : ''}
                            ${doc.category === 'education' ? 'bg-green-100 text-green-700' : ''}
                            ${doc.category === 'technology' ? 'bg-orange-100 text-orange-700' : ''}
                          `}>
                            {doc.category.charAt(0).toUpperCase() + doc.category.slice(1)}
                          </span>
                        )}
                      </div>

                      {doc.description && (
                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={selectedDocs.length === 0 || isLoading}
              className="bg-[#116466] hover:bg-[#0e4f50] text-white min-w-[160px]"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Importing...
                </>
              ) : (
                `Import ${selectedDocs.length} Document${selectedDocs.length !== 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
