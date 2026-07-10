import { Link } from 'react-router';

const Hero = () => (
  <section
    id="platform"
    className="pt-48 pb-32 px-margin-desktop max-w-container-max mx-auto overflow-hidden"
  >
    <div className="grid lg:grid-cols-2 gap-20 items-center">
      <div className="fade-in-up">
        <h1 className="text-[56px] font-bold leading-[1.1] tracking-tight mb-6 text-on-surface">
          One Profile.
          <br />
          Every Verified Credential.
        </h1>
        <p className="text-[18px] text-on-surface-variant mb-10 max-w-lg leading-relaxed">
          Consolidate your certifications, degrees, and professional
          achievements into a single, cryptographically secure identity.
          Instantly verifiable by employers worldwide.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <Link
            to="/signup"
            className="bg-primary text-white px-8 py-4 rounded font-semibold flex items-center justify-center gap-2 hover:bg-[#0c6b5f] transition-all"
          >
            Create Free Account{' '}
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4 text-sm text-on-surface-variant">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white bg-surface-container flex items-center justify-center overflow-hidden"
              >
                <img
                  src={`https://i.pravatar.cc/100?img=${i + 10}`}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <span className="font-medium text-xs uppercase tracking-wider">
            Join 500,000+ verified professionals
          </span>
        </div>
      </div>
      <div className="relative fade-in-up">
        {/* Browser Mockup */}
        <div className="bg-white rounded-xl browser-shadow border border-outline-variant/40 overflow-hidden">
          <div className="bg-surface-container-low px-4 py-3 flex items-center gap-2 border-b border-outline-variant/30">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
            </div>
            <div className="mx-auto flex items-center gap-2 bg-white px-3 py-1 rounded text-[11px] text-on-surface-variant border border-outline-variant/30 min-w-50 justify-center">
              <span className="material-symbols-outlined text-[14px]">
                lock
              </span>
              credverify.com/u/sarah-jenkins
            </div>
          </div>
          <div className="p-8">
            <div className="flex items-start gap-5 mb-8">
              <div className="w-20 h-20 rounded-full bg-surface-container overflow-hidden">
                <img
                  src="https://i.pravatar.cc/150?img=32"
                  alt="Sarah Jenkins"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">Sarah Jenkins</h3>
                  <span className="material-symbols-outlined text-primary fill-[1] text-xl">
                    verified
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant font-medium">
                  Senior Cloud Architect
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                  <span className="material-symbols-outlined text-[12px]">
                    verified_user
                  </span>{' '}
                  ID Verified
                </div>
              </div>
              <div className="w-16 h-16 bg-white border border-outline-variant/50 p-1 rounded">
                <div className="w-full h-full bg-surface-container-highest"></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Verified Credentials
              </div>
              {[
                {
                  title: 'AWS Certified Solutions Architect',
                  org: 'Amazon Web Services',
                  date: 'Issued Jan 2024',
                  icon: 'cloud',
                  active: true,
                },
                {
                  title: 'M.S. Computer Science',
                  org: 'Stanford University',
                  date: 'Issued Jun 2020',
                  icon: 'school',
                  active: true,
                },
                {
                  title: 'React Developer Certification',
                  org: 'Meta',
                  date: 'Expires Dec 2023',
                  icon: 'code',
                  active: false,
                },
              ].map((c, i) => (
                <div
                  key={i}
                  className={`p-4 border border-outline-variant/40 rounded-lg flex items-center gap-4 ${c.active ? 'border-l-4 border-l-primary' : 'opacity-60'}`}
                >
                  <div className="w-10 h-10 bg-surface-container rounded flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined">{c.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{c.title}</div>
                    <div className="text-[11px] text-on-surface-variant">
                      {c.org} • {c.date}
                    </div>
                  </div>
                  <span
                    className={`material-symbols-outlined ${c.active ? 'text-primary' : 'text-error'}`}
                  >
                    {c.active ? 'check_circle' : 'error'}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg border border-emerald-100">
              <span className="material-symbols-outlined text-xl">
                done_all
              </span>
              <div>
                <div className="text-xs font-bold">Verification Instant</div>
                <div className="text-[10px]">
                  Cryptographically proof matched
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
