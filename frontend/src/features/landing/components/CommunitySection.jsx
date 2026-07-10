const CommunitySection = () => (
  <section
    id="community"
    className="py-24 px-margin-desktop bg-surface-container-low"
  >
    <div className="max-w-container-max mx-auto">
      <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-bold mb-4">Join the Community</h2>
          <p className="text-on-surface-variant max-w-xl">
            Connect with other professionals, share learning paths, and discover
            new certifications.
          </p>
        </div>
        <button className="bg-white border border-outline-variant px-6 py-2.5 rounded-md font-semibold hover:bg-surface-container transition-all">
          Explore Communities
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            name: 'AWS Certified Group',
            tag: 'AWS',
            members: '12k Members',
            color: 'bg-[#FF9900]/10 text-[#FF9900]',
            desc: 'Study guides, tips, and networking for AWS certs.',
          },
          {
            name: 'React Developers',
            tag: 'React',
            members: '8k Members',
            color: 'bg-[#61DAFB]/10 text-[#61DAFB]',
            desc: 'Discussing Meta certifications and modern UI development.',
          },
          {
            name: 'Design System Architects',
            tag: 'Figma',
            members: '15k Members',
            color: 'bg-[#F24E1E]/10 text-[#F24E1E]',
            desc: 'Sharing best practices for certified designers.',
          },
          {
            name: 'Cybersecurity Pros',
            icon: 'security',
            members: '5k Members',
            color: 'bg-primary/10 text-primary',
            desc: 'CompTIA, CISSP, and ethical hacking discussions.',
          },
        ].map((c, i) => (
          <div
            key={i}
            className="bg-white border border-outline-variant/30 p-6 rounded-2xl hover:border-primary/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${c.color}`}
              >
                {c.tag || (
                  <span className="material-symbols-outlined text-sm">
                    {c.icon}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-full">
                {c.members}
              </span>
            </div>
            <h4 className="font-bold text-sm mb-2 group-hover:text-primary transition-colors">
              {c.name}
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {c.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
export default CommunitySection;
