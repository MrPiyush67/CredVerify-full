import React from 'react';
import { CheckCircle, ArrowRight, Briefcase } from 'lucide-react';
import { Button } from '@/shared/ui';

const IMAGES = {
  heroCredentials: '/landing/hero-credentials.png',
};

export function HeroSection({ onGetStarted }) {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/80 backdrop-blur-sm text-primary text-sm font-semibold border border-border shadow-sm animate-fade-in-up"
              style={{
                animationDelay: '0.1s',
                opacity: 0,
                animationFillMode: 'forwards',
              }}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="tracking-wide">NCVET & NSQF Aligned</span>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight animate-fade-in-up"
              style={{
                animationDelay: '0.2s',
                opacity: 0,
                animationFillMode: 'forwards',
              }}
            >
              One Profile.
              <br />
              <span className="text-primary">Infinite Possibilities.</span>
            </h1>

            <p
              className="text-xl text-muted-foreground max-w-xl leading-relaxed font-normal animate-fade-in-up"
              style={{
                animationDelay: '0.3s',
                opacity: 0,
                animationFillMode: 'forwards',
              }}
            >
              The National Micro-Credential Aggregator. Unifying your fragmented
              certificates into a single, verified digital portfolio powered by
              blockchain.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
              style={{
                animationDelay: '0.4s',
                opacity: 0,
                animationFillMode: 'forwards',
              }}
            >
              <Button size="lg" className="gap-2" onClick={onGetStarted}>
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div
              className="flex items-center gap-8 pt-6 text-sm text-muted-foreground font-medium animate-fade-in-up"
              style={{
                animationDelay: '0.5s',
                opacity: 0,
                animationFillMode: 'forwards',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-border bg-muted overflow-hidden"
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                        alt="user"
                      />
                    </div>
                  ))}
                </div>
                <span className="font-semibold text-foreground">
                  10k+ Learners
                </span>
              </div>
              <div className="w-px h-10 bg-muted" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-foreground">500+</span>
                  <span className="text-xs text-muted-foreground">
                    Hiring Partners
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div
            className="relative lg:h-175 flex items-center justify-center animate-scale-up"
            style={{
              animationDelay: '0.3s',
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            <div className="relative w-full max-w-2xl perspective-1000">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-teal-200/30 rounded-full blur-3xl animate-pulse" />
              <div
                className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: '1s' }}
              />

              <div className="relative group transform transition-transform duration-700 hover:rotate-y-2 hover:rotate-x-2 preserve-3d">
                <div className="absolute inset-0 bg-primary/10 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" />

                <img
                  src={IMAGES.heroCredentials}
                  alt="Unified Credential Platforms"
                  className="relative w-full h-auto rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] border border-border"
                />

                {/* Floating Elements - Glassmorphism */}
                <div className="absolute -bottom-8 -left-8 bg-card/80 backdrop-blur-md p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-border flex items-center gap-4 z-20 hover:scale-105 transition-all duration-300">
                  <div className="bg-primary/10 p-3 rounded-xl text-primary">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
                      Status
                    </p>
                    <p className="text-base font-bold text-foreground">
                      Verified Profile
                    </p>
                  </div>
                </div>

                <div className="absolute top-10 -right-6 bg-card/80 backdrop-blur-md p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-border z-20 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-semibold text-foreground">
                      Blockchain Secured
                    </span>
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
