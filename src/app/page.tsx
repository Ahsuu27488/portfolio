import { BusinessPreview } from "@/components/business-preview";
import { ChapterHeader } from "@/components/chapter-header";
import { ContactForm } from "@/components/contact-form";
import { HeroSwarm } from "@/components/hero-swarm";
import { HeroType } from "@/components/hero-type";
import { Reveals } from "@/components/reveals";
import { WorkScene } from "@/components/work-scene";
import { about, aboutClose, contact, hero, index, live, person, products, services, toolbox } from "@/content/site";
import { hireLinks } from "@/lib/contact";

export const ensureStatic = "navigation";

const dotFor: Record<string, string> = {
  AI: "bg-mint",
  Web: "bg-ink",
  "Backend and data": "bg-orange",
  Ship: "bg-grey-2",
};

export default function Home() {
  const hire = hireLinks(contact.hire);
  return (
    <>
      <ChapterHeader
        wordmark={person.wordmark}
        action={hero.action}
        href="#contact"
        github={person.github}
        linkedin={person.linkedin}
      />
      <main id="top">
        <section data-chapter="night" className="hero frame" aria-labelledby="hero-title">
          <HeroSwarm className="hero-stage" />
          <h1 id="hero-title" className="text-display">
            <span className="pale block">{hero.lines[0]}</span>
            <span className="block">{hero.lines[1]}</span>
          </h1>
          <div className="hero-body">
            <div className="hero-swarm" data-hero-focus>
              <p className="hero-fallback wordmark" aria-hidden>
                {person.wordmark}
              </p>
            </div>
            <div className="hero-foot">
              <p className="text-lead">{hero.sentence}</p>
              <HeroType label={hero.typeLabel} placeholder={hero.typePlaceholder} />
              <a href="#contact" className="btn">
                {hero.action}
              </a>
            </div>
          </div>
        </section>

        <section data-chapter="night" id="work" aria-labelledby="work-title" className="pt-0!">
          <h2 id="work-title" className="sr-only">
            Featured work
          </h2>
          <WorkScene products={products} />
        </section>

        <section data-chapter="mint" id="try" className="frame" aria-labelledby="try-title">
          <div data-reveal>
            <h2 id="try-title" className="text-head max-w-[16ch]">
              {live.heading}
            </h2>
            <p className="mt-6 max-w-[48ch] text-body">{live.note}</p>
            <div className="mt-12">
              <BusinessPreview />
            </div>
          </div>
        </section>

        <section data-chapter="ground" id="services" className="frame" aria-labelledby="services-title">
          <div data-reveal className="grid gap-12">
            <div className="grid gap-6 md:grid-cols-2 md:items-end">
              <h2 id="services-title" className="text-head max-w-[12ch]">
                {services.heading}
              </h2>
              <p className="text-lead max-w-[36ch]">{services.sentence}</p>
            </div>
            <div className="plans-stack">
              {services.plans.map((p) => (
                <div key={p.name} className={`plan-block ${p.recommended ? "bg-mint" : ""}`}>
                  <h3 className="text-head">{p.name}</h3>
                  <p className="text-lead mt-1">{p.price}</p>
                  <dl className="mt-5 grid gap-3">
                    {services.rowLabels.map((label, r) => (
                      <div key={label}>
                        <dt className="text-muted">{label}</dt>
                        <dd>{p.rows[r]}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
            <div className="hidden md:block">
              <table className="plans">
                <thead>
                  <tr>
                    <th scope="col" className="w-[28%] text-body font-normal text-muted">
                      Compare
                    </th>
                    {services.plans.map((p) => (
                      <th key={p.name} scope="col" className={p.recommended ? "rec" : undefined}>
                        <span className="block text-lead font-medium">{p.name}</span>
                        <span className="block text-lead font-normal">{p.price}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {services.rowLabels.map((label, r) => (
                    <tr key={label}>
                      <th scope="row" className="text-body font-normal text-muted">
                        {label}
                      </th>
                      {services.plans.map((p) => (
                        <td key={p.name} className={p.recommended ? "rec" : undefined}>
                          {p.rows[r]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <a href="#contact" className="btn btn-ink justify-self-start">
              {services.action}
            </a>
            <ul className="proof">
              {services.proof.map((p) => (
                <li key={p.src}>
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className="group block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.src} alt={p.alt} width={p.width} height={p.height} loading="lazy" className="w-full" />
                    <span className="mt-3 block text-body group-hover:underline">{p.caption}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section data-chapter="grey" id="index" className="frame" aria-labelledby="index-title">
          <div data-reveal>
            <div className="mb-10 flex flex-wrap items-baseline gap-x-8 gap-y-2">
              <h2 id="index-title" className="text-head">
                {index.heading}
              </h2>
              <p className="text-body text-muted">{index.note}</p>
            </div>
            <ul className="spines">
              {index.items.map((it) => (
                <li key={it.name} className="contents">
                  <a href={it.href} data-kind={it.kind} className="spine" target="_blank" rel="noopener noreferrer">
                    <span>{it.name}</span>
                    <span className="kind">{it.kind}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section data-chapter="ground" className="frame" aria-labelledby="tools-title">
          <div data-reveal className="toolbox">
            <h2 id="tools-title" className="text-lead font-medium md:col-span-2">
              {toolbox.heading}
            </h2>
            {toolbox.groups.map((g) => (
              <div key={g.name} className="mt-10">
                <p className="text-body text-muted">{g.name}</p>
                <ul className="mt-2">
                  {g.rows.map(([tool, where]) => (
                    <li key={tool} className="tool-row">
                      <span>
                        <span className={`dot ${dotFor[g.name]}`} aria-hidden />
                        {tool}
                      </span>
                      <span className="text-small text-muted">{where}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section data-chapter="orange" className="frame" aria-labelledby="about-title">
          <h2 id="about-title" className="sr-only">
            About Ahsan
          </h2>
          <div data-reveal className="about-grid">
            <div className="about-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ahsan.webp"
                alt="Muhammad Ahsan"
                width={480}
                height={600}
                loading="lazy"
                decoding="async"
              />
            </div>
            <p className="about-text">
              {about[0].map((part, i) =>
                part.mark ? (
                  <span key={i} className={`mark mark-${part.mark}`}>
                    {part.text}
                  </span>
                ) : (
                  <span key={i} className={i === 0 ? "font-medium" : undefined}>
                    {part.text}
                  </span>
                ),
              )}
              <a href="#contact" className="mark mark-night">
                {aboutClose}
              </a>
            </p>
          </div>
        </section>

        <section data-chapter="grey" id="contact" className="frame" aria-labelledby="contact-title">
          <div data-reveal className="mx-auto w-full max-w-[560px]">
            <h2 id="contact-title" className="text-lead font-medium">
              <span className="block text-muted">{contact.lines[0]}</span>
              <span className="block">{contact.lines[1]}</span>
            </h2>
            <div className="mt-7">
              <ContactForm />
            </div>
            <dl className="mt-16 grid gap-3">
              {contact.rows.map((r) => (
                <div key={r.label} className="tool-row">
                  <dt className="text-muted">{r.label}</dt>
                  <dd>
                    <a href={r.href} className="link" target={r.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                      {r.value}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
            {hire.length > 0 ? (
              <ul className="mt-8 flex flex-wrap gap-4">
                {hire.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="btn" target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      </main>

      <footer data-chapter="night" className="pb-10! pt-24!" aria-label="Footer">
        <div className="frame grid gap-12 md:grid-cols-2">
          <ul className="grid gap-2 text-lead">
            {contact.rows.map((r) => (
              <li key={r.label}>
                <a href={r.href} className="text-mint underline-offset-4 hover:underline">
                  {r.label === "Email" ? r.value : r.label}
                </a>
              </li>
            ))}
          </ul>
          <ul className="grid content-start gap-2 text-body text-night-muted">
            <li>
              <a href="#work" className="hover:text-night-ink">Featured work</a>
            </li>
            <li>
              <a href="#services" className="hover:text-night-ink">Prices</a>
            </li>
            <li>
              <a href="#index" className="hover:text-night-ink">Everything shipped</a>
            </li>
          </ul>
        </div>
        <p className="footer-name wordmark frame mt-20" aria-hidden>
          {person.wordmark}
        </p>
        <div className="frame mt-10 flex flex-wrap justify-between gap-4 text-small text-night-muted">
          <p>© 2026 {person.name}. Built with Next.js and three.js.</p>
          <a href="#top" className="link">
            Back to top
          </a>
        </div>
      </footer>
      <Reveals />
    </>
  );
}
