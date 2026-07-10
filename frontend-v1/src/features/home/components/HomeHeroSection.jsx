import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button, Card } from '@/shared/ui';

export default function HomeHeroSection() {
  return (
    <Card className="overflow-hidden rounded-[2rem] border border-border/80 bg-[linear-gradient(135deg,rgba(15,118,110,0.14),rgba(255,255,255,0.95))] p-0 shadow-[var(--shadow-card)]">
      <div className="grid gap-6 p-6 lg:grid-cols-[1.35fr_0.65fr] lg:p-8">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Learner discovery
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Find credential-backed people who are ready to be discovered.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              Search across public profiles, active users, skills, education,
              and experience to find the right people for your next opportunity
              or verification workflow.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="rounded-full">
              Explore profiles
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="rounded-full">
              See how it works
            </Button>
          </div>
        </div>

        <div className="grid gap-3 rounded-[1.5rem] border border-white/70 bg-white/70 p-4 backdrop-blur">
          {[
            { title: 'Verified credentials', value: '124', icon: ShieldCheck },
            { title: 'Live updates', value: 'Every 6 hrs', icon: BookOpen },
            { title: 'Trust score', value: '96%', icon: BadgeCheck },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-border/60 bg-surface-elevated p-4"
              >
                <div className="flex items-center gap-2 text-primary">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
