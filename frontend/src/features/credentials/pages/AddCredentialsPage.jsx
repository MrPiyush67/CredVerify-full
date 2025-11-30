import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Trash2, Upload, QrCode, Hash, ChevronDown, FileText, ShieldCheck, Puzzle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, PageHeader } from '@common';
import PlatformSelectionModal from '../components/PlatformSelectionModal.jsx';
import PortfolioGeneratorModal from '../components/PortfolioGeneratorModal.jsx';
import ValidantVerificationModal from '../components/ValidantVerificationModal.jsx';
import ExtensionInstallModal from '../components/ExtensionInstallModal.jsx';
import credentialAPI from '../api/credentialApi.js';
import {
  UPLOAD_METHODS,
  PLATFORMS,
  PROFILE_CATEGORIES,
  getPlatformsByUploadMethod,
  getPlatformsByCategory
} from '../platforms.config.js';

export default function AddCredentialsPage() {
  const navigate = useNavigate();

  // Profile link inputs (DSA/CP and Developer)
  const [platformInputs, setPlatformInputs] = useState({});
  const [submittedPlatforms, setSubmittedPlatforms] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Collapsible sections
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(PROFILE_CATEGORIES.map(cat => [cat, true]))
  );

  // Upload method modals
  const [activeUploadMethod, setActiveUploadMethod] = useState(null);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isValidantModalOpen, setIsValidantModalOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);

  // Submitted credentials from upload methods
  const [submittedCredentials, setSubmittedCredentials] = useState([]);

  const handleInputChange = (platformId, value) => {
    setPlatformInputs(prev => ({ ...prev, [platformId]: value }));
  };

  const handleProfileSubmit = (platform) => {
    const username = platformInputs[platform.id];
    if (!username?.trim()) return;

    setSubmittedPlatforms(prev => ({
      ...prev,
      [platform.id]: {
        url: `${platform.baseProfileUrl}${username}`,
        username,
        verified: true
      }
    }));
  };

  const handleDelete = (platformId) => {
    setSubmittedPlatforms(prev => {
      const updated = { ...prev };
      delete updated[platformId];
      return updated;
    });
    setPlatformInputs(prev => ({ ...prev, [platformId]: '' }));
    setConfirmDelete(null);
  };

  const handleCredentialSubmit = (payload) => {
    // This is where you'll connect to your backend API
    // For now, we'll just store it locally
    console.log('Credential submitted:', payload);

    setSubmittedCredentials(prev => [...prev, {
      id: Date.now(),
      ...payload,
      submittedAt: new Date().toISOString()
    }]);

    // Close modal
    setActiveUploadMethod(null);
  };

  const handleCredentialDelete = (credentialId) => {
    setSubmittedCredentials(prev => prev.filter(c => c.id !== credentialId));
  };

  const handleValidantSubmit = async (formData) => {
    try {
      // Call API to upload credential
      const response = await credentialAPI.uploadCredential(formData);

      if (response.success) {
        const credential = response.data.credential;

        // Add to local state for display
        setSubmittedCredentials(prev => [...prev, {
          id: credential._id,
          uploadMethod: 'Verify with Validant',
          platformName: credential.title,
          institution: credential.institution,
          status: credential.status,
          submittedAt: credential.createdAt
        }]);

        // Show success message (you can use a toast notification here)
        console.log('Credential uploaded successfully!');
      }

    } catch (error) {
      console.error('Error submitting credential:', error);
      // Show error to user (you can use a toast notification here)
      alert('Failed to upload credential. Please try again.');
    }
  };

  const renderPlatformRow = (platform) => {
    const isSubmitted = submittedPlatforms[platform.id];
    const inputValue = platformInputs[platform.id] || '';
    return (
      <div key={platform.id} className="flex px-6 items-center gap-3 py-3 border-b last:border-b-0">
        <div className="flex items-center gap-3 w-56 flex-shrink-0">
          {platform.domain ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${platform.domain}&sz=128`}
              alt={`${platform.name} icon`}
              className="h-6 w-6"
            />
          ) : (
            <span className="text-sm font-medium">{platform.icon}</span>
          )}
          <span className="text-sm font-medium">{platform.name}</span>
          {isSubmitted && <CheckCircle className="h-4 w-4 text-green-600" />}
        </div>
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground truncate max-w-[60%]">
              {platform.baseProfileUrl}
            </span>
            <Input
              type="text"
              placeholder={platform.placeholder || 'johndoe'}
              value={inputValue}
              onChange={(e) => handleInputChange(platform.id, e.target.value)}
              disabled={isSubmitted}
              className="pl-[calc(60%+0.5rem)] text-sm"
            />
          </div>
          {isSubmitted ? (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setConfirmDelete({ id: platform.id, name: platform.name })}
              className="rounded-full px-4"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              type="button"
              onClick={() => handleProfileSubmit(platform)}
              disabled={!inputValue.trim()}
              className="rounded-full px-4 bg-[#116466] text-white hover:bg-[#0e4f50]"
            >
              Submit
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <PageHeader
        title="Add Credentials"
        description="Select your upload method below and choose the platform to verify your credentials"
      />

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold mb-4 text-[#116466]">Upload Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <button
            onClick={() => setIsExtensionModalOpen(true)}
            className="text-left border rounded-lg p-6 hover:bg-gray-50 hover:border-[#116466] transition-all"
          >
            <div className="flex flex-col gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[#116466] text-white">
                <Puzzle className="h-6 w-6" />
              </span>
              <div>
                <div className="font-semibold text-lg mb-1">Browser Extension</div>
                <div className="text-sm text-muted-foreground">
                  Install extension to auto-extract certificates from websites
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setIsValidantModalOpen(true)}
            className="text-left border rounded-lg p-6 hover:bg-gray-50 hover:border-[#116466] transition-all"
          >
            <div className="flex flex-col gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[#116466] text-white">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <div className="font-semibold text-lg mb-1">Verify with Validant</div>
                <div className="text-sm text-muted-foreground">
                  Upload academic credentials for institutional verification
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveUploadMethod(UPLOAD_METHODS.PDF)}
            className="text-left border rounded-lg p-6 hover:bg-gray-50 hover:border-[#116466] transition-all"
          >
            <div className="flex flex-col gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[#116466] text-white">
                <Upload className="h-6 w-6" />
              </span>
              <div>
                <div className="font-semibold text-lg mb-1">{UPLOAD_METHODS.PDF}</div>
                <div className="text-sm text-muted-foreground">
                  Upload certificate PDFs from HackerRank, IGNOU, FutureSkills Prime, etc.
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveUploadMethod(UPLOAD_METHODS.QR_CODE)}
            className="text-left border rounded-lg p-6 hover:bg-gray-50 hover:border-[#116466] transition-all"
          >
            <div className="flex flex-col gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[#116466] text-white">
                <QrCode className="h-6 w-6" />
              </span>
              <div>
                <div className="font-semibold text-lg mb-1">{UPLOAD_METHODS.QR_CODE}</div>
                <div className="text-sm text-muted-foreground">
                  Scan QR codes from Skill India, NSDC, DigiLocker certificates
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveUploadMethod(UPLOAD_METHODS.CREDENTIAL_ID)}
            className="text-left border rounded-lg p-6 hover:bg-gray-50 hover:border-[#116466] transition-all"
          >
            <div className="flex flex-col gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[#116466] text-white">
                <Hash className="h-6 w-6" />
              </span>
              <div>
                <div className="font-semibold text-lg mb-1">{UPLOAD_METHODS.CREDENTIAL_ID}</div>
                <div className="text-sm text-muted-foreground">
                  Enter certificate IDs from NPTEL, HackerRank, eSkill India, etc.
                </div>
              </div>
            </div>
          </button>
        </div>
      </motion.section>

      {/* Submitted Credentials Preview */}
      {submittedCredentials.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 text-[#116466]">Submitted Credentials</h2>
          <div className="border rounded-lg overflow-hidden">
            <div className="divide-y bg-white">
              {submittedCredentials.map((credential) => (
                <div key={credential.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-green-100 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="font-medium">{credential.platformName}</div>
                      <div className="text-sm text-muted-foreground">
                        {credential.uploadMethod}
                        {credential.credentialId && ` • ID: ${credential.credentialId}`}
                        {credential.file && ` • ${credential.file.name}`}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCredentialDelete(credential.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Profile Link Sections (DSA/CP & Developer) */}
      {PROFILE_CATEGORIES.map((category, idx) => {
        const platforms = getPlatformsByCategory(category);
        const hasSubmittedPlatforms = platforms.some(p => submittedPlatforms[p.id]);

        return (
          <motion.section
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setOpenSections(s => ({ ...s, [category]: !s[category] }))}
                className="flex items-center gap-2"
              >
                <span className="text-xl font-semibold text-[#116466]">{category}</span>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${openSections[category] ? 'rotate-180' : 'rotate-0'}`}
                />
              </button>

              {category === 'DSA/CP Portfolio' && hasSubmittedPlatforms && (
                <Button
                  size="sm"
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={() => setIsPortfolioModalOpen(true)}
                >
                  Generate Portfolio
                </Button>
              )}
            </div>

            <AnimatePresence initial={false}>
              {openSections[category] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="divide-y bg-white">
                    {platforms.map(renderPlatformRow)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        );
      })}

      {/* Platform Selection Modal */}
      <PlatformSelectionModal
        isOpen={!!activeUploadMethod}
        onClose={() => setActiveUploadMethod(null)}
        uploadMethod={activeUploadMethod}
        platforms={activeUploadMethod ? getPlatformsByUploadMethod(activeUploadMethod) : []}
        onSubmit={handleCredentialSubmit}
      />

      {/* Portfolio Generator Modal */}
      <PortfolioGeneratorModal
        isOpen={isPortfolioModalOpen}
        onClose={() => setIsPortfolioModalOpen(false)}
        submittedPlatforms={submittedPlatforms}
        userName="Your Name"
        userBio="Software Engineer"
      />

      {/* Validant Verification Modal */}
      <ValidantVerificationModal
        isOpen={isValidantModalOpen}
        onClose={() => setIsValidantModalOpen(false)}
        onSubmit={handleValidantSubmit}
      />

      {/* Confirm Delete Modal for Profile Links */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-[90%] max-w-md border">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-3">Confirm Deletion</h3>
              <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">
                Your {confirmDelete.name} profile link will be removed. This action cannot be undone.
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete this profile link?
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                <Button
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => handleDelete(confirmDelete.id)}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extension Install Modal */}
      <ExtensionInstallModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
      />
    </div>
  );
}
