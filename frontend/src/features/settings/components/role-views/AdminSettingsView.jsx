import { motion } from 'framer-motion';
import { Shield, Users, Briefcase, Settings as SettingsIcon } from 'lucide-react';
import { Card, Toggle } from '@common';

export default function AdminSettingsView({ currentSettings = {}, handleSettingChange }) {
  // Extract nested sections
  const admin = currentSettings.admin || {};
  const department = currentSettings.department || {};
  const security = currentSettings.security || {};

  // Helper functions for nested updates
  const handleDepartmentChange = (key, value) => {
    handleSettingChange('department', { ...department, [key]: value });
  };

  const handleAdminChange = (key, value) => {
    handleSettingChange('admin', { ...admin, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Admin Operations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Admin Operations
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure administrative workflow settings
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Default Verification Time</label>
                <p className="text-sm text-muted-foreground">
                  Standard time to complete verifications
                </p>
              </div>
              <select
                value={admin.defaultVerificationTime || '48'}
                onChange={(e) => handleAdminChange('defaultVerificationTime', e.target.value)}
                className="px-3 py-2 border rounded-lg bg-background"
              >
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
                <option value="72">72 hours</option>
                <option value="168">1 week</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Auto Assignment</label>
                <p className="text-sm text-muted-foreground">
                  Automatically assign verification tasks
                </p>
              </div>
              <Toggle
                checked={admin.autoAssignment !== false}
                onChange={(checked) => handleAdminChange('autoAssignment', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Bulk Operations</label>
                <p className="text-sm text-muted-foreground">
                  Enable bulk processing of tasks
                </p>
              </div>
              <Toggle
                checked={admin.bulkOperations !== false}
                onChange={(checked) => handleAdminChange('bulkOperations', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Advanced Filters</label>
                <p className="text-sm text-muted-foreground">
                  Use advanced filtering options
                </p>
              </div>
              <Toggle
                checked={admin.advancedFilters !== false}
                onChange={(checked) => handleAdminChange('advancedFilters', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Priority Queue</label>
                <p className="text-sm text-muted-foreground">
                  Enable priority-based task queue
                </p>
              </div>
              <Toggle
                checked={admin.priorityQueue !== false}
                onChange={(checked) => handleAdminChange('priorityQueue', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Automated Workflows</label>
                <p className="text-sm text-muted-foreground">
                  Enable automated workflow execution
                </p>
              </div>
              <Toggle
                checked={admin.automatedWorkflows !== false}
                onChange={(checked) => handleAdminChange('automatedWorkflows', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Escalation Rules</label>
                <p className="text-sm text-muted-foreground">
                  Automatically escalate overdue tasks
                </p>
              </div>
              <Toggle
                checked={admin.escalationRules !== false}
                onChange={(checked) => handleAdminChange('escalationRules', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Quality Control</label>
                <p className="text-sm text-muted-foreground">
                  Enable quality control checks
                </p>
              </div>
              <Toggle
                checked={admin.qualityControl !== false}
                onChange={(checked) => handleAdminChange('qualityControl', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Training Mode</label>
                <p className="text-sm text-muted-foreground">
                  Enable training mode for new admins
                </p>
              </div>
              <Toggle
                checked={admin.trainingMode || false}
                onChange={(checked) => handleAdminChange('trainingMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Supervisor Override</label>
                <p className="text-sm text-muted-foreground">
                  Allow supervisors to override decisions
                </p>
              </div>
              <Toggle
                checked={admin.supervisorOverride || false}
                onChange={(checked) => handleAdminChange('supervisorOverride', checked)}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Department Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Department & Team
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage team collaboration and workload
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Department Notifications</label>
                <p className="text-sm text-muted-foreground">
                  Receive department-wide notifications
                </p>
              </div>
              <Toggle
                checked={department.departmentNotifications !== false}
                onChange={(checked) => handleDepartmentChange('departmentNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Team Collaboration</label>
                <p className="text-sm text-muted-foreground">
                  Enable team collaboration features
                </p>
              </div>
              <Toggle
                checked={department.teamCollaboration !== false}
                onChange={(checked) => handleDepartmentChange('teamCollaboration', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Workload Distribution</label>
                <p className="text-sm text-muted-foreground">
                  How tasks are distributed among team
                </p>
              </div>
              <select
                value={department.workloadDistribution || 'balanced'}
                onChange={(e) => handleDepartmentChange('workloadDistribution', e.target.value)}
                className="px-3 py-2 border rounded-lg bg-background"
              >
                <option value="auto">Automatic</option>
                <option value="manual">Manual</option>
                <option value="balanced">Balanced</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Performance Metrics</label>
                <p className="text-sm text-muted-foreground">
                  Track individual and team performance
                </p>
              </div>
              <Toggle
                checked={department.performanceMetrics !== false}
                onChange={(checked) => handleDepartmentChange('performanceMetrics', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Shift Management</label>
                <p className="text-sm text-muted-foreground">
                  Enable shift scheduling and management
                </p>
              </div>
              <Toggle
                checked={department.shiftManagement !== false}
                onChange={(checked) => handleDepartmentChange('shiftManagement', checked)}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Enhanced Security (Admin-specific) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Enhanced Security
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Additional security settings for administrators
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Password Expiry</label>
                <p className="text-sm text-muted-foreground">
                  Force password change after specified days
                </p>
              </div>
              <select
                value={security.passwordExpiry || '90'}
                onChange={(e) => handleSecurityChange('passwordExpiry', e.target.value)}
                className="px-3 py-2 border rounded-lg bg-background"
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="never">Never</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Login Attempt Limit</label>
                <p className="text-sm text-muted-foreground">
                  Number of failed login attempts before lockout
                </p>
              </div>
              <select
                value={security.loginAttemptLimit || 5}
                onChange={(e) => handleSecurityChange('loginAttemptLimit', parseInt(e.target.value))}
                className="px-3 py-2 border rounded-lg bg-background"
              >
                <option value="3">3 attempts</option>
                <option value="5">5 attempts</option>
                <option value="10">10 attempts</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Audit Trail</label>
                <p className="text-sm text-muted-foreground">
                  Maintain detailed audit trail of all actions
                </p>
              </div>
              <Toggle
                checked={security.auditTrail !== false}
                onChange={(checked) => handleSecurityChange('auditTrail', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Compliance Reporting</label>
                <p className="text-sm text-muted-foreground">
                  Generate compliance reports automatically
                </p>
              </div>
              <Toggle
                checked={security.complianceReporting !== false}
                onChange={(checked) => handleSecurityChange('complianceReporting', checked)}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Dashboard Layout (Admin-specific) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Dashboard Preferences
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Customize your admin dashboard
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Dashboard Layout</label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred dashboard layout
                </p>
              </div>
              <select
                value={admin.dashboardLayout || 'grid'}
                onChange={(e) => handleAdminChange('dashboardLayout', e.target.value)}
                className="px-3 py-2 border rounded-lg bg-background"
              >
                <option value="grid">Grid View</option>
                <option value="list">List View</option>
                <option value="compact">Compact View</option>
              </select>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
