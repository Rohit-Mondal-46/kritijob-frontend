export const updateSEO = (seoData = {}) => {
  try {
    const {
      title,
      description,
      canonicalUrl,
      ogType = 'website',
      ogImage = '/images/logo.png',
    } = seoData || {};

    // Update Title
     // Update Title
document.title = 'KirtiJob';


    // Helper to set or create meta tag
    const setMetaTag = (attributeName, attributeValue, content) => {
      try {
        let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute(attributeName, attributeValue);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content || '');
      } catch (err) {
        console.warn(`Failed to set meta tag: ${attributeValue}`, err);
      }
    };

    // Helper to set or create link tag
    const setLinkTag = (rel, href) => {
      try {
        let element = document.querySelector(`link[rel="${rel}"]`);
        if (!element) {
          element = document.createElement('link');
          element.setAttribute('rel', rel);
          document.head.appendChild(element);
        }
        element.setAttribute('href', href || '');
      } catch (err) {
        console.warn(`Failed to set link tag: ${rel}`, err);
      }
    };

    // Meta Description
    if (description) {
      setMetaTag('name', 'description', description);
    } else {
      setMetaTag('name', 'description', 'Your gateway to premium career opportunities. Connect with top employers and showcase your professional journey with confidence.');
    }

    // Canonical URL
    const currentUrl = canonicalUrl || window.location.href;
    setLinkTag('canonical', currentUrl);

    // Open Graph Tags
    setMetaTag('property', 'og:title', title || 'KirtiJob - Premium Job Portal');
    setMetaTag('property', 'og:description', description || 'Your gateway to premium career opportunities.');
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:type', ogType);
    
    // Resolve relative image URLs to absolute ones
    const resolvedImage = ogImage || '/images/logo.png';
    const absoluteImage = typeof resolvedImage === 'string' && resolvedImage.startsWith('http') 
      ? resolvedImage 
      : `${window.location.origin}${resolvedImage}`;
    setMetaTag('property', 'og:image', absoluteImage);

    // Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title || 'KirtiJob - Premium Job Portal');
    setMetaTag('name', 'twitter:description', description || 'Your gateway to premium career opportunities.');
    setMetaTag('name', 'twitter:image', absoluteImage);
  } catch (globalErr) {
    console.error('Error during SEO update:', globalErr);
  }
};
