import {
  Bell,
  Building2,
  Crown,
  Home,
  LifeBuoy,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from 'lucide-react';

export const sidebarNavigation = {
  learner: [
    {
      title: 'Main',
      items: [
        { label: 'Discover', href: '/discover', icon: Search },
        { label: 'Notifications', href: '/notifications', icon: Bell },
      ],
    },
    {
      title: 'Workspace',
      items: [
        { label: 'Credentials', href: '/credentials', icon: Home },
        { label: 'Add Credential', href: '/credentials/add', icon: Plus },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Profile', href: '/profile/:username', icon: User },
        { label: 'Settings', href: '/settings', icon: Settings },
        { label: 'Premium', href: '/premium', icon: Crown },
        { label: 'Support', href: '/support', icon: LifeBuoy },
      ],
    },
  ],

  issuer: [
    {
      title: 'Main',
      items: [
        { label: 'Discover', href: '/discover', icon: Search },
        {
          label: 'Issued Credentials',
          href: '/issue-credentials',
          icon: ShieldCheck,
        },
        { label: 'Review Queue', href: '/requests', icon: ShieldCheck },
      ],
    },
    {
      title: 'Workspace',
      items: [
        { label: 'Issue Credential', href: '/issue-credentials', icon: Plus },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Profile', href: '/profile/:username', icon: User },
        { label: 'Settings', href: '/settings', icon: Settings },
        { label: 'Support', href: '/support', icon: LifeBuoy },
      ],
    },
  ],

  regulator: [
    {
      title: 'Main',
      items: [{ label: 'Discover', href: '/discover', icon: Search }],
    },
    {
      title: 'Workspace',
      items: [
        {
          label: 'Verify Organization',
          href: '/verify-organization',
          icon: Building2,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Profile', href: '/profile/:username', icon: User },
        { label: 'Settings', href: '/settings', icon: Settings },
        { label: 'Support', href: '/support', icon: LifeBuoy },
      ],
    },
  ],

  organization: [
    {
      title: 'Main',
      items: [
        { label: 'Discover', href: '/discover', icon: Search },
        { label: 'Manage Issuers', href: '/issuers', icon: Users },
        { label: 'Manage Regulators', href: '/regulators', icon: ShieldCheck },
      ],
    },
    {
      title: 'Workspace',
      items: [
        { label: 'Org Profile', href: '/profile/:organizationName', icon: Building2 },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Profile', href: '/profile/:username', icon: User },
        { label: 'Settings', href: '/settings', icon: Settings },
        { label: 'Support', href: '/support', icon: LifeBuoy },
      ],
    },
  ],
};
