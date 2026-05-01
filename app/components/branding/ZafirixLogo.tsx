export function ZafirixLogo(props: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  subtitle?: boolean;
  subtitleText?: string;
  /** Tailwind class for subtitle (defaults work on dark backgrounds). */
  subtitleClassName?: string;
}) {
  const size = props.size ?? 'md';
  const iconClass = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';
  const text =
    size === 'sm'
      ? { z: 'text-base', pro: 'text-[10px]' }
      : size === 'lg'
        ? { z: 'text-2xl', pro: 'text-sm' }
        : { z: 'text-xl', pro: 'text-xs' };

  const subtitleText = props.subtitleText ?? 'ZAFIRIX GROUP';
  const subtitleClassName = props.subtitleClassName ?? 'text-white/50';

  return (
    <div className={props.className}>
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`${iconClass} shrink-0 rounded-xl bg-linear-to-br from-sky-500 via-indigo-500 to-violet-500 shadow-sm ring-1 ring-black/10 flex items-center justify-center`}
        >
          <svg viewBox="0 0 40 40" className="h-[70%] w-[70%]" role="img" aria-label="Z">
            <defs>
              <linearGradient id="zafirix_z" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="1" stopColor="#E9ECFF" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path
              d="M11 10h18v4L18 26h11v4H11v-4l11-12H11z"
              fill="url(#zafirix_z)"
            />
          </svg>
        </span>
        <div className="leading-none">
          <div className="flex items-baseline">
            <span
              className={`${text.z} font-extrabold tracking-tight bg-linear-to-r from-sky-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent`}
            >
              ZAFIRIX
            </span>
            <span className={`${text.pro} ml-1 font-semibold text-white/70`}>PRO</span>
          </div>
          {props.subtitle !== false ? (
            <div className={`mt-1 text-[11px] ${subtitleClassName}`}>{subtitleText}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

