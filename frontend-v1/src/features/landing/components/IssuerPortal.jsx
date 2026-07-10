const IssuerPortal = () => (
  <section id="org-portal" className="py-24 px-margin-desktop bg-white">
    <div className="max-w-container-max mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">
          For Issuers: Enterprise-Grade Portal
        </h2>
        <p className="text-on-surface-variant max-w-2xl mx-auto">
          Automate credential issuance at scale. Upload CSVs, manage
          revokations, and integrate via API.
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-outline-variant/40 shadow-xl overflow-hidden max-w-4xl mx-auto">
        <div className="bg-surface-container-low px-6 py-3 flex items-center justify-between border-b border-outline-variant/30">
          <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            CredVerify Issuer Portal
          </div>
          <div className="flex gap-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            <span>Dashboard</span>
            <span className="text-primary border-b-2 border-primary pb-0.5">
              Batches
            </span>
            <span>API Keys</span>
          </div>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold">Recent Issuance Batches</h3>
            <button className="bg-primary text-white text-[11px] font-bold px-4 py-2 rounded uppercase tracking-wider">
              New Batch Issue
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/20">
                <tr>
                  <th className="pb-4">Batch Name</th>
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Recipients</th>
                  <th className="pb-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {[
                  {
                    name: 'Q3 Software Engineering Cohort',
                    date: 'Oct 12, 2023',
                    count: 45,
                    status: 'Completed',
                    statusColor: 'bg-emerald-100 text-emerald-700',
                  },
                  {
                    name: 'Annual Compliance Training',
                    date: 'Oct 10, 2023',
                    count: 1204,
                    status: 'Completed',
                    statusColor: 'bg-emerald-100 text-emerald-700',
                  },
                  {
                    name: 'Cloud Architecture Certification',
                    date: 'Pending...',
                    count: 12,
                    status: 'Processing',
                    statusColor: 'bg-amber-100 text-amber-700',
                  },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="py-4 font-medium">{row.name}</td>
                    <td className="py-4 text-on-surface-variant">{row.date}</td>
                    <td className="py-4 text-on-surface-variant">
                      {row.count.toLocaleString()}
                    </td>
                    <td className="py-4 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter ${row.statusColor}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default IssuerPortal;