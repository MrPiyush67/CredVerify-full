import { motion } from 'framer-motion';
import { Bell, Mail, Smartphone } from 'lucide-react';
import { Card, Toggle } from '@common';

export default function NotificationSettings({ currentSettings = {}, handleSettingChange, role }) {
  const notifications = currentSettings.notifications || {};

  const handleNotificationChange = (key, value) => {
    handleSettingChange('notifications', { ...notifications, [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose how you want to be notified
          </p>
        </div>

        <div className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Toggle
              checked={notifications.emailNotifications !== false}
              onChange={(checked) => handleNotificationChange('emailNotifications', checked)}
            />
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Push Notifications
              </label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in your browser
              </p>
            </div>
            <Toggle
              checked={notifications.pushNotifications !== false}
              onChange={(checked) => handleNotificationChange('pushNotifications', checked)}
            />
          </div>

          {/* SMS Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                SMS Notifications
              </label>
              <p className="text-sm text-muted-foreground">
                Receive important updates via SMS
              </p>
            </div>
            <Toggle
              checked={notifications.smsNotifications || false}
              onChange={(checked) => handleNotificationChange('smsNotifications', checked)}
            />
          </div>

          {/* Common notifications */}
          {role !== 'regulator' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Weekly Digest</label>
                  <p className="text-sm text-muted-foreground">
                    Get a summary of weekly activity
                  </p>
                </div>
                <Toggle
                  checked={notifications.weeklyDigest !== false}
                  onChange={(checked) => handleNotificationChange('weeklyDigest', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Marketing Emails</label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about new features and tips
                  </p>
                </div>
                <Toggle
                  checked={notifications.marketingEmails || false}
                  onChange={(checked) => handleNotificationChange('marketingEmails', checked)}
                />
              </div>
            </>
          )}

          {/* System Alerts - For regulator and employer */}
          {(role === 'regulator' || role === 'employer') && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">System Alerts</label>
                  <p className="text-sm text-muted-foreground">
                    {role === 'regulator' ? 'Critical system notifications' : 'Important system updates'}
                  </p>
                </div>
                <Toggle
                  checked={notifications.systemAlerts !== false}
                  onChange={(checked) => handleNotificationChange('systemAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Urgent Notifications</label>
                  <p className="text-sm text-muted-foreground">
                    High-priority urgent notifications
                  </p>
                </div>
                <Toggle
                  checked={notifications.urgentNotifications !== false}
                  onChange={(checked) => handleNotificationChange('urgentNotifications', checked)}
                />
              </div>
            </>
          )}

          {/* Weekly Reports */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Weekly Reports</label>
              <p className="text-sm text-muted-foreground">
                {role === 'regulator' ? 'Weekly administrative reports' : 'Weekly activity summary'}
              </p>
            </div>
            <Toggle
              checked={notifications.weeklyReports !== false}
              onChange={(checked) => handleNotificationChange('weeklyReports', checked)}
            />
          </div>

          {/* Role-specific notifications */}
          {role === 'learner' && (
            <>
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <label className="font-medium">Credential Updates</label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about credential verifications
                  </p>
                </div>
                <Toggle
                  checked={notifications.credentialUpdates !== false}
                  onChange={(checked) => handleNotificationChange('credentialUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Job Alerts</label>
                  <p className="text-sm text-muted-foreground">
                    Notifications for matching job opportunities
                  </p>
                </div>
                <Toggle
                  checked={notifications.jobAlerts !== false}
                  onChange={(checked) => handleNotificationChange('jobAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Application Alerts</label>
                  <p className="text-sm text-muted-foreground">
                    Updates on your job applications
                  </p>
                </div>
                <Toggle
                  checked={notifications.applicationAlerts !== false}
                  onChange={(checked) => handleNotificationChange('applicationAlerts', checked)}
                />
              </div>
            </>
          )}

          {role === 'employer' && (
            <>
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <label className="font-medium">Job Alerts</label>
                  <p className="text-sm text-muted-foreground">
                    Updates about your job postings
                  </p>
                </div>
                <Toggle
                  checked={notifications.jobAlerts !== false}
                  onChange={(checked) => handleNotificationChange('jobAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Application Alerts</label>
                  <p className="text-sm text-muted-foreground">
                    Notifications for new applications
                  </p>
                </div>
                <Toggle
                  checked={notifications.applicationAlerts !== false}
                  onChange={(checked) => handleNotificationChange('applicationAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Candidate Alerts</label>
                  <p className="text-sm text-muted-foreground">
                    Notifications for matching candidates
                  </p>
                </div>
                <Toggle
                  checked={notifications.candidateAlerts !== false}
                  onChange={(checked) => handleNotificationChange('candidateAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Interview Alerts</label>
                  <p className="text-sm text-muted-foreground">
                    Reminders for scheduled interviews
                  </p>
                </div>
                <Toggle
                  checked={notifications.interviewAlerts !== false}
                  onChange={(checked) => handleNotificationChange('interviewAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Credential Verification Alerts</label>
                  <p className="text-sm text-muted-foreground">
                    Updates on candidate credential verifications
                  </p>
                </div>
                <Toggle
                  checked={notifications.credentialVerificationAlerts !== false}
                  onChange={(checked) => handleNotificationChange('credentialVerificationAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Monthly Analytics</label>
                  <p className="text-sm text-muted-foreground">
                    Monthly performance analytics report
                  </p>
                </div>
                <Toggle
                  checked={notifications.monthlyAnalytics !== false}
                  onChange={(checked) => handleNotificationChange('monthlyAnalytics', checked)}
                />
              </div>
            </>
          )}

          {role === 'regulator' && (
            <>
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <label className="font-medium">Credential Verification Alerts</label>
                  <p className="text-sm text-muted-foreground">
                    Notifications for pending verifications
                  </p>
                </div>
                <Toggle
                  checked={notifications.credentialVerificationAlerts !== false}
                  onChange={(checked) => handleNotificationChange('credentialVerificationAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Bulk Operation Alerts</label>
                  <p className="text-sm text-muted-foreground">
                    Status updates for bulk operations
                  </p>
                </div>
                <Toggle
                  checked={notifications.bulkOperationAlerts !== false}
                  onChange={(checked) => handleNotificationChange('bulkOperationAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Security Alerts</label>
                  <p className="text-sm text-muted-foreground">
                    Security-related notifications
                  </p>
                </div>
                <Toggle
                  checked={notifications.securityAlerts !== false}
                  onChange={(checked) => handleNotificationChange('securityAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Compliance Alerts</label>
                  <p className="text-sm text-muted-foreground">
                    Compliance and regulatory notifications
                  </p>
                </div>
                <Toggle
                  checked={notifications.complianceAlerts !== false}
                  onChange={(checked) => handleNotificationChange('complianceAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Monthly Analytics</label>
                  <p className="text-sm text-muted-foreground">
                    Monthly platform analytics report
                  </p>
                </div>
                <Toggle
                  checked={notifications.monthlyAnalytics !== false}
                  onChange={(checked) => handleNotificationChange('monthlyAnalytics', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">User Activity Alerts</label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about user activity patterns
                  </p>
                </div>
                <Toggle
                  checked={notifications.userActivityAlerts !== false}
                  onChange={(checked) => handleNotificationChange('userActivityAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">System Maintenance Alerts</label>
                  <p className="text-sm text-muted-foreground">
                    Scheduled maintenance notifications
                  </p>
                </div>
                <Toggle
                  checked={notifications.systemMaintenanceAlerts !== false}
                  onChange={(checked) => handleNotificationChange('systemMaintenanceAlerts', checked)}
                />
              </div>
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
