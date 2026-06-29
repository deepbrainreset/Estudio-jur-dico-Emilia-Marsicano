import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  imageUrl?: string;
  lang?: string;
}

export default function SEO({ title, description, keywords, imageUrl, lang = "es" }: SEOProps) {
  useEffect(() => {
    document.title = title;
    document.documentElement.lang = lang;

    const updateMeta = (nameOrProperty: string, content: string, isProperty: boolean = false) => {
      const attributeSelector = isProperty ? `property="${nameOrProperty}"` : `name="${nameOrProperty}"`;
      let el = document.querySelector(`meta[${attributeSelector}]`);
      if (!el) {
        el = document.createElement("meta");
        if (isProperty) {
          el.setAttribute("property", nameOrProperty);
        } else {
          el.setAttribute("name", nameOrProperty);
        }
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    updateMeta("description", description);
    if (keywords) updateMeta("keywords", keywords);
    
    // Robots tag optimized for AI grounding and snippet extraction (AIO compliance)
    updateMeta("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    updateMeta("googlebot", "index, follow, max-snippet:-1, max-image-preview:large");
    
    // Open Graph
    updateMeta("og:title", title, true);
    updateMeta("og:description", description, true);
    if (imageUrl) {
      updateMeta("og:image", imageUrl, true);
      updateMeta("og:image:secure_url", imageUrl, true);
      updateMeta("og:image:width", "1200", true);
      updateMeta("og:image:height", "630", true);
      updateMeta("og:image:type", "image/png", true);
      updateMeta("twitter:image", imageUrl, true);
    }
    updateMeta("og:type", "website", true);
    updateMeta("og:locale", lang === "es" ? "es_AR" : lang === "en" ? "en_US" : lang, true);
    
    // Twitter Card
    updateMeta("twitter:title", title, true);
    updateMeta("twitter:description", description, true);
    updateMeta("twitter:card", "summary_large_image", true);

    // DYNAMIC CANONICAL Tag (Critical for Seobility Audit)
    const baseUrl = "https://www.emiliamarsicanoabogada.com/";
    const canonicalUrl = lang === "es" ? baseUrl : `${baseUrl}?lang=${lang}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);

    // DYNAMIC HREFLANG ALTERNATES (Guarantees language ranking context)
    const languages = ["es", "en", "zh", "fr", "de", "ja"];
    languages.forEach((l) => {
      const langUrl = l === "es" ? baseUrl : `${baseUrl}?lang=${l}`;
      let hlLink = document.querySelector(`link[rel="alternate"][hreflang="${l}"]`);
      if (!hlLink) {
        hlLink = document.createElement("link");
        hlLink.setAttribute("rel", "alternate");
        hlLink.setAttribute("hreflang", l);
        document.head.appendChild(hlLink);
      }
      hlLink.setAttribute("href", langUrl);
    });

    // Default hreflang (x-default) pointing to core Spanish fallback
    let defaultHlLink = document.querySelector('link[rel="alternate"][hreflang="x-default"]');
    if (!defaultHlLink) {
      defaultHlLink = document.createElement("link");
      defaultHlLink.setAttribute("rel", "alternate");
      defaultHlLink.setAttribute("hreflang", "x-default");
      document.head.appendChild(defaultHlLink);
    }
    defaultHlLink.setAttribute("href", baseUrl);

  }, [title, description, keywords, imageUrl, lang]);

  return null;
}
