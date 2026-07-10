import React from 'react';
import {
  X,
  Award,
  Building,
  ShieldCheck,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { Card } from '@/shared/ui';
import { useNavigate } from 'react-router';

export function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const roles = [
    {
      role: 'learner',
      icon: Award,
      title: 'Learner / Credential Holder',
      description: 'View your profile, badges, and certificates.',
    },
    {
      role: 'employer',
      icon: Building,
      title: 'Employer / Verifier',
      description: 'Verify candidate skills and post opportunities.',
    },
    {
      role: 'regulator',
      icon: ShieldCheck,
      title: 'Regulator / Admin',
      description: 'Manage institutions and platform settings.',
    },
  ];

  const handleRoleSelect = (role) => {
    onClose();
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-fade-in">
      <Card className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-scale-up md:flex-row">
        {/* Left Side Visual */}
        <div className="relative w-full overflow-hidden md:w-2/5 group">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80"
            alt="Login Visual"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-linear-to-br from-primary/95 to-primary" />

          <div className="relative z-10 flex h-full flex-col justify-between p-10 text-primary-foreground">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
                <Award className="h-6 w-6" />
              </div>

              <h2 className="mb-3 text-3xl font-bold tracking-tight">
                Welcome Back
              </h2>

              <p className="leading-relaxed text-primary-foreground/80">
                Access your unified skills portfolio or manage your
                organization's credentials.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/10 p-3 text-sm font-medium backdrop-blur-sm">
                <ShieldCheck className="h-5 w-5" />
                <span>Secure NCVET Standard</span>
              </div>

              <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/10 p-3 text-sm font-medium backdrop-blur-sm">
                <Globe className="h-5 w-5" />
                <span>National Coverage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="relative w-full bg-card p-10 md:w-3/5">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 rounded-full p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-8">
            <h3 className="mb-2 text-2xl font-bold text-foreground">
              Choose your portal
            </h3>

            <p className="text-muted-foreground">
              Select your role to continue to the dashboard.
            </p>
          </div>

          <div className="space-y-4">
            {roles.map(({ role, icon: Icon, title, description }) => (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                className="group flex w-full items-center gap-5 rounded-xl border border-border p-5 text-left transition-all duration-300 hover:border-primary/20 hover:bg-primary/5 hover:shadow-md"
              >
                <div className="rounded-xl bg-primary/10 p-3.5 text-primary shadow-sm transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>

                <div className="flex-1">
                  <h4 className="mb-0.5 font-bold text-foreground transition-colors group-hover:text-primary">
                    {title}
                  </h4>

                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>

                <ArrowRight className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
