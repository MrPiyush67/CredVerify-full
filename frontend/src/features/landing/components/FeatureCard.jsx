import React from 'react';
import { Card, CardContent } from '@/common/ui/Card';
import { cn } from '@/utils/helpers';

export function FeatureCard({ icon: Icon, title, description }) {
  return (
    <Card className="relative group cursor-pointer overflow-hidden border border-slate-100 bg-white hover:border-teal-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50/50 rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100" />

      <CardContent className="relative flex flex-col items-start text-left space-y-4 p-8 h-full">
        <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center group-hover:bg-[#0F766E] transition-all duration-500 group-hover:rotate-[5deg] group-hover:scale-110">
          <Icon className="w-6 h-6 text-[#0F766E] group-hover:text-white transition-colors duration-500" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#0F766E] transition-colors duration-300">
            {title}
          </h3>
          <p className="text-slate-500 leading-relaxed text-sm">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
