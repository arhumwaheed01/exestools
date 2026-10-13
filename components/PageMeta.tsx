import Link from "next/link";

type Props = {
  published?: string; // ISO date, guides only, e.g. "2026-10-13"
  updated: string; // ISO date
};

const fmt = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export default function PageMeta({ published, updated }: Props) {
  return (
    <p className="mt-2 text-sm text-muted">
      By{" "}
      <Link href="/about#arhum" rel="author" className="font-semibold text-accent hover:underline">
        Arhum Waheed
      </Link>
      {published && (
        <>
          {" "}
          · Published <time dateTime={published}>{fmt(published)}</time>
        </>
      )}
      {" · "}Updated <time dateTime={updated}>{fmt(updated)}</time>
    </p>
  );
}
