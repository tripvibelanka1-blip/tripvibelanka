import React from 'react';
import Link from 'next/link';
import { SchemaScript } from './SchemaScript';

export interface BreadcrumbItem {
  name: string;
  href: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const baseUrl = "https://www.tripvibelanka.com";

  const schemaItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: baseUrl
    },
    ...items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 2,
      name: item.name,
      item: `${baseUrl}${item.href}`
    }))
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: schemaItems
  };

  return (
    <>
      <SchemaScript schema={breadcrumbSchema} />
      <nav aria-label="Breadcrumb" className="bg-white border-b border-slate-100 py-3 px-4 sm:px-8">
        <ol className="flex items-center space-x-2 text-sm max-w-7xl mx-auto overflow-hidden whitespace-nowrap">
          <li className="flex items-center shrink-0">
            <Link href="/" className="text-slate-500 hover:text-brand-text transition-colors">
              Home
            </Link>
          </li>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.href} className="flex items-center space-x-2 overflow-hidden">
                <span className="text-slate-400 shrink-0">/</span>
                {isLast ? (
                  <span className="text-slate-800 font-medium truncate" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.href} className="text-slate-500 hover:text-brand-text transition-colors shrink-0">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
