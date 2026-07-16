import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function DuoCard({ children, className = "" }: Props) {
  return (
    <div className={`rounded-xl border-b-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
