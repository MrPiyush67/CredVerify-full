import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Trash2, Upload, QrCode, Hash, ChevronDown, FileText, ShieldCheck, Puzzle, RefreshCw, Loader2, FolderKey, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input, Button, PageHeader } from '@common';
import PlatformSelectionModal from '../components/PlatformSelectionModal.jsx';
import PortfolioGeneratorModal from '../components/PortfolioGeneratorModal.jsx';
import ValidantVerificationModal from '../components/ValidantVerificationModal.jsx';
import ExtensionInstallModal from '../components/ExtensionInstallModal.jsx';
import PlatformVerificationModal from '../components/PlatformVerificationModal.jsx';
import DigilockerModal from '../components/DigilockerModal.jsx';
import credentialAPI from '../api/credentialApi.js';
import {
  UPLOAD_METHODS,
  PLATFORMS,
  PROFILE_CATEGORIES,
  getPlatformsByUploadMethod,
  getPlatformsByCategory
} from '../platforms.config.js';
import {
  fetchPlatformProfile,
  submitPlatformHandle,
  deletePlatform,
  refreshPlatformStats,
} from '@features/platforms/redux/platformsSlice';
import { selectUser } from '@features/auth/redux/authSlice';

export default function AddCredentialsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { profile: platformProfile, isLoading: platformLoading } = useSelector((state) => state.platforms);
  const currentUser = useSelector(selectUser);

  // Profile link inputs (DSA/CP and Developer)
  const [platformInputs, setPlatformInputs] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [verificationModal, setVerificationModal] = useState({ isOpen: false, platform: null, handle: null, platformName: null });
  const [submittingPlatform, setSubmittingPlatform] = useState(null);

  // Collapsible sections
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(PROFILE_CATEGORIES.map(cat => [cat, true]))
  );

  // Upload method modals
  const [activeUploadMethod, setActiveUploadMethod] = useState(null);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isValidantModalOpen, setIsValidantModalOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isDigilockerModalOpen, setIsDigilockerModalOpen] = useState(false);

  // Submitted credentials from upload methods
  const [submittedCredentials, setSubmittedCredentials] = useState([]);

  // Fetch platform profile on mount
  useEffect(() => {
    dispatch(fetchPlatformProfile());
  }, [dispatch]);

  // Check for DigiLocker callback on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const digilockerParam = params.get('digilocker');
    const docsParam = params.get('docs');
    
    console.log('\n========================================');
    console.log('🔍 [AddCredentialsPage] Checking URL params on mount');
    console.log('========================================');
    console.log('   Full URL:', window.location.href);
    console.log('   Search params:', window.location.search);
    console.log('   digilocker param:', digilockerParam);
    console.log('   docs param present:', !!docsParam);
    console.log('   docs param length:', docsParam?.length || 0);
    if (docsParam) {
      console.log('   docs param preview:', docsParam.substring(0, 100) + '...');
    }
    console.log('========================================\n');
    
    if (digilockerParam === 'connected') {
      console.log('✅ [AddCredentialsPage] DigiLocker callback detected - opening modal');
      setIsDigilockerModalOpen(true);
    }
  }, []);

  const handleInputChange = (platformId, value) => {
    setPlatformInputs(prev => ({ ...prev, [platformId]: value }));
  };

  const handleProfileSubmit = async (platform) => {
    const username = platformInputs[platform.id];
    if (!username?.trim()) return;

    setSubmittingPlatform(platform.id);
    try {
      await dispatch(submitPlatformHandle({ platform: platform.id, handle: username })).unwrap();
      toast.success(`${platform.name} handle submitted successfully!`);
      
      // Open verification modal for platforms that need it
      // Codeforces doesn't need verification modal (direct API)
      if (platform.id !== 'codeforces') {
        setVerificationModal({
          isOpen: true,
          platform: platform.id,
          handle: username,
          platformName: platform.name
        });
      }
    } catch (error) {
      toast.error(error || `Failed to submit ${platform.name} handle`);
    } finally {
      setSubmittingPlatform(null);
    }
  };

  const handleDelete = async (platformId) => {
    try {
      await dispatch(deletePlatform(platformId)).unwrap();
      toast.success('Platform removed successfully');
      setPlatformInputs(prev => ({ ...prev, [platformId]: '' }));
      setConfirmDelete(null);
    } catch (error) {
      toast.error(error || 'Failed to remove platform');
    }
  };

  const handleRefreshStats = async (platformId) => {
    try {
      await dispatch(refreshPlatformStats(platformId)).unwrap();
      toast.success('Stats refreshed successfully!');
    } catch (error) {
      toast.error(error || 'Failed to refresh stats');
    }
  };

  const handleCredentialSubmit = (payload) => {
    // This is where you'll connect to your backend API
    // For now, we'll just store it locally
    setSubmittedCredentials(prev => [...prev, {
      id: Date.now(),
      ...payload,
      submittedAt: new Date().toISOString()
    }]);

    // Close modal
    setActiveUploadMethod(null);
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

  const handleValidantSubmit = async (credentialData) => {
    try {
      // Call API to upload credential
      const response = await credentialAPI.uploadCredential(credentialData);

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

        toast.success('Credential uploaded successfully!');
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload credential';
      toast.error(errorMessage);
      console.error('Credential upload error:', error.response?.data || error);
    }
  };

  const renderPlatformRow = (platform) => {
    const platformData = platformProfile?.[platform.id];
    const isSubmitted = platformData?.handle;
    const isVerified = platformData?.isVerified;
    const isPendingValidation = platformData?.pendingValidation;
    const inputValue = platformInputs[platform.id] || platformData?.handle || '';
    const stats = platformData?.stats;
    
    return (
      <div key={platform.id} className="flex px-6 items-center gap-3 py-3 border-b last:border-b-0">
        <div className="flex items-center gap-3 w-56 shrink-0">
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
            <div className="flex items-center gap-2">
              {isPendingValidation ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 rounded-full border border-yellow-200">
                    <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
                    <span className="text-xs font-medium text-yellow-700">Pending Validant Approval</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setConfirmDelete({ id: platform.id, name: platform.name })}
                    className="rounded-full px-3"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : isVerified ? (
                <>
                  {stats && (
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => handleRefreshStats(platform.id)}
                      disabled={platformLoading}
                      className="rounded-full px-4 gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${platformLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700">Verified</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setConfirmDelete({ id: platform.id, name: platform.name })}
                    className="rounded-full px-3"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    type="button"
                    onClick={() => setVerificationModal({
                      isOpen: true,
                      platform: platform.id,
                      handle: platformData.handle,
                      platformName: platform.name
                    })}
                    disabled={platformLoading}
                    className="rounded-full px-4 bg-[#116466] text-white hover:bg-[#0e4f50]"
                  >
                    Verify
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setConfirmDelete({ id: platform.id, name: platform.name })}
                    className="rounded-full px-3"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ) : (
            <Button
              size="sm"
              type="button"
              onClick={() => handleProfileSubmit(platform)}
              disabled={!inputValue.trim() || submittingPlatform === platform.id}
              className="rounded-full px-4 bg-[#116466] text-white hover:bg-[#0e4f50]"
            >
              {submittingPlatform === platform.id ? 'Submitting...' : 'Submit'}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Add Credentials"
          description="Select your upload method below and choose the platform to verify your credentials"
        />
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate('/credentials/upload-guide')}
            className="flex items-center gap-2 border-[#116466] text-[#116466] hover:bg-[#116466]/5"
          >
            <BookOpen className="h-5 w-5" />
            How it Works
          </Button>
          <Button
            onClick={() => setIsDigilockerModalOpen(true)}
            className="bg-[#116466] text-white hover:bg-[#0e4f50] flex items-center gap-2"
          >
            <FolderKey className="h-5 w-5" />
            Add with Digilocker
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
        platformProfile={platformProfile}
        userName={currentUser?.name || 'Your Name'}
        userBio={currentUser?.bio || 'Software Engineer'}
      />

      {/* Platform Verification Modal */}
      <PlatformVerificationModal
        isOpen={verificationModal.isOpen}
        onClose={() => setVerificationModal({ isOpen: false, platform: null, handle: null, platformName: null })}
        platform={verificationModal.platform}
        handle={verificationModal.handle}
        platformName={verificationModal.platformName}
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

      {/* Digilocker Modal */}
      {console.log('🎯 [AddCredentialsPage] Rendering DigilockerModal, isOpen:', isDigilockerModalOpen)}
      <DigilockerModal
        isOpen={isDigilockerModalOpen}
        onClose={() => {
          console.log('🚪 [AddCredentialsPage] Closing DigilockerModal');
          setIsDigilockerModalOpen(false);
        }}
      />
    </div>
  );
}
