type AdPlaceholderProps = {
  label: string;
  className?: string;
  sizeClassName?: string;
};

/**
 * Reserved layout slot for a future Google AdSense unit.
 * No ad scripts — replace this component later with a real AdSense wrapper.
 */
export function AdPlaceholder({
  label,
  className = "",
  sizeClassName = "h-24",
}: AdPlaceholderProps) {
  return (
    <div
      role="complementary"
      aria-label={`Advertising placeholder: ${label}`}
      className={`flex items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-2 px-3 text-center text-[11px] font-semibold uppercase tracking-wide text-muted ${sizeClassName} ${className}`}
    >
      Ad placeholder — {label}
    </div>
  );
}
