"use client";

import type { MouseEvent } from "react";

type GoogleFcWindow = Window & {
  googlefc?: { showRevocationMessage?: () => void };
};

type Props = { className?: string };

const FALLBACK_HREF = "/privacy-policy#consent-choices";

function tryShowRevocation(): boolean {
  const fc = (window as GoogleFcWindow).googlefc;
  if (typeof fc?.showRevocationMessage === "function") {
    fc.showRevocationMessage();
    return true;
  }
  return false;
}

/**
 * Footer control that reopens Google's Funding Choices consent message.
 * Falls back to the Privacy Policy consent section only if googlefc never loads.
 */
export function PrivacySettingsLink({ className }: Props) {
  function onClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (tryShowRevocation()) return;

    let attempts = 0;
    const id = window.setInterval(() => {
      attempts += 1;
      if (tryShowRevocation()) {
        window.clearInterval(id);
        return;
      }
      if (attempts >= 25) {
        window.clearInterval(id);
        window.location.assign(FALLBACK_HREF);
      }
    }, 100);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center ${className ?? ""}`}
    >
      Privacy and cookie settings
    </button>
  );
}
