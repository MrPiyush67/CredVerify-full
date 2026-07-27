  import {
    Award,
    Bot,
    BrainCircuit,
    Briefcase,
    Brush,
    Check,
    Crown,
    Eye,
    Palette,
    ShieldCheck,
    Sparkles,
    Star,
    TrendingUp,
    UserRoundCheck,
    WandSparkles,
    Zap,
  } from 'lucide-react';

  export const plans = [
    {
      id: 'free',

      name: 'Free',

      icon: Sparkles,

      monthlyPrice: 0,

      annualPrice: 0,

      description:
        'Build, verify and showcase your credentials with everything needed to create a professional digital portfolio.',

      cta: 'Current Plan',

      highlight: false,

      dark: false,

      features: [
        {
          icon: Check,
          title: 'Unlimited Credentials',
        },
        {
          icon: ShieldCheck,
          title: 'QR Verification',
        },
        {
          icon: Award,
          title: 'Public Credential Profile',
        },
        {
          icon: UserRoundCheck,
          title: 'Profile Sharing',
        },
        {
          icon: Briefcase,
          title: 'Employer Visibility',
        },
        {
          icon: Star,
          title: 'Basic Analytics',
        },
      ],
    },

    {
      id: 'go',

      name: 'Go',

      icon: Zap,

      monthlyPrice: 49,

      annualPrice: 39,

      description:
        'Perfect for learners who want AI assistance, enhanced visibility and premium personalization.',

      cta: 'Upgrade to Go',

      highlight: true,

      dark: true,

      badge: 'Most Popular',

      features: [
        {
          icon: Check,
          title: 'Everything in Free',
        },
        {
          icon: Bot,
          title: 'AI Credential Assistant',
        },
        {
          icon: BrainCircuit,
          title: 'Smart Skill Recommendations',
        },
        {
          icon: TrendingUp,
          title: 'Advanced Analytics',
        },
        {
          icon: Crown,
          title: 'Premium Profile Badge',
        },
        {
          icon: Eye,
          title: 'Priority Discover Visibility',
        },
        {
          icon: Palette,
          title: 'Premium Themes',
        },
        {
          icon: WandSparkles,
          title: 'Priority Verification',
        },
      ],
    },

    {
      id: 'plus',

      name: 'Plus',

      icon: Crown,

      monthlyPrice: 149,

      annualPrice: 129,

      description:
        'For professionals actively applying for internships and jobs with powerful AI career tools.',

      cta: 'Upgrade to Plus',

      highlight: false,

      dark: false,

      features: [
        {
          icon: Check,
          title: 'Everything in Go',
        },
        {
          icon: Bot,
          title: 'Unlimited AI Assistant',
        },
        {
          icon: Briefcase,
          title: 'AI Resume Builder',
        },
        {
          icon: BrainCircuit,
          title: 'AI Interview Preparation',
        },
        {
          icon: TrendingUp,
          title: 'Career Insights',
        },
        {
          icon: Eye,
          title: 'Maximum Employer Visibility',
        },
        {
          icon: Brush,
          title: 'Exclusive Premium Themes',
        },
        {
          icon: Sparkles,
          title: 'Early Access Features',
        },
      ],
    },
  ];
