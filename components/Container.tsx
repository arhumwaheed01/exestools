import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

/** Max 1440px, centered, responsive horizontal padding — use for all tool pages. */
export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`container ${className}`.trim()}>{children}</div>
  );
}
