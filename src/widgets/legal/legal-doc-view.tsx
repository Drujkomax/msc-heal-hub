"use client";

// Общий рендерер юридических документов (Политика конфиденциальности,
// Условия использования). Контент трёхъязычный: сервер пререндерит RU (страницы
// статичны для кэша), язык посетителя применяется на клиенте через useLang —
// тот же паттерн, что и у остальных публичных страниц.
import { Download } from "lucide-react";
import { useLang } from "~/shared/i18n/i18n-provider";
import type { Lang } from "~/shared/config/site";

const DOWNLOAD_LABEL: Record<Lang, string> = {
  ru: "Скачать PDF",
  en: "Download PDF",
  uz: "PDF yuklab olish",
};

export type MetaRow = { label: string; value: string };

export type ContactItem = { label: string; value: string; href?: string };

export type Block =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "contacts"; items: ContactItem[] };

export type LegalSection = { h: string; blocks: Block[] };

export type LegalDoc = {
  eyebrow: string;
  title: string;
  meta: MetaRow[];
  sections: LegalSection[];
};

function SectionBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "p") {
          return (
            <p key={i} className="leading-relaxed">
              {block.text}
            </p>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="ml-1 list-disc space-y-2 pl-5 marker:text-msc-accent">
              {block.items.map((item) => (
                <li key={item} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        // contacts
        return (
          <dl
            key={i}
            className="grid gap-x-6 gap-y-2 rounded-xl border border-border bg-muted/40 p-5 sm:grid-cols-[max-content_1fr]"
          >
            {block.items.map((c) => (
              <div key={c.label} className="contents">
                <dt className="font-medium text-foreground">{c.label}</dt>
                <dd>
                  {c.href ? (
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="font-medium text-primary hover:underline"
                    >
                      {c.value}
                    </a>
                  ) : (
                    c.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        );
      })}
    </>
  );
}

export function LegalDocView({
  docs,
  pdfHref,
  pdfFileName,
}: {
  docs: Record<Lang, LegalDoc>;
  /** URL PDF-версии документа; при наличии показывается кнопка «Скачать PDF». */
  pdfHref?: string;
  /** Имя файла при сохранении (атрибут download). */
  pdfFileName?: string;
}) {
  const lang = (useLang() as Lang) || "ru";
  const doc = docs[lang] ?? docs.ru;

  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-msc-accent">
        {doc.eyebrow}
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{doc.title}</h1>
        {pdfHref && (
          <a
            href={pdfHref}
            download={pdfFileName}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-msc-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-msc-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msc-accent focus-visible:ring-offset-2"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {DOWNLOAD_LABEL[lang] ?? DOWNLOAD_LABEL.ru}
          </a>
        )}
      </div>

      {/* Реквизиты */}
      <dl className="mt-8 overflow-hidden rounded-2xl border border-border bg-muted/30">
        {doc.meta.map((row, i) => (
          <div
            key={row.label}
            className={`grid gap-1 px-5 py-3.5 sm:grid-cols-[13rem_1fr] sm:gap-6 ${
              i > 0 ? "border-t border-border" : ""
            }`}
          >
            <dt className="text-sm font-medium text-muted-foreground">{row.label}</dt>
            <dd className="text-sm text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>

      {/* Разделы */}
      <div className="mt-12 space-y-10 text-muted-foreground">
        {doc.sections.map((section) => (
          <section key={section.h} className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground md:text-2xl">{section.h}</h2>
            <SectionBlocks blocks={section.blocks} />
          </section>
        ))}
      </div>
    </article>
  );
}
