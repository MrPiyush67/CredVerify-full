import React from 'react';
import { Card, CardContent } from '@/shared/ui';

export function FeatureCard({ icon: Icon, title, description }) {
  return (
    <Card className="group relative h-full overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-primary/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="absolute top-0 right-0 h-32 w-32 scale-0 rounded-bl-[100px] bg-primary/10 opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100" />

      <CardContent className="relative flex h-full flex-col items-start space-y-4 p-8 text-left">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-500 group-hover:rotate-[5deg] group-hover:scale-110 group-hover:bg-primary">
          <Icon className="h-6 w-6 text-primary transition-colors duration-500 group-hover:text-primary-foreground" />
        </div>

        <div>
          <h3 className="mb-2 text-xl font-bold text-foreground transition-colors duration-300 group-hover:text-primary">
            {title}
          </h3>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
