import { motion } from 'framer-motion';
import { Briefcase, DollarSign, Users, Building2 } from 'lucide-react';
import { Card, Toggle } from '@common';

export default function EmployerSettingsView({ currentSettings = {}, handleSettingChange }) {
  // Extract nested sections
  const company = currentSettings.company || {};
  const billing = currentSettings.billing || {};
  const team = currentSettings.team || {};

  // Helper functions for nested updates
  const handleCompanyChange = (key, value) => {
    handleSettingChange('company', { ...company, [key]: value });
  };

  const handleBillingChange = (key, value) => {
    handleSettingChange('billing', { ...billing, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Company & Job Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company & Job Posting
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure your job posting and company settings
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Show Salary Ranges</label>
                <p className="text-sm text-muted-foreground">
                  Display salary information in job postings
                </p>
              </div>
              <Toggle
                checked={company.showSalaryRanges !== false}
                onChange={(checked) => handleCompanyChange('showSalaryRanges', checked)}
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
                onChange={(checked) => handleCompanyChange('autoScreening', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Require Cover Letter</label>
                <p className="text-sm text-muted-foreground">
                  Make cover letters mandatory for applications
                </p>
              </div>
              <Toggle
                checked={company.requireCoverLetter || false}
                onChange={(checked) => handleCompanyChange('requireCoverLetter', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Allow Applications</label>
                <p className="text-sm text-muted-foreground">
                  Accept new job applications
                </p>
              </div>
              <Toggle
                checked={company.allowApplications !== false}
                onChange={(checked) => handleCompanyChange('allowApplications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Application Deadline</label>
                <p className="text-sm text-muted-foreground">
                  How application deadlines are set
                </p>
              </div>
              <select
                value={company.applicationDeadline || 'auto'}
                onChange={(e) => handleCompanyChange('applicationDeadline', e.target.value)}
                className="px-3 py-2 border rounded-lg bg-background"
              >
                <option value="auto">Automatic</option>
                <option value="custom">Custom</option>
                <option value="none">No Deadline</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Candidate Filtering</label>
                <p className="text-sm text-muted-foreground">
                  Filter candidates by verification status
                </p>
              </div>
              <select
                value={company.candidateFiltering || 'verified'}
                onChange={(e) => handleCompanyChange('candidateFiltering', e.target.value)}
                className="px-3 py-2 border rounded-lg bg-background"
              >
                <option value="all">All Candidates</option>
                <option value="verified">Verified Only</option>
                <option value="premium">Premium Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Interview Scheduling</label>
                <p className="text-sm text-muted-foreground">
                  Enable automated interview scheduling
                </p>
              </div>
              <Toggle
                checked={company.interviewScheduling !== false}
                onChange={(checked) => handleCompanyChange('interviewScheduling', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Background Checks</label>
                <p className="text-sm text-muted-foreground">
                  Require background checks for candidates
                </p>
              </div>
              <Toggle
                checked={company.backgroundChecks || false}
                onChange={(checked) => handleCompanyChange('backgroundChecks', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Response Time</label>
                <p className="text-sm text-muted-foreground">
                  Expected response time to candidates
                </p>
              </div>
              <select
                value={company.responseTime || '24'}
                onChange={(e) => handleCompanyChange('responseTime', e.target.value)}
                className="px-3 py-2 border rounded-lg bg-background"
              >
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
                <option value="72">72 hours</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Auto Responders</label>
                <p className="text-sm text-muted-foreground">
                  Send automated responses to applicants
                </p>
              </div>
              <Toggle
                checked={company.autoResponders !== false}
                onChange={(checked) => handleCompanyChange('autoResponders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Chat Availability</label>
                <p className="text-sm text-muted-foreground">
                  Allow candidates to message you
                </p>
              </div>
              <Toggle
                checked={company.chatAvailability !== false}
                onChange={(checked) => handleCompanyChange('chatAvailability', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Office Hours</label>
                <p className="text-sm text-muted-foreground">
                  When your team is available
                </p>
              </div>
              <select
                value={company.officeHours || 'business'}
                onChange={(e) => handleCompanyChange('officeHours', e.target.value)}
                className="px-3 py-2 border rounded-lg bg-background"
              >
                <option value="business">Business Hours (9-5)</option>
                <option value="extended">Extended (8-8)</option>
                <option value="24/7">24/7</option>
              </select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Job Posting Defaults */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Job Posting Defaults
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Set default options for new job postings
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Auto Renew</label>
                <p className="text-sm text-muted-foreground">
                  Automatically renew job postings when expired
                </p>
              </div>
              <Toggle
                checked={company.jobPostingDefaults?.autoRenew || false}
                onChange={(checked) => handleCompanyChange('jobPostingDefaults', {
                  ...(company.jobPostingDefaults || {}),
                  autoRenew: checked
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Default Duration</label>
                <p className="text-sm text-muted-foreground">
                  Default job posting duration in days
                </p>
              </div>
              <select
                value={company.jobPostingDefaults?.defaultDuration || 30}
                onChange={(e) => handleCompanyChange('jobPostingDefaults', {
                  ...(company.jobPostingDefaults || {}),
                  defaultDuration: parseInt(e.target.value)
                })}
                className="px-3 py-2 border rounded-lg bg-background"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Featured Posting</label>
                <p className="text-sm text-muted-foreground">
                  Make new postings featured by default
                </p>
              </div>
              <Toggle
                checked={company.jobPostingDefaults?.featuredPosting || false}
                onChange={(checked) => handleCompanyChange('jobPostingDefaults', {
                  ...(company.jobPostingDefaults || {}),
                  featuredPosting: checked
                })}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Billing Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Billing & Payments
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage billing preferences and notifications
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Auto Renewal</label>
                <p className="text-sm text-muted-foreground">
                  Automatically renew subscriptions
                </p>
              </div>
              <Toggle
                checked={billing.autoRenewal !== false}
                onChange={(checked) => handleBillingChange('autoRenewal', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Billing Emails</label>
                <p className="text-sm text-muted-foreground">
                  Receive billing and invoice emails
                </p>
              </div>
              <Toggle
                checked={billing.billingEmails !== false}
                onChange={(checked) => handleBillingChange('billingEmails', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Usage Alerts</label>
                <p className="text-sm text-muted-foreground">
                  Get notified about usage milestones
                </p>
              </div>
              <Toggle
                checked={billing.usageAlerts !== false}
                onChange={(checked) => handleBillingChange('usageAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Budget Warnings</label>
                <p className="text-sm text-muted-foreground">
                  Alert when approaching budget limits
                </p>
              </div>
              <Toggle
                checked={billing.budgetWarnings !== false}
                onChange={(checked) => handleBillingChange('budgetWarnings', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Payment Method</label>
                <p className="text-sm text-muted-foreground">
                  Default payment method
                </p>
              </div>
              <select
                value={billing.paymentMethod || 'card'}
                onChange={(e) => handleBillingChange('paymentMethod', e.target.value)}
                className="px-3 py-2 border rounded-lg bg-background"
              >
                <option value="card">Credit Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Invoice Delivery</label>
                <p className="text-sm text-muted-foreground">
                  How to receive invoices
                </p>
              </div>
              <select
                value={billing.invoiceDelivery || 'both'}
                onChange={(e) => handleBillingChange('invoiceDelivery', e.target.value)}
                className="px-3 py-2 border rounded-lg bg-background"
              >
                <option value="email">Email Only</option>
                <option value="portal">Portal Only</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Team Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Collaboration
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage team access and collaboration
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Team Notifications</label>
                <p className="text-sm text-muted-foreground">
                  Notify all team members of important updates
                </p>
              </div>
              <Toggle
                checked={team.teamNotifications !== false}
                onChange={(checked) => handleTeamChange('teamNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Role-Based Access</label>
                <p className="text-sm text-muted-foreground">
                  Enable role-based permissions for team
                </p>
              </div>
              <Toggle
                checked={team.roleBasedAccess !== false}
                onChange={(checked) => handleTeamChange('roleBasedAccess', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Collaboration Tools</label>
                <p className="text-sm text-muted-foreground">
                  Enable team collaboration features
                </p>
              </div>
              <Toggle
                checked={team.collaborationTools !== false}
                onChange={(checked) => handleTeamChange('collaborationTools', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Shared Job Postings</label>
                <p className="text-sm text-muted-foreground">
                  Allow team members to edit job postings
                </p>
              </div>
              <Toggle
                checked={team.sharedJobPostings !== false}
                onChange={(checked) => handleTeamChange('sharedJobPostings', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Team Analytics</label>
                <p className="text-sm text-muted-foreground">
                  Share analytics with team members
                </p>
              </div>
              <Toggle
                checked={team.teamAnalytics !== false}
                onChange={(checked) => handleTeamChange('teamAnalytics', checked)}
              />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
