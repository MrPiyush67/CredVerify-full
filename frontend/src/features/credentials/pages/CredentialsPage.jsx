import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button, PageHeader, Loader } from '@common';
import { fetchCredentials, fetchCredentialById, selectCredentials, selectCredentialsLoading, selectCredentialsError, selectCredentialsPagination, selectSelectedCredential } from '../redux/credentialsSlice';
import { selectUser } from '@features/auth/redux/authSlice';
import CredentialsList from '../components/CredentialsList.jsx';
import CredentialUploadModal from '../components/CredentialUploadModal.jsx';
import CredentialDetailsModal from '../components/CredentialDetailsModal.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function CredentialsPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const credentials = useSelector(selectCredentials);

  // Only learners can add credentials
  const canAddCredential = user?.role === 'learner';
  const loading = useSelector(selectCredentialsLoading);
  const error = useSelector(selectCredentialsError);
  const pagination = useSelector(selectCredentialsPagination);
  const selectedCredential = useSelector(selectSelectedCredential);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCredentials());
  }, [dispatch]);

  const handleViewDetails = async (credential) => {
    setIsDetailsModalOpen(true);
    setDetailsLoading(true);
    try {
      // Fetch full credential details from backend
      await dispatch(fetchCredentialById(credential._id)).unwrap();
    } catch (error) {
      console.error('Failed to fetch credential details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleRefresh = () => dispatch(fetchCredentials({ page: pagination.page }));

  const handlePageChange = (newPage) => dispatch(fetchCredentials({ page: newPage }));

  if (loading && credentials.length === 0) return <Loader type="list" fullScreen />;

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      {/* Header */}
      <PageHeader
        title="Your Credentials"
        description="Manage and submit your certifications for verification"
        action={
          canAddCredential && (
            <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Credential
            </Button>
          )
        }
      />

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive"
        >
          {error}
        </motion.div>
      )}

      {/* Content */}
      {credentials.length === 0 ? (
        <EmptyState onAddCredential={() => setIsUploadModalOpen(true)} />
      ) : (
        <CredentialsList
          credentials={credentials}
          onViewDetails={handleViewDetails}
          onRefresh={handleRefresh}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modals */}
      <CredentialUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleRefresh}
      />

      <CredentialDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        credential={selectedCredential}
        loading={detailsLoading}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
