import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, Globe } from 'lucide-react';
import { Card, Toggle } from '@common';

export default function GeneralSettings({ currentSettings = {}, handleSettingChange, role }) {
  const privacy = currentSettings.privacy || {};
  const company = currentSettings.company || {};

  const handlePrivacyChange = (key, value) => {
    handleSettingChange('privacy', { ...privacy, [key]: value });
  };

  const handleCompanyChange = (key, value) => {
    handleSettingChange('company', { ...company, [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Privacy Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Control what information is visible to others
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Visibility */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Profile Visibility
              </label>
              <p className="text-sm text-muted-foreground">
                Control who can see your profile
              </p>
            </div>
            <select
              value={privacy.profileVisibility || 'public'}
              onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
              className="px-3 py-2 border rounded-lg bg-background"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="connections">Connections Only</option>
            </select>
          </div>

          {/* Show Email */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Show Email Address
              </label>
              <p className="text-sm text-muted-foreground">
                Display your email on your public profile
              </p>
            </div>
            <Toggle
              checked={privacy.showEmail || false}
              onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
            />
          </div>

          {/* Show Phone */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Show Phone Number
              </label>
              <p className="text-sm text-muted-foreground">
                Display your phone number on your public profile
              </p>
            </div>
            <Toggle
              checked={privacy.showPhone || false}
              onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
            />
          </div>

          {/* Allow Messages */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Allow Direct Messages</label>
              <p className="text-sm text-muted-foreground">
                Let other users send you messages
              </p>
            </div>
            <Toggle
              checked={privacy.allowMessages !== false}
              onChange={(e) => handlePrivacyChange('allowMessages', e.target.checked)}
            />
          </div>

          {/* Track Activity */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Track Activity</label>
              <p className="text-sm text-muted-foreground">
                Allow tracking of your profile activity
              </p>
            </div>
            <Toggle
              checked={privacy.trackActivity !== false}
              onChange={(e) => handlePrivacyChange('trackActivity', e.target.checked)}
            />
          </div>

          {/* Company-specific settings for curators */}
          {role === 'curator' && (
            <>
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <label className="font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Show Salary Ranges
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Display salary information in job postings
                  </p>
                </div>
                <Toggle
                  checked={company.showSalaryRanges !== false}
                  onChange={(e) => handleCompanyChange('showSalaryRanges', e.target.checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Auto Screening</label>
                  <p className="text-sm text-muted-foreground">
                    Automatically screen candidates based on criteria
                  </p>
                </div>
                <Toggle
                  checked={company.autoScreening !== false}
                  onChange={(e) => handleCompanyChange('autoScreening', e.target.checked)}
                />
              </div>
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

