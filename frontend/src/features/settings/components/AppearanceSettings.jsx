import { motion } from 'framer-motion';
import { Palette, Globe, Clock, Monitor } from 'lucide-react';
import { Card, Toggle } from '@common';

export default function AppearanceSettings({ currentSettings = {}, handleSettingChange }) {
  const appearance = currentSettings.appearance || {};

  const handleAppearanceChange = (key, value) => {
    handleSettingChange('appearance', { ...appearance, [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Customize how the application looks
          </p>
        </div>

        <div className="space-y-6">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Theme
              </label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color theme
              </p>
            </div>
            <select
              value={appearance.theme || 'system'}
              onChange={(e) => handleAppearanceChange('theme', e.target.value)}
              className="px-3 py-2 border rounded-lg bg-background"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Language
              </label>
              <p className="text-sm text-muted-foreground">
                Select your preferred language
              </p>
            </div>
            <select
              value={appearance.language || 'en'}
              onChange={(e) => handleAppearanceChange('language', e.target.value)}
              className="px-3 py-2 border rounded-lg bg-background"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          {/* Timezone */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timezone
              </label>
              <p className="text-sm text-muted-foreground">
                Set your local timezone
              </p>
            </div>
            <select
              value={appearance.timezone || 'UTC'}
              onChange={(e) => handleAppearanceChange('timezone', e.target.value)}
              className="px-3 py-2 border rounded-lg bg-background"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Shanghai">Shanghai</option>
              <option value="Australia/Sydney">Sydney</option>
            </select>
          </div>

          {/* Compact View */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Compact View</label>
              <p className="text-sm text-muted-foreground">
                Use a more condensed interface layout
              </p>
            </div>
            <Toggle
              checked={appearance.compactView || false}
              onChange={(e) => handleAppearanceChange('compactView', e.target.checked)}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

