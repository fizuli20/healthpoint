export function HealthPointIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M32 4C18.745 4 8 14.745 8 28c0 16.92 21.17 30.89 22.07 31.47a3.6 3.6 0 0 0 3.86 0C34.83 58.89 56 44.92 56 28 56 14.745 45.255 4 32 4Z"
        fill="#C8102E"
      />
      <rect x="28.5" y="17" width="7" height="20" rx="2" fill="#FFFFFF" />
      <rect x="22" y="23.5" width="20" height="7" rx="2" fill="#FFFFFF" />
    </svg>
  );
}

export function HealthPointWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 sm:gap-2.5 select-none">
      <HealthPointIcon size={compact ? 26 : 34} />
      <span className="font-extrabold tracking-tight text-[#171717] text-base sm:text-xl leading-none">
        Health<span className="text-[#C8102E]">Point</span>
      </span>
    </span>
  );
}

export function LoadingSplash({ message }: { message?: string }) {
  return (
    <div
      className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="p-4 rounded-3xl bg-[#FFF1F2] border border-[#FCE8EC] shadow-soft animate-pulse">
        <HealthPointIcon size={52} />
      </div>
      <p className="mt-4 font-extrabold text-xl tracking-tight text-[#171717]">
        Health<span className="text-[#C8102E]">Point</span>
      </p>
      {message && <p className="mt-1.5 text-sm text-[#737373]">{message}</p>}
    </div>
  );
}
