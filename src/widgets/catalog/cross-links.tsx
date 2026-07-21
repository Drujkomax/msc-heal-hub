// Перелинковка листинг-страниц каталога: категория ↔ бренд.
// Серверный компонент, никакого JS — настоящие <a href>, чтобы Google видел
// ссылки в пререндеренном HTML. Поднимает входящие ссылки на каждый бренд с ~2
// (индекс брендов + свои товары) до N — именно тех сигналов не хватало, чтобы
// вынуть бренды из «Обнаружена, не проиндексирована». Каждая листинг-страница
// раздаёт вес соседним — база SEO для каталога.
export function CrossLinks({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  if (!links.length) return null;
  return (
    <section className="container mx-auto px-4 pb-12">
      <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">
        {title}
      </h2>
      <ul className="flex flex-wrap gap-3">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className="inline-block rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-msc-accent hover:bg-msc-accent/5"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
