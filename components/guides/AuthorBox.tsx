import Link from "next/link";

export function AuthorBox() {
  return (
    <aside className="mt-12 max-w-3xl rounded-2xl border border-border bg-surface px-5 py-5">
      <h2 className="text-lg font-bold text-foreground">About the author</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        <Link href="/about#arhum" className="font-semibold text-accent hover:underline">
          Arhum Waheed
        </Link>{" "}
        builds and maintains ExesTools. He writes the tool pages and these guides himself, and checks
        each guide against the live tools on the date shown. He is based in Karachi, Pakistan.
      </p>
    </aside>
  );
}
