import React from 'react';
import { CheckCircle, ArrowRight, Briefcase } from 'lucide-react';
import { Button } from '@/common/ui/Button';

const IMAGES = {
  heroBg: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80",
  heroCredentials: "/landing/hero-credentials.png",
};

export function HeroSection({ onGetStarted }) {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-slate-50">
      {/* Elegant Background Mesh */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-teal-100/50 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-50/50 blur-[120px]" />
        <div className="absolute top-[20%] left-[15%] w-[300px] h-[300px] rounded-full bg-purple-50/30 blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-[#0F766E] text-sm font-semibold border border-teal-100 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
              <CheckCircle className="w-4 h-4" />
              <span className="tracking-wide">NCVET & NSQF Aligned</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
              One Profile.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F766E] via-teal-500 to-teal-400">
                Infinite Possibilities.
              </span>
            </h1>

            <p className="text-xl text-slate-600 max-w-xl leading-relaxed font-normal animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
              The National Micro-Credential Aggregator. Unifying your fragmented certificates into a single, verified digital portfolio powered by blockchain.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
              <Button size="lg" className="gap-2 h-12 px-8 text-base !bg-[#0F766E] !hover:bg-[#0F766E]/90 !text-white shadow-lg shadow-teal-900/20 hover:shadow-teal-900/30 transition-all" onClick={onGetStarted}>
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base bg-white/50 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-slate-300" onClick={onGetStarted}>
                Employer Verification
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-6 text-sm text-slate-600 font-medium animate-fade-in-up" style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                    </div>
                  ))}
                </div>
                <span className="font-semibold text-slate-700">10k+ Learners</span>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-[#0F766E]">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">500+</span>
                  <span className="text-xs text-slate-500">Hiring Partners</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative lg:h-[700px] flex items-center justify-center animate-scale-up" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="relative w-full max-w-2xl perspective-1000">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-teal-200/30 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

              <div className="relative group transform transition-transform duration-700 hover:rotate-y-2 hover:rotate-x-2 preserve-3d">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0F766E] to-teal-400 rounded-2xl opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500" />

                <img
                  src={IMAGES.heroCredentials}
                  alt="Unified Credential Platforms"
                  className="relative w-full h-auto rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] border border-slate-100/50 bg-white/50 backdrop-blur-sm"
                />

                {/* Floating Elements - Glassmorphism */}
                <div className="absolute -bottom-8 -left-8 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/40 flex items-center gap-4 z-20 hover:scale-105 transition-all duration-300">
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-3 rounded-xl text-[#0F766E]">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Status</p>
                    <p className="text-base font-bold text-slate-900">Verified Profile</p>
                  </div>
                </div>

                <div className="absolute top-10 -right-6 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/40 z-20 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-semibold text-slate-700">Blockchain Secured</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
