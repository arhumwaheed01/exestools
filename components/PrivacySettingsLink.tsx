"use client";

import Link from "next/link";
import type { MouseEvent } from "react";

type GoogleFcWindow = Window & {
  googlefc?: { showRevocationMessage?: () => void };
};

type Props = { className?: string };

/**
 * Footer link that reopens Google's consent message (Funding Choices) when it is
 * available on the page, and otherwise falls back to the consent section of the
 * Privacy Policy.
 */
export function PrivacySettingsLink({ className }: Props) {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    const fc = (window as GoogleFcWindow).googlefc;
    if (typeof fc?.showRevocationMessage === "function") {
      event.preventDefault();
      fc.showRevocationMessage();
    }
  }

  return (
    <Link href="/privacy-policy#consent-choices" onClick={onClick} className={className}>
      Privacy and cookie settings
    </Link>
  );
}
