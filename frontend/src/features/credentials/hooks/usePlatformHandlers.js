import { useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import {
  submitPlatformHandle,
  deletePlatform,
  refreshPlatformStats,
} from '@features/platforms/redux/platformsSlice';

export default function usePlatformHandlers() {
  const dispatch = useDispatch();
  const [platformInputs, setPlatformInputs] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [verificationModal, setVerificationModal] = useState({
    isOpen: false,
    platform: null,
    handle: null,
    platformName: null,
  });
  const [submittingPlatform, setSubmittingPlatform] = useState(null);
  const [refreshingPlatform, setRefreshingPlatform] = useState(null);

  const handleInputChange = (platformId, value) => {
    setPlatformInputs((prev) => ({ ...prev, [platformId]: value }));
  };

  const handleProfileSubmit = async (platform) => {
    const username = platformInputs[platform.id];
    if (!username?.trim()) return;

    setSubmittingPlatform(platform.id);
    try {
      await dispatch(
        submitPlatformHandle({ platform: platform.id, handle: username })
      ).unwrap();
      toast.success(`${platform.name} handle submitted successfully!`);

      // Open verification modal for all platforms
      setVerificationModal({
        isOpen: true,
        platform: platform.id,
        handle: username,
        platformName: platform.name,
      });
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
      setPlatformInputs((prev) => ({ ...prev, [platformId]: '' }));
      setConfirmDelete(null);
    } catch (error) {
      toast.error(error || 'Failed to remove platform');
    }
  };

  const handleRefreshStats = async (platformId) => {
    setRefreshingPlatform(platformId);
    try {
      await dispatch(refreshPlatformStats(platformId)).unwrap();
      toast.success('Stats refreshed successfully!');
    } catch (error) {
      toast.error(error || 'Failed to refresh stats');
    } finally {
      setRefreshingPlatform(null);
    }
  };

  const openDeleteConfirmation = (platformId, platformName) => {
    setConfirmDelete({ id: platformId, name: platformName });
  };

  const closeDeleteConfirmation = () => {
    setConfirmDelete(null);
  };

  const openVerificationModal = (platform, handle, platformName) => {
    setVerificationModal({
      isOpen: true,
      platform,
      handle,
      platformName,
    });
  };

  const closeVerificationModal = () => {
    setVerificationModal({
      isOpen: false,
      platform: null,
      handle: null,
      platformName: null,
    });
  };

  return {
    platformInputs,
    confirmDelete,
    verificationModal,
    submittingPlatform,
    refreshingPlatform,
    handleInputChange,
    handleProfileSubmit,
    handleDelete,
    handleRefreshStats,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    openVerificationModal,
    closeVerificationModal,
  };
}
