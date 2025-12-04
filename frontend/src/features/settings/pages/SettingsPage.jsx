import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import { Button, PageHeader, Loader } from '@common';
import NotificationSettings from '../components/NotificationSettings.jsx';
import SecuritySettings from '../components/SecuritySettings.jsx';
import AppearanceSettings from '../components/AppearanceSettings.jsx';
import GeneralSettings from '../components/GeneralSettings.jsx';
import AdminSettingsView from '../components/role-views/AdminSettingsView.jsx';
import EmployerSettingsView from '../components/role-views/EmployerSettingsView.jsx';
import { selectRole } from '@features/auth/redux/authSlice.js';
import {
  fetchUserSettings,
  updateUserSettings,
  selectSettings,
  selectSettingsLoading,
  selectUpdateSuccess,
  clearUpdateSuccess
} from '../redux/settingsSlice.js';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const role = useSelector(selectRole);
  const settings = useSelector(selectSettings);
  const isLoading = useSelector(selectSettingsLoading);
  const updateSuccess = useSelector(selectUpdateSuccess);

  const [localSettings, setLocalSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    dispatch(fetchUserSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (updateSuccess) {
      setHasChanges(false);
      setTimeout(() => dispatch(clearUpdateSuccess()), 3000);
    }
  }, [updateSuccess, dispatch]);

  const handleSettingChange = (key, value) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    dispatch(updateUserSettings(localSettings));
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  if (isLoading && !settings) return <Loader type="page" />;

  return (
    <div className="min-h-screen max-w-7xl px-6">
      {/* Header */}
      <PageHeader
        title="Settings"
        description="Manage your account preferences and settings."
      >
        {hasChanges && (
          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </motion.div>
        )}
      </PageHeader>
      <div className="max-w-5xl mx-auto px-6 space-y-6">

        {updateSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg"
          >
            Settings saved successfully!
          </motion.div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          <GeneralSettings
            currentSettings={localSettings}
            handleSettingChange={handleSettingChange}
            role={role}
          />

          <NotificationSettings
            currentSettings={localSettings}
            handleSettingChange={handleSettingChange}
            role={role}
          />

          <AppearanceSettings
            currentSettings={localSettings}
            handleSettingChange={handleSettingChange}
          />

          <SecuritySettings
            currentSettings={localSettings}
            handleSettingChange={handleSettingChange}
            role={role}
          />

          {/* Role-Specific Settings */}
          {role === 'validant' && (
            <AdminSettingsView
              currentSettings={localSettings}
              handleSettingChange={handleSettingChange}
            />
          )}

          {role === 'curator' && (
            <EmployerSettingsView
              currentSettings={localSettings}
              handleSettingChange={handleSettingChange}
            />
          )}

          {/* Delete Account */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="rounded-lg border-2 border-red-500 bg-red-50 text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-bold leading-none tracking-tight text-red-600">Delete Account</h3>
              </div>
              <div className="p-6 pt-0">
                <p className="text-sm text-gray-700 mb-4">
                  This action is permanent and cannot be undone. All your data will be permanently deleted.
                </p>
                <div className="flex gap-4">
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700" onClick={() => { }}>
                    Delete My Account
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
