type Metric = {
  label: string;
  value: string | number;
  detail: string;
  icon: string;
  tone?: 'amber' | 'mint' | 'purple' | 'error';
};

const tone = {
  amber: 'bg-[#fff3df] text-[#845400]',
  mint: 'bg-[#e1f7f0] text-[#006b5b]',
  purple: 'bg-[#f1e8f3] text-[#6c5774]',
  error: 'bg-[#ffdad6] text-[#93000a]',
};

export function AdminMetricStrip({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className="min-h-[150px] rounded-xl border border-[#d6c3b0]/30 bg-white/80 p-5 shadow-sm backdrop-blur transition-shadow hover:shadow-md"
        >
          <div className="mb-5 flex items-start justify-between">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone[metric.tone || 'amber']}`}>
              <span className="material-symbols-outlined text-[21px]">{metric.icon}</span>
            </span>
            <span className="max-w-[120px] text-right font-mono text-xs font-medium text-[#006b5b]">{metric.detail}</span>
          </div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#524535]">{metric.label}</p>
          <p className="mt-1 font-auth-display text-2xl font-bold text-[#211527]">{metric.value}</p>
        </article>
      ))}
    </div>
  );
}

export function AdminTableActions({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <button type="button" className="flex items-center gap-1.5 font-medium text-[#524535] transition hover:text-[#845400]">
        <span className="material-symbols-outlined text-base">filter_list</span>
        Filtrar
      </button>
      <button type="button" onClick={onRefresh} className="flex items-center gap-1.5 font-medium text-[#524535] transition hover:text-[#845400]">
        <span className="material-symbols-outlined text-base">refresh</span>
        Actualizar
      </button>
    </div>
  );
}
