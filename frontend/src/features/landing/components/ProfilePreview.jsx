const ProfilePreview = () => (
  <section
    id="profile"
    className="py-24 px-margin-desktop bg-surface-container-low border-y border-outline-variant/30"
  >
    <div className="max-w-container-max mx-auto text-center">
      <h2 className="text-3xl font-bold mb-4">Your Public Profile</h2>
      <p className="text-on-surface-variant mb-16">
        A beautiful, shareable landing page for your career.
      </p>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-outline-variant/30 p-10 card-shadow text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 pb-8 border-b border-outline-variant/20">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                person
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold">Alex Rivera</h3>
              <p className="text-on-surface-variant font-medium">
                Product Designer
              </p>
            </div>
          </div>
          <button className="bg-white border border-outline-variant px-5 py-2.5 rounded-md text-sm font-semibold flex items-center gap-2 hover:bg-surface-container-low transition-all">
            <span className="material-symbols-outlined text-sm">share</span>{' '}
            Share Profile
          </button>
        </div>
        <div className="space-y-6">
          <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
            Top Credentials
          </div>
          {[
            { title: 'UX Certification', org: 'Nielsen Norman Group' },
            { title: 'Advanced Figma Tactics', org: 'DesignLab' },
          ].map((c, i) => (
            <div
              key={i}
              className="p-5 border border-outline-variant/30 rounded-xl flex items-center justify-between hover:bg-surface-container-lowest transition-colors"
            >
              <div>
                <div className="font-bold text-sm mb-0.5">{c.title}</div>
                <div className="text-xs text-on-surface-variant">{c.org}</div>
              </div>
              <span className="material-symbols-outlined text-primary">
                verified
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
export default ProfilePreview;