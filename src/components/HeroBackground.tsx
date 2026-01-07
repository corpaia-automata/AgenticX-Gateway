import { ReactNode } from "react";

interface HeroBackgroundProps {
  children: ReactNode;
  className?: string;
}

export const HeroBackground = ({ children, className = "" }: HeroBackgroundProps) => {
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Dark AI-themed gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>

      {/* Subtle futuristic visuals */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
};


