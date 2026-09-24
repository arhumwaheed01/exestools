/**
 * Phase 1 analytics stub. Phase 2 wires GA4 when NEXT_PUBLIC_GA_ID is set.
 * Never send choice text / PII in props.
 */
export function track(_event: string, _props: Record<string, unknown> = {}): void {
  if (!process.env.NEXT_PUBLIC_GA_ID) return;
  // Phase 2: sendGAEvent via @next/third-parties
}
