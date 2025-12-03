import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDashboardStats,
  fetchUsers,
  fetchAdmins,
  fetchEmployers,
  fetchJobs,
  fetchMyJobs,
  fetchMyApplications,
  fetchCredentialHistory,
  fetchJobStats,
  selectHomeStats,
  selectRoleData,
  selectJobs,
  selectMyJobs,
  selectMyApplications,
  selectCredentialHistory,
  selectJobStats,
  selectIsLoading,
  selectHasErrors,
  selectActiveTab,
  setActiveTab,
  resetAll
} from '../redux/homeSlice.js';
import { selectUser, selectRole } from '@features/auth/redux/authSlice.js';

/**
 * Custom hook for home dashboard functionality
 * Provides all necessary data and actions for the home feature
 */
export const useHome = () => {
  const dispatch = useDispatch();

  // Get current user info
  const currentUser = useSelector(selectUser);
  const userRole = useSelector(selectRole);

  // Get all home data from store
  const stats = useSelector(selectHomeStats);
  const users = useSelector((state) => selectRoleData(state, 'users'));
  const admins = useSelector((state) => selectRoleData(state, 'admins'));
  const employers = useSelector((state) => selectRoleData(state, 'employers'));
  const jobs = useSelector(selectJobs);
  const myJobs = useSelector(selectMyJobs);
  const myApplications = useSelector(selectMyApplications);
  const credentialHistory = useSelector(selectCredentialHistory);
  const jobStats = useSelector(selectJobStats);



  // Get UI state
  const activeTab = useSelector(selectActiveTab);
  const isLoading = useSelector(selectIsLoading);
  const hasErrors = useSelector(selectHasErrors);

  // Action creators
  const actions = {
    // Data fetching actions
    fetchDashboardStats: useCallback((role) => dispatch(fetchDashboardStats(role)), [dispatch]),
    fetchUsers: useCallback((params) => dispatch(fetchUsers(params)), [dispatch]),
    fetchAdmins: useCallback((params) => dispatch(fetchAdmins(params)), [dispatch]),
    fetchEmployers: useCallback((params) => dispatch(fetchEmployers(params)), [dispatch]),
    fetchJobs: useCallback((params) => dispatch(fetchJobs(params)), [dispatch]),
    fetchMyJobs: useCallback((params) => dispatch(fetchMyJobs(params)), [dispatch]),
    fetchMyApplications: useCallback((params) => dispatch(fetchMyApplications(params)), [dispatch]),
    fetchCredentialHistory: useCallback((params) => dispatch(fetchCredentialHistory(params)), [dispatch]),
    fetchJobStats: useCallback(() => dispatch(fetchJobStats()), [dispatch]),

    // UI actions
    setActiveTab: useCallback((tab) => dispatch(setActiveTab(tab)), [dispatch]),
    resetAll: useCallback(() => dispatch(resetAll()), [dispatch]),
  };

  // Helper function to initialize dashboard data
  const initializeDashboard = useCallback(async () => {
    if (!currentUser) {
      return;
    }

    try {
      // Skip dashboard stats - backend-new doesn't have unified endpoint
      // Each role has their own stats endpoint that gets called separately

      // Fetch public data - all authenticated users can view these lists
      await dispatch(fetchUsers());      // credentialists list
      await dispatch(fetchAdmins());     // validants list
      await dispatch(fetchEmployers());  // curators list
      await dispatch(fetchJobs());       // all jobs

      // Fetch role-specific personal data
      if (userRole === 'curator') {
        await dispatch(fetchMyJobs());     // their jobs
        await dispatch(fetchJobStats());   // their stats
      } else if (userRole === 'credentialist') {
        await dispatch(fetchMyApplications());     // their applications
        await dispatch(fetchCredentialHistory());  // their credentials
      }
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
    }
  }, [dispatch, currentUser, userRole]);

  // Helper function to refresh specific data
  const refreshData = useCallback((dataType, params = {}) => {
    switch (dataType) {
      case 'stats':
        return actions.fetchDashboardStats(userRole);
      case 'users':
        return actions.fetchUsers(params);
      case 'admins':
        return actions.fetchAdmins(params);
      case 'employers':
        return actions.fetchEmployers(params);
      case 'jobs':
        return actions.fetchJobs(params);
      case 'myJobs':
        return actions.fetchMyJobs(params);
      case 'myApplications':
        return actions.fetchMyApplications(params);
      case 'credentialHistory':
        return actions.fetchCredentialHistory(params);
      case 'jobStats':
        return actions.fetchJobStats();
      default:
        console.warn(`Unknown data type: ${dataType}`);
        return Promise.resolve();
    }
  }, [actions, userRole]);

  // Helper function to get data for a specific tab
  const getTabData = useCallback((tabName) => {
    switch (tabName) {
      case 'users':
        return { data: users.data || [], loading: users.loading, error: users.error };
      case 'admins':
        return { data: admins.data || [], loading: admins.loading, error: admins.error };
      case 'employers':
        return { data: employers.data || [], loading: employers.loading, error: employers.error };
      case 'jobs':
        return { data: jobs.data || [], loading: jobs.loading, error: jobs.error };
      default:
        return { data: [], loading: false, error: null };
    }
  }, [users, admins, employers, jobs]);

  return {
    // User info
    currentUser,
    userRole,

    // Data
    stats,
    users,
    admins,
    employers,
    jobs,
    myJobs,
    myApplications,
    credentialHistory,
    jobStats,

    // UI state
    activeTab,
    isLoading,
    hasErrors,

    // Actions
    ...actions,

    // Helper functions
    initializeDashboard,
    refreshData,
    getTabData,

    // Computed values - Home is public, everyone can see everything
    canViewAdmins: true,
    canViewEmployers: true,
    canViewUsers: true,
    canViewJobs: true,
    canViewMyJobs: userRole === 'curator',
    canViewMyApplications: userRole === 'credentialist',
    canViewCredentials: userRole === 'credentialist',
    canViewJobStats: userRole === 'curator',
  };
};

export default useHome;