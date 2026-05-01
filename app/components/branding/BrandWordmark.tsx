import type React from 'react';

export function BrandWordmark(props: {
  className?: string;
  /** Size preset for typical placements */
  size?: 'sm' | 'md' | 'lg';
  /** Text color for the PRO suffix (defaults suited for dark backgrounds). */
  proClassName?: string;
}) {
  const size =
    props.size === 'sm'
      ? { zafirix: 'text-sm', pro: 'text-[10px]' }
      : props.size === 'lg'
        ? { zafirix: 'text-2xl', pro: 'text-sm' }
        : { zafirix: 'text-lg', pro: 'text-xs' };

  const proClassName = props.proClassName ?? 'text-white/70';

  return (
    <span className={props.className}>
      <span
        className={`${size.zafirix} font-extrabold tracking-tight bg-linear-to-r from-sky-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent`}
      >
        ZAFIRIX
      </span>
      <span className={`${size.pro} ml-1 font-semibold ${proClassName}`}>PRO</span>
    </span>
  );
}

