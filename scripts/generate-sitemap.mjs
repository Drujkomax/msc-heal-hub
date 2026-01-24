import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const siteUrl = process.env.SITE_URL || "https://medsc.uz";

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing env: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const isoDate = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
};

const normalizeUrl = (path) => {
  if (!path.startsWith("/")) return `${siteUrl}/${path}`;
  return `${siteUrl}${path}`;
};

const staticUrls = [
  { loc: normalizeUrl("/"), changefreq: "weekly", priority: "1.0", lastmod: isoDate() },
  { loc: normalizeUrl("/catalog"), changefreq: "weekly", priority: "0.8", lastmod: isoDate() },
  { loc: normalizeUrl("/services"), changefreq: "monthly", priority: "0.7", lastmod: isoDate() },
  { loc: normalizeUrl("/cases"), changefreq: "monthly", priority: "0.6", lastmod: isoDate() },
  { loc: normalizeUrl("/about"), changefreq: "monthly", priority: "0.6", lastmod: isoDate() },
  { loc: normalizeUrl("/contacts"), changefreq: "monthly", priority: "0.6", lastmod: isoDate() },
];

const { data: manufacturers, error: manufacturersError } = await supabase
  .from("manufacturers")
  .select("id, slug");

if (manufacturersError) {
  console.error("Failed to load manufacturers:", manufacturersError.message);
  process.exit(1);
}

const manufacturerSlugMap = new Map(
  (manufacturers || [])
    .filter((manufacturer) => manufacturer.slug)
    .map((manufacturer) => [manufacturer.id, manufacturer.slug]),
);

const { data: products, error: productsError } = await supabase
  .from("products")
  .select("id, slug, updated_at, status, archived, manufacturer_id")
  .eq("status", "active")
  .or("archived.eq.false,archived.is.null");

if (productsError) {
  console.error("Failed to load products:", productsError.message);
  process.exit(1);
}

const productUrls = (products || []).map((product) => {
  const productSlug = product.slug || product.id;
  const manufacturerSlug = manufacturerSlugMap.get(product.manufacturer_id);
  const path = manufacturerSlug
    ? `/catalog/${manufacturerSlug}/${productSlug}`
    : `/catalog/${productSlug}`;
  return {
    loc: normalizeUrl(path),
    lastmod: isoDate(product.updated_at),
    changefreq: "weekly",
    priority: "0.7",
  };
});

const urlEntries = [...staticUrls, ...productUrls]
  .map((entry) => {
    const lastmod = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : "";
    return [
      "  <url>",
      `    <loc>${entry.loc}</loc>`,
      lastmod ? `    ${lastmod}` : "",
      entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : "",
      entry.priority ? `    <priority>${entry.priority}</priority>` : "",
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n");
  })
  .join("\n");

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  urlEntries,
  "</urlset>",
  "",
].join("\n");

const outputPath = resolve("public/sitemap.xml");
await writeFile(outputPath, xml, "utf8");

console.log(
  `Sitemap updated: ${outputPath} (${staticUrls.length} static, ${productUrls.length} products)`,
);
