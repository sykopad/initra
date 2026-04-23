import { NextResponse } from 'next/server';

export async function GET() {
  const pages = [
    { path: '/', lastModified: new Date() },
    { path: '/about', lastModified: new Date() },
    { path: '/contact', lastModified: new Date() },
    // Add more paths as necessary
  ];

  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap-image/1.1">
      ${pages
        .map(({ path, lastModified }) => {
          return `
            <url>
              <loc>${process.env.NEXT_PUBLIC_SITE_URL}${path}</loc>
              <lastmod>${lastModified.toISOString()}</lastmod>
            </url>
          `;
        })
        .join('')}
    </urlset>
  `;

  return NextResponse.text(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}