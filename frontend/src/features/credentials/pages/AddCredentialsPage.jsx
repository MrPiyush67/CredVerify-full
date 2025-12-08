import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText, Trash2, BookOpen, QrCode, ShieldCheck, Puzzle, FolderKey, LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, PageHeader } from '@common';
import CertificateQrUploadModal from '../components/CertificateQrUploadModal.jsx';
import LinkVerificationModal from '../components/LinkVerificationModal.jsx';
import PortfolioGeneratorModal from '../components/PortfolioGeneratorModal.jsx';
import RegulatorVerificationModal from '../components/RegulatorVerificationModal.jsx';
import ExtensionInstallModal from '../components/ExtensionInstallModal.jsx';
import PlatformVerificationModal from '../components/PlatformVerificationModal.jsx';
import DigilockerModal from '../components/DigilockerModal.jsx';
import PlatformRow from '../components/PlatformRow.jsx';
import UploadMethodCard from '../components/UploadMethodCard.jsx';
import usePlatformHandlers from '../hooks/usePlatformHandlers.js';
import useUploadModals from '../hooks/useUploadModals.js';
import credentialAPI from '../api/credentialApi.js';
import { PROFILE_CATEGORIES, getPlatformsByCategory } from '../platforms.config.js';
import { fetchPlatformProfile } from '@features/platforms/redux/platformsSlice';
import { selectUser } from '@features/auth/redux/authSlice';

export default function AddCredentialsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { profile: platformProfile, isLoading: platformLoading } = useSelector((state) => state.platforms);
  const currentUser = useSelector(selectUser);

  // Custom hooks
  const platformHandlers = usePlatformHandlers();
  const { openModal, closeModal, modals } = useUploadModals();

  // Collapsible sections
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(PROFILE_CATEGORIES.map(cat => [cat, true]))
  );

  // Submitted credentials from upload methods
  const [submittedCredentials, setSubmittedCredentials] = useState([]);

  // Fetch platform profile on mount
  useEffect(() => {
    dispatch(fetchPlatformProfile());
  }, [dispatch]);

  const handleCredentialSubmit = (payload) => {
    // This is where you'll connect to your backend API
    // For now, we'll just store it locally
    setSubmittedCredentials(prev => [...prev, {
      id: Date.now(),
      ...payload,
      submittedAt: new Date().toISOString()
    }]);

    // Modal closes itself on success
  };

  const handleCredentialDelete = (credentialId) => {
    const credential = submittedCredentials.find(c => c.id === credentialId);

    toast((t) => (
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="font-medium text-gray-900">Delete credential?</p>
          <p className="text-sm text-gray-600 mt-1">
            Remove "{credential?.platformName}" from your credentials
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSubmittedCredentials(prev => prev.filter(c => c.id !== credentialId));
              toast.success('Credential removed successfully', { id: t.id });
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

  const handleRegulatorSubmit = async (credentialData) => {
    try {
      const response = await credentialAPI.uploadCredential(credentialData);

      if (response.success) {
        const credential = response.data.credential;
        setSubmittedCredentials(prev => [...prev, {
          id: credential._id,
          uploadMethod: 'Verify with Regulator',
          platformName: credential.title,
          institution: credential.institution,
          status: credential.status,
          submittedAt: credential.createdAt
        }]);
        toast.success('Credential uploaded successfully!');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload credential';
      toast.error(errorMessage);
      console.error('Credential upload error:', error.response?.data || error);
    }
  };

  const uploadMethods = [
    { id: 'extension', onClick: () => openModal('extension'), icon: Puzzle, title: 'Browser Extension', description: 'Install extension to auto-extract certificates from websites' },
    { id: 'regulator', onClick: () => openModal('regulator'), icon: ShieldCheck, title: 'Verify with Regulator', description: 'Upload academic credentials for institutional verification' },
    { id: 'certificate', onClick: () => openModal('certificateQr'), icon: QrCode, title: 'Certificate/QR Upload', description: 'Upload certificate image or PDF with QR code for verification' },
    { id: 'link', onClick: () => openModal('linkVerification'), icon: LinkIcon, title: 'Link Verification', description: 'Enter verification link from Coursera, NPTEL, HackerRank, etc.' },
    { id: 'digilocker', onClick: () => openModal('digilocker'), icon: FolderKey, title: 'DigiLocker', description: 'Import verified documents directly from your DigiLocker account' }
  ];

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Add Credentials"
          description="Upload certificates via QR scan, link verification, DigiLocker, or verify coding platforms to build your verified credential portfolio"
        />
        <div className="flex items-center gap-3 shrink-0 shadow-md">
          <Button
            variant="outline"
            onClick={() => navigate('/credentials/upload-guide')}
            className="flex items-center gap-2 border-[#116466] text-[#116466] hover:bg-[#116466]/5 "
          >
            <BookOpen className="h-5 w-5" />
            How it Works
          </Button>
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold mb-4 text-[#116466]">Upload Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {uploadMethods.map((method) => (
            <UploadMethodCard key={method.id} method={method} />
          ))}
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
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#116466]/10 text-[#116466]">
                      <FileText className="h-5 w-5" />
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
        const hasVerifiedPlatforms = platforms.some(p => platformProfile?.[p.id]?.isVerified);

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

              {category === 'DSA/CP Portfolio' && hasVerifiedPlatforms && (
                <Button
                  size="sm"
                  className="bg-green-600 text-white hover:bg-green-700 shadow-md"
                  onClick={() => openModal('portfolio')}
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
                    {platforms.map((platform) => (
                      <PlatformRow
                        key={platform.id}
                        platform={platform}
                        platformData={platformProfile?.[platform.id]}
                        inputValue={platformHandlers.platformInputs[platform.id] || platformProfile?.[platform.id]?.handle || ''}
                        isSubmitting={platformHandlers.submittingPlatform === platform.id}
                        isRefreshing={platformHandlers.refreshingPlatform === platform.id}
                        onInputChange={platformHandlers.handleInputChange}
                        onSubmit={platformHandlers.handleProfileSubmit}
                        onDelete={platformHandlers.openDeleteConfirmation}
                        onRefresh={platformHandlers.handleRefreshStats}
                        onVerify={platformHandlers.openVerificationModal}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        );
      })}

      {/* Certificate/QR Upload Modal */}
      <CertificateQrUploadModal
        isOpen={modals.isCertificateQrOpen}
        onClose={closeModal}
        onSubmit={handleCredentialSubmit}
      />

      {/* Link Verification Modal */}
      <LinkVerificationModal
        isOpen={modals.isLinkVerificationOpen}
        onClose={closeModal}
        onSubmit={handleCredentialSubmit}
      />

      {/* Portfolio Generator Modal */}
      <PortfolioGeneratorModal
        isOpen={modals.isPortfolioOpen}
        onClose={closeModal}
        platformProfile={platformProfile}
        userName={currentUser?.name || 'Your Name'}
        userBio={currentUser?.bio || 'Software Engineer'}
        userAvatar={currentUser?.avatar || null}
      />

      {/* Platform Verification Modal */}
      <PlatformVerificationModal
        isOpen={platformHandlers.verificationModal.isOpen}
        onClose={platformHandlers.closeVerificationModal}
        platform={platformHandlers.verificationModal.platform}
        handle={platformHandlers.verificationModal.handle}
        platformName={platformHandlers.verificationModal.platformName}
      />

      {/* Regulator Verification Modal */}
      <RegulatorVerificationModal
        isOpen={modals.isRegulatorOpen}
        onClose={closeModal}
        onSubmit={handleRegulatorSubmit}
      />

      {/* Confirm Delete Modal for Profile Links */}
      {platformHandlers.confirmDelete && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={platformHandlers.closeDeleteConfirmation} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-[90%] max-w-md border">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-3">Confirm Deletion</h3>
              <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">
                Your {platformHandlers.confirmDelete.name} profile link will be removed. This action cannot be undone.
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete this profile link?
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={platformHandlers.closeDeleteConfirmation}>Cancel</Button>
                <Button
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => platformHandlers.handleDelete(platformHandlers.confirmDelete.id)}
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
        isOpen={modals.isExtensionOpen}
        onClose={closeModal}
      />

      {/* Digilocker Modal */}
      <DigilockerModal
        isOpen={modals.isDigilockerOpen}
        onClose={closeModal}
      />
    </div>
  );
}
