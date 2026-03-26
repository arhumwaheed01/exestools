import { LegalLayout } from "@/components/legal/LegalLayout";

export default function LegalRoutesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <LegalLayout>{children}</LegalLayout>;
}
