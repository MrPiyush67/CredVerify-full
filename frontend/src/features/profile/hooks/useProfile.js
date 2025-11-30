import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchUserProfile,
  updateUserProfile,
  selectProfile,
  selectProfileLoading,
  selectProfileError,
  selectUpdateSuccess,
  clearError,
  clearUpdateSuccess
} from '@features/profile/redux/profileSlice.js';

export function useProfile() {
  const dispatch = useDispatch();
  const profileData = useSelector(selectProfile);
  const loading = useSelector(selectProfileLoading);
  const error = useSelector(selectProfileError);
  const updateSuccess = useSelector(selectUpdateSuccess);

  const fetchProfile = useCallback(async () => {
    try {
      const result = await dispatch(fetchUserProfile());
      return fetchUserProfile.fulfilled.match(result) ? result.payload : null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, [dispatch]);

  const saveProfile = useCallback(async (data) => {
    try {
      const result = await dispatch(updateUserProfile(data));
      return updateUserProfile.fulfilled.match(result) ? result.payload : null;
    } catch (error) {
      console.error('Error saving profile:', error);
      return null;
    }
  }, [dispatch]);

  const clearProfileError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearSuccess = useCallback(() => {
    dispatch(clearUpdateSuccess());
  }, [dispatch]);

  return {
    profileData,
    loading,
    error,
    updateSuccess,
    fetchProfile,
    saveProfile,
    clearError: clearProfileError,
    clearSuccess
  };
}