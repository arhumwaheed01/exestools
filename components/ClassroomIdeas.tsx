import { CLASSROOM_IDEAS } from "@/content/classroom-ideas";

/** Empty-safe slot: renders nothing while CLASSROOM_IDEAS is empty. */
export function ClassroomIdeas() {
  if (CLASSROOM_IDEAS.length === 0) return null;

  return (
    <section id="classroom-ideas" className="max-w-3xl">
      <h2 className="text-xl font-bold tracking-tight text-foreground">Classroom ideas</h2>
      <ul className="mt-3 list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted sm:text-base">
        {CLASSROOM_IDEAS.map((idea) => (
          <li key={idea.title}>
            <span className="font-semibold text-foreground">{idea.title}.</span> {idea.body}
          </li>
        ))}
      </ul>
    </section>
  );
}
