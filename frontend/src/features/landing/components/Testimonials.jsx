const Testimonials = () => (
  <section className="py-24 px-margin-desktop bg-surface-container-low">
    <div className="max-w-container-max mx-auto">
      <h2 className="text-3xl font-bold mb-16 text-center">
        Trusted by professionals everywhere
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            name: 'Elena Rodriguez',
            role: 'Freelance Developer',
            text: 'CredVerify has completely streamlined how I present my qualifications to clients. No more digging up old PDF certificates.',
          },
          {
            name: 'James Chen',
            role: 'Senior Recruiter, TechCorp',
            text: "As a technical recruiter, being able to verify a candidate's certs instantly saves me hours of manual background checking.",
          },
          {
            name: 'Sarah Jenkins',
            role: 'VP Engineering, EduTech',
            text: 'Implementing the CredVerify issuer API took our team less than a day. Issuing certificates is now entirely automated.',
          },
          {
            name: 'Michael Chang',
            role: 'Data Scientist',
            text: 'I love having a single public link I can put on my resume and LinkedIn. It looks incredibly professional.',
          },
          {
            name: 'Dr. Amanda Hayes',
            role: 'Registrar, State University',
            text: 'The cryptographic security gives our university the confidence to issue digital diplomas without fear of forgery.',
          },
          {
            name: 'David Kim',
            role: 'Systems Administrator',
            text: 'The community features helped me figure out exactly which certification path I needed for my next promotion.',
          },
        ].map((t, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-2xl border border-outline-variant/30 card-shadow"
          >
            <div className="flex text-amber-400 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className="material-symbols-outlined fill-[1] text-[16px]"
                >
                  star
                </span>
              ))}
            </div>
            <p className="text-sm text-on-surface mb-8 leading-relaxed">
              "{t.text}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div>
                <div className="text-sm font-bold">{t.name}</div>
                <div className="text-[10px] text-on-surface-variant font-medium">
                  {t.role}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
export default Testimonials;