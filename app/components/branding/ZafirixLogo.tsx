export function ZafirixLogo(props: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  subtitle?: boolean;
  subtitleText?: string;
  /** Tailwind class for subtitle (defaults work on dark backgrounds). */
  subtitleClassName?: string;
}) {
  const size = props.size ?? 'md';
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
        <img src="/icon-192.png" alt="ZAFIRIX" className="h-9 w-9 object-contain shrink-0" />
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

