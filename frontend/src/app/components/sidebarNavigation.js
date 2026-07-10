import {
  Building2,
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
        { label: 'Credentials', href: '/credentials', icon: Home },
        { label: 'Support', href: '/support', icon: LifeBuoy },
      ],
    },
    {
      title: 'Workspace',
      items: [
        { label: 'Add Credential', href: '/credentials/add', icon: Plus },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Profile', href: '/profile', icon: User },
        { label: 'Settings', href: '/settings', icon: Settings },
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
        { label: 'Support', href: '/support', icon: LifeBuoy },
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
        { label: 'Profile', href: '/profile', icon: User },
        { label: 'Settings', href: '/settings', icon: Settings },
      ],
    },
  ],

  regulator: [
    {
      title: 'Main',
      items: [
        { label: 'Discover', href: '/discover', icon: Search },
        { label: 'Review Queue', href: '/requests', icon: ShieldCheck },
        { label: 'Support', href: '/support', icon: LifeBuoy },
      ],
    },
    {
      title: 'Workspace',
      items: [
        { label: 'Credential Ratings', href: '/ratings', icon: Sparkles },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Profile', href: '/profile', icon: User },
        { label: 'Settings', href: '/settings', icon: Settings },
      ],
    },
  ],

  org_admin: [
    {
      title: 'Main',
      items: [
        { label: 'Discover', href: '/discover', icon: Search },
        { label: 'Manage Issuers', href: '/issuers', icon: Users },
        { label: 'Manage Regulators', href: '/regulators', icon: ShieldCheck },
        { label: 'Support', href: '/support', icon: LifeBuoy },
      ],
    },
    {
      title: 'Workspace',
      items: [{ label: 'Org Profile', href: '/profile', icon: Building2 }],
    },
    {
      title: 'Account',
      items: [
        { label: 'Profile', href: '/profile', icon: User },
        { label: 'Settings', href: '/settings', icon: Settings },
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
        { label: 'Support', href: '/support', icon: LifeBuoy },
      ],
    },
    {
      title: 'Workspace',
      items: [{ label: 'Org Profile', href: '/profile', icon: Building2 }],
    },
    {
      title: 'Account',
      items: [
        { label: 'Profile', href: '/profile', icon: User },
        { label: 'Settings', href: '/settings', icon: Settings },
      ],
    },
  ],
};
