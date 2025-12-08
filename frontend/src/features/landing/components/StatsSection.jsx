import React from 'react';

export function StatsSection() {
  const stats = [
    { value: '500+', label: 'Partner Institutions' },
    { value: '1M+', label: 'Credentials Verified' },
    { value: '50k+', label: 'Jobs Facilitated' },
    { value: '100%', label: 'NSQF Compliant' },
  ];

  return (
    <section className="py-20 bg-[#0F766E] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="group cursor-pointer">
              <div className="text-5xl font-bold mb-3 tracking-tight group-hover:scale-110 transition-all duration-300 group-hover:text-teal-100">{stat.value}</div>
              <div className="text-teal-100 font-medium text-sm uppercase tracking-widest group-hover:tracking-[0.2em] transition-all duration-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
