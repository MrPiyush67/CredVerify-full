const HowItWorks = () => (
  <section className="py-24 px-margin-desktop bg-white">
    <div className="max-w-container-max mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4 text-on-surface">
          How CredVerify Works
        </h2>
        <p className="text-on-surface-variant max-w-2xl mx-auto">
          A seamless ecosystem for issuers, earners, and verifiers.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-10">
        {[
          {
            step: '1. Issue',
            icon: 'add_circle',
            desc: "Organizations cryptographically sign and issue credentials directly to an earner's wallet via our API or portal.",
          },
          {
            step: '2. Collect',
            icon: 'account_balance_wallet',
            desc: 'Professionals store all their achievements in one secure, portable digital wallet that they control.',
          },
          {
            step: '3. Verify',
            icon: 'fact_check',
            desc: 'Employers instantly verify the authenticity of a credential with a single click or API call, zero trust required.',
          },
        ].map((item, i) => (
          <div
            key={i}
            className="text-center p-8 border border-outline-variant/30 rounded-2xl hover:border-primary/40 transition-colors"
          >
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl">
                {item.icon}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-3">{item.step}</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
export default HowItWorks;