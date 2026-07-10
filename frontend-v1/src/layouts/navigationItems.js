import {
  Building2,
  Compass,
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

export const navigationItems = {
  learner: {
    main: [
      { label: 'Discover', href: '/discover', icon: Search },
      { label: 'Credentials', href: '/credentials', icon: Home },
      { label: 'Support', href: '/support', icon: LifeBuoy },
    ],
    workspace: [
      { label: 'Add Credential', href: '/credentials/add', icon: Plus },
    ],
    account: [
      { label: 'Profile', href: '/profile', icon: User },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },

  issuer: {
    main: [
      { label: 'Discover', href: '/home', icon: Search },
      {
        label: 'Issued Credentials',
        href: '/issue-credentials',
        icon: ShieldCheck,
      },
      { label: 'Support', href: '/support', icon: LifeBuoy },
    ],
    workspace: [
      { label: 'Issue Credential', href: '/issue-credentials', icon: Plus },
    ],
    account: [
      { label: 'Profile', href: '/profile', icon: User },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },

  regulator: {
    main: [
      { label: 'Discover', href: '/home', icon: Search },
      { label: 'Review Queue', href: '/requests', icon: ShieldCheck },
      { label: 'Support', href: '/support', icon: LifeBuoy },
    ],
    workspace: [
      { label: 'Credential Ratings', href: '/ratings', icon: Sparkles },
    ],
    account: [
      { label: 'Profile', href: '/profile', icon: User },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },

  org_admin: {
    main: [
      { label: 'Discover', href: '/home', icon: Search },
      { label: 'Manage Issuers', href: '/issuers', icon: Users },
      { label: 'Manage Regulators', href: '/regulators', icon: ShieldCheck },
      { label: 'Support', href: '/support', icon: LifeBuoy },
    ],
    workspace: [{ label: 'Org Profile', href: '/profile', icon: Building2 }],
    account: [
      { label: 'Profile', href: '/profile', icon: User },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },

  organization: {
    main: [
      { label: 'Discover', href: '/home', icon: Search },
      { label: 'Manage Issuers', href: '/issuers', icon: Users },
      { label: 'Manage Regulators', href: '/regulators', icon: ShieldCheck },
      { label: 'Support', href: '/support', icon: LifeBuoy },
    ],
    workspace: [{ label: 'Org Profile', href: '/profile', icon: Building2 }],
    account: [
      { label: 'Profile', href: '/profile', icon: User },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
};
