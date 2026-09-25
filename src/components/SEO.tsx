import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  noindex?: boolean;
  image?: string;
  url?: string;
  type?: string;
  schema?: Record<string, any> | null;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonicalPath = "",
  noindex = false,
  image,
  url,
  type = 'website',
  schema = null
}) => {
  useEffect(() => {
    // Dynamic document title update
    const formattedTitle = title.includes('Lifehut') ? title : `${title} | Lifehut Developers`;
    document.title = formattedTitle;

    // Helper to get or create meta tag
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Standard meta tags
    setMetaTag('name', 'description', description);
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Canonical link
    const canonicalHref = url || `https://lifehutdevelopers.com${canonicalPath}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalHref);

    // Open Graph meta tags
    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalHref);
    setMetaTag('property', 'og:type', type);
    if (image) {
      setMetaTag('property', 'og:image', image);
    }

    // Twitter Card meta tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', description);
    if (image) {
      setMetaTag('name', 'twitter:image', image);
    }

    // Schema.org JSON-LD Structured Data
    let schemaScript = document.querySelector('#seo-structured-data') as HTMLScriptElement | null;
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'seo-structured-data';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.text = JSON.stringify(schema, null, 2);
    } else if (schemaScript) {
      schemaScript.remove();
    }
  }, [title, description, keywords, canonicalPath, noindex, image, url, type, schema]);

  return null;
};
