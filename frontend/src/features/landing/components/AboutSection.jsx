import React from 'react';
import { Button } from '@/common/ui/Button';

const IMAGES = {
  employer: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80",
  animation1: "/landing/animation1.png",
  animation2: "/landing/animation2.png",
};

export function AboutSection({ onGetStarted }) {
  return (
    <section id="about" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img src={IMAGES.employer} alt="Office background" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/50" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-sm font-semibold text-[#0F766E] uppercase tracking-wider px-4 py-2 bg-teal-900/30 rounded-full border border-teal-700/50">
              About CredVerify
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Transforming India's <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">Skill Ecosystem</span>
          </h2>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed">
            We're on a mission to bridge the gap between education and employment through verified digital credentials.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 text-white">
                <div className="w-1.5 h-8 bg-gradient-to-b from-teal-400 to-blue-500 rounded-full" />
                Our Vision
              </h3>
              <p className="text-slate-400 leading-relaxed text-lg font-light">
                CredVerify envisions a future where every skill, certification, and micro-credential earned by an individual is instantly verifiable, portable, and recognized across India. We're building the infrastructure that will power the next generation of workforce development.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 text-white">
                <div className="w-1.5 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full" />
                The Problem We Solve
              </h3>
              <p className="text-slate-400 leading-relaxed mb-4 text-lg font-light">
                India's learners earn credentials from hundreds of platforms - universities, MOOCs, skill centers, and training institutes. These achievements remain scattered, unverified, and difficult for employers to validate.
              </p>
              <p className="text-slate-400 leading-relaxed text-lg font-light">
                CredVerify aggregates all credentials into one unified, blockchain-verified digital profile that's trusted by employers nationwide.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-teal-500 transition-colors">
                <div className="text-3xl font-bold text-teal-400 mb-1">10K+</div>
                <div className="text-sm text-slate-400">Active Users</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-teal-500 transition-colors">
                <div className="text-3xl font-bold text-teal-400 mb-1">500+</div>
                <div className="text-sm text-slate-400">Partner Institutions</div>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={onGetStarted}>
                Join Our Platform
              </Button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative max-w-md mx-auto group">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl opacity-20 blur-2xl group-hover:opacity-40 group-hover:blur-3xl transition-all duration-[1200ms]" />
              <div className="absolute -inset-2 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-[1200ms]" />

              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={IMAGES.animation1}
                  alt="Employer Verification Animation"
                  className="relative w-full h-auto rounded-2xl transition-all duration-[1200ms] ease-in-out group-hover:opacity-0 group-hover:scale-110"
                />
                <img
                  src={IMAGES.animation2}
                  alt="Employer Verification Animation Hover"
                  className="absolute inset-0 w-full h-auto rounded-2xl opacity-0 scale-95 transition-all duration-[1200ms] ease-in-out group-hover:opacity-100 group-hover:scale-100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
