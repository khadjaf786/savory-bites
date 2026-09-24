import { Flame, Leaf, Wheat } from "lucide-react";

const VALUES = [
  {
    icon: Flame,
    title: "Cooked over embers",
    body: "Our wood-fired oven runs from open to close, giving every plate a smoky, caramelised edge.",
  },
  {
    icon: Leaf,
    title: "Market-led produce",
    body: "We buy small and often from growers around the valley, so the menu shifts with the seasons.",
  },
  {
    icon: Wheat,
    title: "Made in-house",
    body: "Breads, pastas and sauces are prepared each morning in our open kitchen — nothing arrives frozen.",
  },
];

export function AboutSection() {
  return (
    <section
      data-ocid="home.about.section"
      className="border-b border-border bg-background"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-8 lg:py-28">
        <div className="animate-fade-up">
          <p className="eyebrow">Our story</p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
            A neighbourhood bistro built around a single fire
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              Savory Bites began in 2019 as a twelve-seat counter behind a
              bakery, with one oven and a chalkboard menu. We cooked whatever
              the morning market had to offer and let the embers do the rest.
            </p>
            <p>
              Seven years on, the room is bigger and the wine list is longer,
              but the idea hasn&apos;t moved: honest ingredients, patient
              cooking, and a table that feels like someone&apos;s home. Our
              cuisine sits somewhere between rustic European and modern Pacific
              Northwest — generous, seasonal and unapologetically savoury.
            </p>
          </div>

          <p className="mt-8 border-l-2 border-primary pl-5 font-display text-lg italic leading-relaxed text-foreground">
            &ldquo;If it doesn&apos;t taste like it came from a real kitchen, it
            doesn&apos;t leave ours.&rdquo;
          </p>
          <p className="mt-3 pl-5 text-sm text-muted-foreground">
            — Marisol Vega, Head Chef
          </p>
        </div>

        <ul className="grid gap-4 self-start animate-fade-up">
          {VALUES.map((value) => (
            <li
              key={value.title}
              className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-warm transition-smooth hover:border-primary/40"
            >
              <span
                aria-hidden="true"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-primary"
              >
                <value.icon className="size-5" />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {value.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
