import React from 'react';
import { X, Award, Building, ShieldCheck, ArrowRight, Globe } from 'lucide-react';
import { Card } from '@/common/ui/Card';

const IMAGES = {
  howItWorks: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80",
};

export function LoginModal({ isOpen, onClose, navigate }) {
  if (!isOpen) return null;

  const roles = [
    {
      role: 'learner',
      icon: Award,
      bgColor: 'bg-teal-100',
      textColor: 'text-[#0F766E]',
      hoverBg: 'group-hover:bg-[#0F766E]',
      title: 'Learner / Credential Holder',
      description: 'View your profile, badges, and certificates.',
    },
    {
      role: 'employer',
      icon: Building,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      hoverBg: 'group-hover:bg-purple-600',
      title: 'Employer / Verifier',
      description: 'Verify candidate skills and post opportunities.',
    },
    {
      role: 'regulator',
      icon: ShieldCheck,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      hoverBg: 'group-hover:bg-blue-600',
      title: 'Regulator / Admin',
      description: 'Manage institutions and platform settings.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <Card className="w-full max-w-4xl overflow-hidden shadow-2xl animate-scale-up flex flex-col md:flex-row border-0 bg-white rounded-2xl">

        {/* Left Side Visual */}
        <div className="w-full md:w-2/5 relative overflow-hidden group">
          <img
            src={IMAGES.howItWorks}
            alt="Login Visual"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F766E]/95 to-teal-900/90" />

          <div className="relative z-10 p-10 h-full flex flex-col justify-between text-white">
            <div>
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 border border-white/20">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3 tracking-tight">Welcome Back</h2>
              <p className="text-teal-50 font-light leading-relaxed">Access your unified skills portfolio or manage your organization's credentials.</p>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-4 text-sm font-medium bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                <ShieldCheck className="w-5 h-5 text-teal-200" />
                <span>Secure NCVET Standard</span>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                <Globe className="w-5 h-5 text-teal-200" />
                <span>National Coverage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Options */}
        <div className="w-full md:w-3/5 p-10 relative bg-white">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Choose your portal</h3>
            <p className="text-slate-500">Select your role to continue to the dashboard.</p>
          </div>

          <div className="space-y-4">
            {roles.map(({ role, icon: Icon, bgColor, textColor, hoverBg, title, description }) => (
              <button
                key={role}
                onClick={() => navigate(`/login?role=${role}`)}
                className="w-full flex items-center gap-5 p-5 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/50 hover:shadow-md transition-all group text-left duration-300"
              >
                <div className={`${bgColor} p-3.5 rounded-xl ${textColor} ${hoverBg} group-hover:text-white transition-all duration-300 shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 mb-0.5 group-hover:text-[#0F766E] transition-colors">{title}</h4>
                  <p className="text-sm text-slate-500 group-hover:text-slate-600 transition-colors">{description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#0F766E] transform group-hover:translate-x-1 transition-all duration-300" />
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
