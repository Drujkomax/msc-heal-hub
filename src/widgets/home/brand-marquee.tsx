"use client";

// Лента брендов-производителей в тёмной полосе (навы) с бесшовной прокруткой —
// «нам доверяют / работаем с брендами». Пока это текстовые вордмарки из БД
// (у manufacturers нет файлов лого); чтобы заменить конкретный бренд на
// картинку — верни из renderBrand <img/> вместо <span>. Прокрутка на CSS,
// уважает prefers-reduced-motion и встаёт на паузу при наведении.

import Link from "next/link";
import { toUrlSlug } from "@/lib/slugify";

type Brand = { id: string; name: string | null; slug: string | null };

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

export function BrandMarquee({ manufacturers }: { manufacturers: Brand[] }) {
  const brands = (manufacturers || [])
    .filter((m) => m?.name && clean(m.name).length > 1)
    .slice(0, 20);

  // Мало брендов — лента смотрится куце, лучше не показывать.
  if (brands.length < 6) return null;

  // Дублируем список: прокрутка на ровно -50% даёт бесшовную петлю.
  const track = [...brands, ...brands];

  return (
    <section aria-label="Бренды-производители, с которыми мы работаем" className="bg-msc-primary">
      <div
        className="group relative overflow-hidden py-9 sm:py-11"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 7%, black 93%, transparent)",
          maskImage:
            "linear-gradient(to right, transparent, black 7%, black 93%, transparent)",
        }}
      >
        <ul className="brand-marquee-track flex w-max items-center gap-x-12 sm:gap-x-16 lg:gap-x-20 group-hover:[animation-play-state:paused] motion-reduce:!animate-none">
          {track.map((b, i) => {
            const name = clean(b.name || "");
            const wordmark = (
              <span className="whitespace-nowrap font-heading text-lg font-semibold tracking-[0.03em] text-white/50 transition-colors duration-200 hover:text-white sm:text-xl">
                {name}
              </span>
            );
            return (
              <li key={`${b.id}-${i}`} aria-hidden={i >= brands.length}>
                {b.slug ? (
                  <Link
                    href={`/catalog/manufacturer/${toUrlSlug(b.slug)}`}
                    tabIndex={i >= brands.length ? -1 : undefined}
                  >
                    {wordmark}
                  </Link>
                ) : (
                  wordmark
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <style>{`
        @keyframes brand-marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .brand-marquee-track {
          animation: brand-marquee-scroll 60s linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .brand-marquee-track { animation: none; }
        }
      `}</style>
    </section>
  );
}
