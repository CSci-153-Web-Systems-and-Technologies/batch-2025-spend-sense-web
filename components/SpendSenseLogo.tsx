import Link from "next/link";

type SpendSenseLogoProps = {
  size?: "sm" | "md" | "lg";
  collapsed?: boolean;
  linkTo?: string;
};

export default function SpendSenseLogo({ size = "md", collapsed = false, linkTo = "/dashboard" }: SpendSenseLogoProps) {
  const sizes = {
    sm: { icon: 28, text: "text-base" },
    md: { icon: 34, text: "text-lg" },
    lg: { icon: 40, text: "text-xl" },
  };

  const s = sizes[size];

  const logo = (
    <div className="flex items-center gap-2.5">
      <div
        className="rounded-xl flex items-center justify-center shadow-md"
        style={{
          width: s.icon,
          height: s.icon,
          background: "linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)",
        }}
      >
        <svg
          width={s.icon * 0.6}
          height={s.icon * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Wallet body */}
          <rect x="2" y="6" width="20" height="14" rx="3" fill="white" fillOpacity="0.9" />
          {/* Wallet flap */}
          <path
            d="M5 6V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V6"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Coin slot */}
          <circle cx="17" cy="13" r="2.5" fill="#6C5CE7" fillOpacity="0.6" />
          <circle cx="17" cy="13" r="1.2" fill="white" fillOpacity="0.8" />
          {/* Lines for card slots */}
          <line x1="5" y1="10" x2="12" y2="10" stroke="#6C5CE7" strokeWidth="1" strokeOpacity="0.3" strokeLinecap="round" />
          <line x1="5" y1="12.5" x2="10" y2="12.5" stroke="#6C5CE7" strokeWidth="1" strokeOpacity="0.3" strokeLinecap="round" />
        </svg>
      </div>
      {!collapsed && (
        <span className={`font-bold ${s.text} text-gray-800 dark:text-white tracking-tight`}>
          Spend<span className="text-violet-600 dark:text-violet-400">Sense</span>
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return <Link href={linkTo}>{logo}</Link>;
  }

  return logo;
}
