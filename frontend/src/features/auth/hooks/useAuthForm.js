import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuthError, clearError } from '../redux/authSlice.js';
import toast from 'react-hot-toast';

/**
 * Custom hook for handling auth form state and errors
 * Centralizes error handling and cleanup logic for auth pages
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.showErrorToast - Whether to show toast on auth error (default: true)
 * @returns {Object} - Auth form utilities
 */
export function useAuthForm({ showErrorToast = true } = {}) {
  const dispatch = useDispatch();
  const authError = useSelector(selectAuthError);

  // Handle auth errors from Redux - show toast if enabled
  useEffect(() => {
    if (authError && showErrorToast) {
      toast.error(authError);
    }
  }, [authError, showErrorToast]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return {
    authError,
    clearAuthError: () => dispatch(clearError())
  };
}
