import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-10 w-10 rounded-xl",
  md: "h-12 w-12 rounded-2xl",
  lg: "h-20 w-20 rounded-[1.65rem]"
};

export function BrandLogo({ size = "md", className }: BrandLogoProps) {
  return (
    <div
      aria-label="Industrial Brain AI logo"
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden border border-cyan-200/30 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.32),transparent_24%),linear-gradient(135deg,#0B1F3A_0%,#0f3a68_38%,#007BFF_68%,#00C2FF_100%)] shadow-[0_0_36px_rgba(0,194,255,0.34),inset_0_1px_0_rgba(255,255,255,0.42)]",
        sizes[size],
        className
      )}
    >
      <div className="absolute inset-[4px] rounded-[inherit] bg-[#061425]/18 shadow-[inset_0_0_24px_rgba(255,255,255,0.14)]" />
      <svg viewBox="0 0 72 72" role="img" className="relative h-[80%] w-[80%] drop-shadow-[0_4px_14px_rgba(0,0,0,0.42)]">
        <defs>
          <linearGradient id="industrial-brain-mark" x1="12" x2="60" y1="10" y2="62" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="0.48" stopColor="#dbeafe" />
            <stop offset="1" stopColor="#a5f3fc" />
          </linearGradient>
          <linearGradient id="industrial-brain-core" x1="22" x2="52" y1="22" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00C2FF" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <path d="M36 6 61 20.5v31L36 66 11 51.5v-31L36 6Z" fill="rgba(11,31,58,0.32)" stroke="#BAE6FD" strokeOpacity="0.72" strokeWidth="2.4" />
        <path d="M33.2 17.5c-8.2.5-14.6 7.2-14.6 15.4v13.8c0 6.1 5 11.1 11.1 11.1h3.5V17.5Zm5.6 0v40.3h3.7c6.1 0 11.1-5 11.1-11.1V32.8c0-8.1-6.5-14.8-14.8-15.3Z" fill="none" stroke="url(#industrial-brain-mark)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4.2" />
        <path d="M24 31h9M24 40h9M38.8 27h8.7M38.8 36h6.1M38.8 45h8.7" fill="none" stroke="#ECFEFF" strokeLinecap="round" strokeWidth="3.1" />
        <path d="M15.5 24v24M56.5 24v24M15.5 32H9M15.5 42H9M56.5 32H63M56.5 42H63" fill="none" stroke="#A5F3FC" strokeLinecap="round" strokeWidth="2.6" />
        <circle cx="9" cy="32" r="2.5" fill="#ECFEFF" />
        <circle cx="9" cy="42" r="2.5" fill="#ECFEFF" />
        <circle cx="63" cy="32" r="2.5" fill="#ECFEFF" />
        <circle cx="63" cy="42" r="2.5" fill="#ECFEFF" />
        <circle cx="36" cy="36" r="5.7" fill="url(#industrial-brain-core)" stroke="#ECFEFF" strokeOpacity="0.78" strokeWidth="1.5" />
        <path d="M30 59v5h12v-5" fill="none" stroke="#E0F2FE" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        <path d="M48.8 55.5a6.6 6.6 0 1 0 0-13.2 6.6 6.6 0 0 0 0 13.2Zm0-9.1v5M46.3 48.9h5" fill="none" stroke="#DBEAFE" strokeLinecap="round" strokeWidth="1.8" opacity="0.82" />
      </svg>
    </div>
  );
}
