import { motion } from 'framer-motion';
import { Shield, Lock, Clock, AlertTriangle } from 'lucide-react';
import { Card, Toggle } from '@common';

export default function SecuritySettings({ currentSettings = {}, handleSettingChange, role }) {
  const security = currentSettings.security || {};

  // Determine default session timeout based on role
  const defaultSessionTimeout = role === 'regulator' ? '8' : '24';

  const handleSecurityChange = (key, value) => {
    handleSettingChange('security', { ...security, [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account security settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Two-Factor Authentication
              </label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
                {role === 'regulator' && ' (Recommended for regulators)'}
              </p>
            </div>
            <Toggle
              checked={role === 'regulator' ? (security.twoFactorAuth !== false) : (security.twoFactorAuth || false)}
              onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
            />
          </div>

          {/* Login Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Login Notifications
              </label>
              <p className="text-sm text-muted-foreground">
                Get notified of new login attempts
              </p>
            </div>
            <Toggle
              checked={security.loginNotifications !== false}
              onChange={(e) => handleSecurityChange('loginNotifications', e.target.checked)}
            />
          </div>

          {/* Session Timeout */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Session Timeout
              </label>
              <p className="text-sm text-muted-foreground">
                Automatically log out after inactivity
                {role === 'regulator' && ' (Shorter timeout for regulators)'}
              </p>
            </div>
            <select
              value={security.sessionTimeout || defaultSessionTimeout}
              onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
              className="px-3 py-2 border rounded-lg bg-background"
            >
              <option value="1">1 hour</option>
              <option value="4">4 hours</option>
              {role === 'regulator' && <option value="8">8 hours</option>}
              <option value="12">12 hours</option>
              {role !== 'regulator' && <option value="24">24 hours</option>}
              {role !== 'regulator' && <option value="168">1 week</option>}
              {role !== 'regulator' && <option value="never">Never</option>}
            </select>
          </div>

          {/* IP Whitelist */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">IP Whitelist</label>
              <p className="text-sm text-muted-foreground">
                Only allow login from specific IP addresses
              </p>
            </div>
            <Toggle
              checked={security.ipWhitelist || false}
              onChange={(e) => handleSecurityChange('ipWhitelist', e.target.checked)}
            />
          </div>

          {/* Audit Logging */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Audit Logging</label>
              <p className="text-sm text-muted-foreground">
                Keep a log of all account activities
              </p>
            </div>
            <Toggle
              checked={security.auditLogging !== false}
              onChange={(e) => handleSecurityChange('auditLogging', e.target.checked)}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
