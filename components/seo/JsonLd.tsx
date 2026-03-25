type Props = {
  data: Record<string, unknown>;
  id?: string;
};

/** Inline JSON-LD for schema.org (server component safe). */
export function JsonLd({ data, id }: Props) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
