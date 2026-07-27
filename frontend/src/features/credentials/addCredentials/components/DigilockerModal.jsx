import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DigilockerDocumentSelector from './DigilockerDocumentSelector.jsx';

// Swap for your real DigiLocker OAuth + document fetch
const DUMMY_DOCUMENTS = [
  {
    uri: 'doc-1',
    name: 'Class XII Marksheet',
    issuerName: 'CBSE',
    date: '2022-05-20',
    category: 'education',
  },
  {
    uri: 'doc-2',
    name: 'Skill India Certificate — Full Stack Development',
    issuerName: 'NSDC',
    date: '2025-03-14',
    category: 'skill',
    nsqfLevel: 5,
  },
  {
    uri: 'doc-3',
    name: 'AWS Cloud Practitioner',
    issuerName: 'Amazon Web Services',
    date: '2025-11-02',
    category: 'technology',
  },
];

export default function DigilockerModal({ isOpen, onClose }) {
  const [documents, setDocuments] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Simulate the OAuth callback + document fetch delay
      setDocuments(DUMMY_DOCUMENTS);
    } else {
      setDocuments([]);
      setIsImporting(false);
    }
  }, [isOpen]);

  const handleImport = (selectedDocs) => {
    setIsImporting(true);
    const loadingToast = toast.loading(
      `Importing ${selectedDocs.length} document${selectedDocs.length > 1 ? 's' : ''}...`,
    );

    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success(
        `Successfully imported ${selectedDocs.length} document${selectedDocs.length > 1 ? 's' : ''}!`,
        { duration: 4000, icon: '✅' },
      );
      setIsImporting(false);
      onClose();
    }, 1200);
  };

  if (!isOpen || documents.length === 0) return null;

  return (
    <DigilockerDocumentSelector
      documents={documents}
      onImport={handleImport}
      onClose={onClose}
      isLoading={isImporting}
    />
  );
}
