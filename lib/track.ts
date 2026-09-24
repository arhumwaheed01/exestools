/** Phase 1: no-op analytics stub. Phase 2 wires GA4. Never send choice text. */
export function track(_event: string, _props: Record<string, unknown> = {}): void {
  // Phase 2: sendGAEvent via @next/third-parties
}
