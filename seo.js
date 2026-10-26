(function () {
  function setMeta(selector, attribute, key, value) {
    if (!value) return;
    let node = document.head.querySelector(selector);
    if (!node) {
      node = document.createElement('meta');
      node.setAttribute(attribute, key);
      document.head.append(node);
    }
    node.setAttribute('content', value);
  }

  function update({ title, description, url, image, structuredData } = {}) {
    if (title) document.title = title;
    const currentDescription = description || document.querySelector('meta[name="description"]')?.content || '';
    const canonicalUrl = url || window.location.href;
    const shareImage = image || 'https://abadworld.cloud/assets/logo/logo.jpg';
    if (currentDescription) {
      setMeta('meta[name="description"]', 'name', 'description', currentDescription);
      setMeta('meta[property="og:description"]', 'property', 'og:description', currentDescription);
      setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', currentDescription);
    }
    if (title) {
      setMeta('meta[property="og:title"]', 'property', 'og:title', title);
      setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    }
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[property="og:image"]', 'property', 'og:image', shareImage);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', shareImage);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = canonicalUrl;

    if (structuredData) {
      let script = document.getElementById('dynamicStructuredData');
      if (!script) {
        script = document.createElement('script');
        script.id = 'dynamicStructuredData';
        script.type = 'application/ld+json';
        document.head.append(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }

  window.ABSEO = { update };
})();
