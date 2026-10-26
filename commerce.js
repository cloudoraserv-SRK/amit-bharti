(function () {
  const CART_KEY = 'amitBhartiCart';
  const IMAGE_BUCKET = 'product-images';
  let client = null;
  let currentUser = null;
  let favoriteIds = new Set();

  function getClient() {
    if (window.AB_SUPABASE_CLIENT) return window.AB_SUPABASE_CLIENT;
    const config = window.AB_SUPABASE_CONFIG;
    if (!window.supabase || !config?.url || !config?.anonKey) return null;
    window.AB_SUPABASE_CLIENT = window.supabase.createClient(config.url, config.anonKey);
    return window.AB_SUPABASE_CLIENT;
  }

  function status(node, message, isError = false) {
    if (!node) return;
    node.textContent = message;
    node.classList.toggle('error', isError);
  }

  function money(value) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: Number(value) % 1 ? 2 : 0,
      maximumFractionDigits: 2
    }).format(Number(value || 0));
  }

  function publishedFilter(query) {
    return query.or('is_published.eq.true,status.eq.published');
  }

  function productPrice(product) {
    return product.sale_price ?? product.base_price;
  }

  function makeProductPriceDisplay(product) {
    const display = document.createElement('span');
    display.className = 'product-price';
    if (product.sale_price !== null && product.sale_price !== undefined && Number(product.sale_price) < Number(product.base_price)) {
      const sale = document.createElement('strong');
      sale.className = 'sale-price';
      sale.textContent = money(product.sale_price);
      const original = document.createElement('del');
      original.className = 'original-price';
      original.textContent = money(product.base_price);
      display.append(sale, original);
    } else {
      display.textContent = money(product.base_price);
    }
    return display;
  }

  function safeImageUrl(value) {
    if (!value) return '';
    try {
      const url = new URL(value, window.location.href);
      return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
    } catch (error) {
      return '';
    }
  }

  function safeLinkUrl(value) {
    if (!value) return '';
    try {
      const url = new URL(value, window.location.href);
      if (!['https:', 'http:'].includes(url.protocol)) return '';
      if (url.origin === window.location.origin && /(^|\/)admin(?:\/|$)/i.test(url.pathname)) return '';
      return url.href;
    } catch (error) {
      return '';
    }
  }

  async function uploadImage(file, bucket, folder, slug, allowVideo = false) {
    if (!file) return { url: null, mediaType: null, error: null };
    const videoTypes = ['video/mp4', 'video/webm'];
    const isVideo = allowVideo && videoTypes.includes(file.type);
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = isVideo ? 50 * 1024 * 1024 : 8 * 1024 * 1024;
    if ((!isVideo && !imageTypes.includes(file.type)) || file.size > maxSize) {
      return { url: null, mediaType: null, error: new Error(allowVideo
        ? 'Choose a PNG, JPG or WebP image up to 8 MB, or an MP4/WebM video up to 50 MB.'
        : 'Choose a PNG, JPG or WebP image up to 8 MB.') };
    }
    const filename = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-');
    const path = `${folder}/${slug}-${crypto.randomUUID()}-${filename}`;
    const { error } = await client.storage.from(bucket).upload(path, file, { upsert: false, cacheControl: '3600' });
    if (error) return { url: null, mediaType: null, error };
    return { url: client.storage.from(bucket).getPublicUrl(path).data.publicUrl, mediaType: isVideo ? 'video' : 'image', error: null };
  }

  function setPublicSetting(key, value) {
    const text = typeof value === 'string' ? value : String(value ?? '');
    if (!text) return;
    if (key === 'location') {
      document.querySelectorAll('[data-site-location]').forEach((node) => { node.textContent = text; });
    } else if (key === 'email') {
      document.querySelectorAll('[data-site-email]').forEach((node) => {
        node.textContent = text;
        if (node.tagName === 'A') node.href = `mailto:${text}`;
      });
    } else if (key === 'phone') {
      document.querySelectorAll('[data-site-phone]').forEach((node) => {
        node.textContent = text;
        if (node.tagName === 'A') node.href = `tel:${text.replace(/[^+\d]/g, '')}`;
      });
    } else if (key === 'hours') {
      document.querySelectorAll('[data-site-hours]').forEach((node) => { node.textContent = text; });
    } else if (key === 'map_url') {
      document.querySelectorAll('[data-site-map]').forEach((node) => {
        const url = safeImageUrl(text);
        if (url) node.href = url;
      });
    } else if (key === 'business_name') {
      document.querySelectorAll('[data-business-name]').forEach((node) => { node.textContent = text; });
    }
  }

  async function loadPublicSettings() {
    if (!client) return;
    const { data, error } = await client.rpc('get_public_site_settings');
    if (error) {
      return;
    }
    (data || []).forEach((row) => setPublicSetting(row.setting_key, row.setting_value));
  }

  function renderPublicBlogCard(post) {
    const card = document.createElement('article');
    card.className = 'blog-card';
    const imageUrl = safeImageUrl(post.featured_image_url);
    if (imageUrl) {
      const image = document.createElement('img');
      image.className = 'content-cover-image';
      image.src = imageUrl;
      image.alt = post.title;
      image.loading = 'lazy';
      card.append(image);
    }
    const date = document.createElement('p');
    date.className = 'blog-date';
    date.textContent = post.published_at ? new Date(post.published_at).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '';
    const title = document.createElement('h2');
    title.textContent = post.title;
    const excerpt = document.createElement('p');
    excerpt.textContent = post.excerpt || '';
    const link = document.createElement('a');
    link.className = 'small-link';
    link.href = `blog-post.html?slug=${encodeURIComponent(post.slug)}`;
    link.textContent = 'Read article';
    card.append(date, title, excerpt, link);
    return card;
  }

  function renderPublicPortfolioCard(project) {
    const card = document.createElement('article');
    card.className = 'portfolio-card';
    const videoUrl = project.media_type === 'video' ? safeImageUrl(project.video_url) : '';
    const imageUrl = safeImageUrl(project.thumbnail_url);
    if (videoUrl) {
      const video = document.createElement('video');
      video.className = 'content-cover-video';
      video.src = videoUrl;
      video.controls = true;
      video.preload = 'metadata';
      video.playsInline = true;
      if (imageUrl) video.poster = imageUrl;
      card.append(video);
    } else if (imageUrl) {
      const image = document.createElement('img');
      image.className = 'content-cover-image';
      image.src = imageUrl;
      image.alt = project.title;
      image.loading = 'lazy';
      card.append(image);
    } else {
      const visual = document.createElement('div');
      visual.className = 'portfolio-visual';
      visual.setAttribute('aria-hidden', 'true');
      visual.textContent = project.category || 'AB';
      card.append(visual);
    }
    const category = document.createElement('p');
    category.className = 'blog-date';
    category.textContent = project.category || 'Portfolio';
    const title = document.createElement('h3');
    title.textContent = project.title;
    const description = document.createElement('p');
    description.textContent = project.description || '';
    card.append(category, title, description);
    return card;
  }

  function renderPortfolioCategorySections(projects) {
    const featured = [
      ['Print', 'Offline printing & signage', 'Print work, displays and visible brand experiences.'],
      ['Social Media', 'Social media & video', 'Campaign creative, social posts and short-form video.'],
      ['Website', 'Websites', 'Digital experiences built around each business.']
    ];
    const categories = [...featured, ...[...new Set(projects.map((project) => project.category).filter(Boolean))]
      .filter((category) => !featured.some(([key]) => key === category))
      .map((category) => [category, category, 'More selected projects from AB Ad World.'])];
    return categories.map(([key, titleText, descriptionText]) => {
      const section = document.createElement('section');
      section.className = 'portfolio-category-section';
      const heading = document.createElement('div');
      heading.className = 'portfolio-category-heading';
      const copy = document.createElement('div');
      const title = document.createElement('h2');
      title.textContent = titleText;
      const description = document.createElement('p');
      description.textContent = descriptionText;
      copy.append(title, description);
      heading.append(copy);
      section.append(heading);
      const items = projects.filter((project) => project.category === key);
      if (items.length) {
        const grid = document.createElement('div');
        grid.className = 'portfolio-grid';
        grid.append(...items.map(renderPublicPortfolioCard));
        section.append(grid);
      } else {
        const empty = document.createElement('div');
        empty.className = 'category-empty-state';
        const message = document.createElement('p');
        message.textContent = 'We’re adding examples here. Contact us to talk through your project.';
        const link = document.createElement('a');
        link.className = 'small-link';
        link.href = key === 'Website'
          ? 'contact.html?service=website#contactForm'
          : key === 'Social Media'
            ? 'contact.html?service=social-media#contactForm'
            : 'services.html?category=Offline%20Printing';
        link.textContent = 'Discuss a project';
        empty.append(message, link);
        section.append(empty);
      }
      return section;
    });
  }

  function buildSuppliedPrintGallery() {
    const section = document.createElement('section');
    section.className = 'managed-section';
    const content = document.createElement('div');
    content.className = 'container';
    const title = document.createElement('h2');
    title.textContent = 'Offline printing & signage';
    const gallery = document.createElement('div');
    gallery.className = 'managed-gallery';
    [
      ['assets/images/work-samples/vinyl-print.jpg', 'Vinyl print sample'],
      ['assets/images/work-samples/display-stand.jpg', 'Display stand sample'],
      ['assets/images/work-samples/retroreflective-sign.jpg', 'Retroreflective sign sample'],
      ['assets/images/work-samples/promotional-board.jpg', 'Promotional board sample'],
      ['assets/images/work-samples/printed-canopy.jpg', 'Canopy print sample']
    ].forEach(([src, alt]) => {
      const figure = document.createElement('figure');
      const image = document.createElement('img');
      image.src = src;
      image.alt = alt;
      image.loading = 'lazy';
      const caption = document.createElement('figcaption');
      caption.textContent = alt;
      figure.append(image, caption);
      gallery.append(figure);
    });
    content.append(title, gallery);
    section.append(content);
    return section;
  }

  async function loadPublicContent() {
    const blogGrid = document.querySelector('[data-blog-grid]');
    const portfolioGrid = document.querySelector('[data-portfolio-grid]');
    const portfolioGroups = document.querySelector('[data-portfolio-groups]');
    const homeBlog = document.querySelector('[data-home-blog]');
    const homePortfolio = document.querySelector('[data-home-portfolio]');
    const faqList = document.querySelector('[data-faq-list]');
    const websiteProjects = document.querySelector('[data-website-projects]');
    const socialProjects = document.querySelector('[data-social-projects]');
    const homeSections = document.querySelector('[data-home-page-sections]');
    let homeBanners = document.querySelector('[data-page-banners]');
    let pageSections = document.querySelector('[data-page-sections]');
    if (!homeSections && !pageSections && !document.querySelector('[data-admin-auth-gate]')) {
      const pageRoot = document.createElement('div');
      pageRoot.dataset.pageSections = '';
      const pageName = window.location.pathname.split('/').pop().replace(/\.html?$/i, '') || 'home';
      pageRoot.dataset.pageSlug = pageName === 'index' ? 'home' : pageName;
      pageRoot.className = 'managed-page-sections';
      const main = document.querySelector('main');
      if (main) main.append(pageRoot);
      pageSections = pageRoot;
    }
    if (!homeBanners && !document.querySelector('[data-admin-auth-gate]')) {
      const main = document.querySelector('main');
      if (main) {
        homeBanners = document.createElement('section');
        homeBanners.dataset.pageBanners = '';
        homeBanners.dataset.pageSlug = window.location.pathname.split('/').pop().replace(/\.html?$/i, '') || 'home';
        homeBanners.className = 'home-banners hidden';
        homeBanners.setAttribute('aria-label', 'Current offers');
        main.prepend(homeBanners);
      }
    }
    if (!blogGrid && !portfolioGrid && !portfolioGroups && !homeBlog && !homePortfolio && !faqList && !websiteProjects && !socialProjects && !homeSections && !homeBanners && !pageSections) return;
    if (!client) {
      status(document.querySelector('[data-blog-status], [data-home-blog-status]'), 'Articles unavailable until Supabase is configured.', true);
      status(document.querySelector('[data-portfolio-status], [data-home-portfolio-status]'), 'Projects unavailable until Supabase is configured.', true);
      status(document.querySelector('[data-faq-status]'), 'FAQs unavailable until Supabase is configured.', true);
      if (pageSections) pageSections.replaceChildren();
      return;
    }

    if (blogGrid || homeBlog) {
      const { data, error } = await client.from('blog_posts')
        .select('title,slug,excerpt,featured_image_url,published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (error) {
        console.error('Published blog posts failed to load:', error);
        if (blogGrid) blogGrid.replaceChildren();
        if (homeBlog) homeBlog.replaceChildren();
        status(document.querySelector('[data-blog-status], [data-home-blog-status]'), 'Could not load published articles. Check the Supabase content migration and policies.', true);
      }
      else {
        if (blogGrid) blogGrid.replaceChildren(...(data || []).map(renderPublicBlogCard));
        if (homeBlog) homeBlog.replaceChildren(...(data || []).slice(0, 3).map(renderPublicBlogCard));
        const message = (data || []).length ? `${data.length} published articles.` : 'No published articles yet.';
        status(document.querySelector('[data-blog-status]'), message);
        status(document.querySelector('[data-home-blog-status]'), (data || []).length ? `${Math.min(data.length, 3)} recent articles.` : message);
      }
    }

    if (portfolioGrid || portfolioGroups || homePortfolio) {
      const { data, error } = await client.from('portfolio_projects')
        .select('title,slug,category,description,thumbnail_url,media_type,video_url,display_order')
        .eq('is_published', true)
        .order('display_order', { ascending: true });
      if (error) {
        console.error('Published portfolio projects failed to load:', error);
        if (portfolioGrid) portfolioGrid.replaceChildren();
        if (portfolioGroups) portfolioGroups.replaceChildren();
        if (homePortfolio) homePortfolio.replaceChildren();
        const detail = error.message ? ` Supabase says: ${error.message}` : '';
        status(document.querySelector('[data-portfolio-status], [data-home-portfolio-status]'), `Could not load published projects.${detail} Check that migrations 004 and 010 are applied and public read access is enabled.`, true);
      }
      else {
        if (portfolioGrid) portfolioGrid.replaceChildren(...(data || []).map(renderPublicPortfolioCard));
        if (portfolioGroups) portfolioGroups.replaceChildren(...renderPortfolioCategorySections(data || []));
        if (homePortfolio) homePortfolio.replaceChildren(...(data || []).slice(0, 3).map(renderPublicPortfolioCard));
        const message = (data || []).length ? `${data.length} published projects.` : 'No published projects yet.';
        status(document.querySelector('[data-portfolio-status]'), message);
        status(document.querySelector('[data-home-portfolio-status]'), (data || []).length ? `${Math.min(data.length, 3)} recent projects.` : message);
      }
    }

    if (websiteProjects) {
      const { data, error } = await client.from('portfolio_projects')
        .select('title,slug,category,description,thumbnail_url,media_type,video_url,display_order')
        .eq('is_published', true)
        .eq('category', 'Website')
        .order('display_order', { ascending: true });
      if (error) {
        websiteProjects.replaceChildren();
        status(document.querySelector('[data-website-projects-status]'), 'Website projects unavailable until content migration 004 is applied.', true);
      } else {
        websiteProjects.replaceChildren(...(data || []).map(renderPublicPortfolioCard));
        const section = document.querySelector('[data-website-projects-section]');
        section.hidden = !(data || []).length;
        status(document.querySelector('[data-website-projects-status]'), (data || []).length ? `${data.length} website projects.` : '');
      }
    }

    if (socialProjects) {
      const { data, error } = await client.from('portfolio_projects')
        .select('title,slug,category,description,thumbnail_url,media_type,video_url,display_order')
        .eq('is_published', true)
        .eq('category', 'Social Media')
        .order('display_order', { ascending: true });
      const section = document.querySelector('[data-social-projects-section]');
      if (error) {
        socialProjects.replaceChildren();
        if (section) section.hidden = true;
        status(document.querySelector('[data-social-projects-status]'), 'Social media projects are unavailable until the content migration is applied.', true);
      } else {
        socialProjects.replaceChildren(...(data || []).map(renderPublicPortfolioCard));
        if (section) section.hidden = !(data || []).length;
        status(document.querySelector('[data-social-projects-status]'), (data || []).length ? `${data.length} social media projects.` : '');
      }
    }

    if (faqList) {
      const { data, error } = await client.from('faqs').select('question,answer')
        .eq('is_published', true).order('display_order', { ascending: true });
      if (error) {
        faqList.replaceChildren();
        status(document.querySelector('[data-faq-status]'), 'Could not load FAQs. Check the content migration and policies.', true);
        console.error('Published FAQs failed to load:', error);
      } else {
        faqList.replaceChildren(...(data || []).map((faq) => {
          const item = document.createElement('article');
          item.className = 'faq-item';
          const question = document.createElement('h2');
          question.textContent = faq.question;
          const answer = document.createElement('p');
          answer.textContent = faq.answer;
          item.append(question, answer);
          return item;
        }));
        status(document.querySelector('[data-faq-status]'), (data || []).length ? `${data.length} published FAQs.` : 'No published FAQs yet.');
      }
    }

    if (homeBanners) {
      const { data, error } = await client.from('banners')
        .select('id,title,subtitle,body,image_url,button_label,link_url')
        .eq('page_slug', homeBanners.dataset.pageSlug || 'home').eq('is_active', true)
        .or('starts_at.is.null,starts_at.lte.' + new Date().toISOString())
        .or('ends_at.is.null,ends_at.gte.' + new Date().toISOString())
        .order('display_order', { ascending: true });
      homeBanners.replaceChildren();
      if (error) {
        console.error('Home banners failed to load:', error);
        homeBanners.classList.add('hidden');
      } else if (data?.length) {
        homeBanners.hidden = false;
        homeBanners.classList.remove('hidden');
        homeBanners.replaceChildren(...data.map((banner) => {
          const card = document.createElement('article');
          card.className = 'promo-banner';
          if (banner.image_url && safeImageUrl(banner.image_url)) {
            const image = document.createElement('img');
            image.src = safeImageUrl(banner.image_url);
            image.alt = banner.title || 'AB Ad World promotion';
            image.addEventListener('error', () => image.remove(), { once: true });
            card.append(image);
          }
          const copy = document.createElement('div');
          const title = document.createElement('h2');
          title.textContent = banner.title || '';
          const subtitle = document.createElement('p');
          subtitle.textContent = banner.subtitle || banner.body || '';
          copy.append(title, subtitle);
          if (banner.button_label) {
            const link = document.createElement('a');
            link.className = 'button secondary';
            link.href = safeLinkUrl(banner.link_url) || 'contact.html#contactForm';
            link.textContent = banner.button_label;
            copy.append(link);
          }
          card.append(copy);
          return card;
        }));
      } else {
        homeBanners.hidden = true;
        homeBanners.classList.add('hidden');
      }
    }

    const sectionRoot = homeSections || pageSections;
    if (sectionRoot) {
      const pageSlug = sectionRoot.dataset.pageSlug || 'home';
      const { data, error } = await client.from('page_sections')
        .select('id,section_type,title,subtitle,body,media_collection,image_url,image_alt,button_label,button_url,display_order')
        .eq('page_slug', pageSlug).eq('is_active', true)
        .order('display_order', { ascending: true });
      sectionRoot.replaceChildren();
      if (error) {
        console.error('Page sections failed to load:', error);
        if (pageSlug === 'home') {
          sectionRoot.append(buildSuppliedPrintGallery());
        }
        return;
      }
      const galleryCollections = [...new Set((data || []).filter((item) => item.section_type === 'gallery' && item.media_collection).map((item) => item.media_collection))];
      const galleryRows = new Map();
      for (const collection of galleryCollections) {
        const { data: media, error: mediaError } = await client.from('media_assets')
          .select('public_url,alt_text')
          .eq('collection', collection).eq('is_public', true)
          .order('created_at', { ascending: false });
        if (!mediaError) galleryRows.set(collection, media || []);
      }
      sectionRoot.replaceChildren(...(data || []).map((item) => {
        const section = document.createElement('section');
        section.className = `managed-section managed-section-${item.section_type}`;
        const content = document.createElement('div');
        content.className = `container managed-section-content managed-section-content-${item.section_type}`;
        if (item.title) {
          const title = document.createElement('h2');
          title.textContent = item.title;
          content.append(title);
        }
        if (item.subtitle) {
          const subtitle = document.createElement('p');
          subtitle.className = 'lead';
          subtitle.textContent = item.subtitle;
          content.append(subtitle);
        }
        if (item.body) {
          const body = document.createElement('p');
          body.textContent = item.body;
          content.append(body);
        }
        const imageUrl = safeImageUrl(item.image_url);
        if (imageUrl) {
          const image = document.createElement('img');
          image.className = 'managed-section-image';
          image.src = imageUrl;
          image.alt = item.image_alt || item.title || '';
          image.loading = 'lazy';
          image.addEventListener('error', () => image.remove(), { once: true });
          content.append(image);
        } else if (!['gallery', 'cta', 'website_projects'].includes(item.section_type)) {
          content.classList.add('managed-section-content-no-image');
        }
        if (item.section_type === 'website_projects') {
          const link = document.createElement('a');
          link.className = 'button secondary';
          link.href = 'portfolio.html';
          link.textContent = item.button_label || 'View website projects';
          content.append(link);
        } else if (item.button_label && safeLinkUrl(item.button_url)) {
          const link = document.createElement('a');
          link.className = 'button secondary';
          link.href = safeLinkUrl(item.button_url);
          link.textContent = item.button_label;
          content.append(link);
        } else if (item.button_label) {
          const link = document.createElement('a');
          link.className = 'button secondary';
          link.href = ['gallery', 'website_projects'].includes(item.section_type)
            ? 'portfolio.html'
            : item.section_type === 'cta' ? 'contact.html#contactForm' : 'services.html';
          link.textContent = item.button_label;
          content.append(link);
        }
        if (item.section_type === 'gallery') {
          const gallery = document.createElement('div');
          gallery.className = 'managed-gallery';
          (galleryRows.get(item.media_collection) || []).forEach((asset) => {
            const imageUrl = safeImageUrl(asset.public_url);
            if (!imageUrl) return;
            const figure = document.createElement('figure');
            const image = document.createElement('img');
            image.src = imageUrl;
            image.alt = asset.alt_text;
            image.loading = 'lazy';
            image.addEventListener('error', () => figure.remove(), { once: true });
            const caption = document.createElement('figcaption');
            caption.textContent = asset.alt_text;
            figure.append(image, caption);
            gallery.append(figure);
          });
          if (gallery.childElementCount) {
            content.append(gallery);
          } else {
            const empty = document.createElement('p');
            empty.className = 'managed-gallery-empty';
            empty.textContent = `Gallery coming soon. Add approved images to the “${item.media_collection || 'gallery'}” collection in Admin → Media library.`;
            content.append(empty);
          }
        }
        section.append(content);
        return section;
      }));
      if (pageSlug === 'home' && !(data || []).some((item) => item.section_key === 'print-samples')) {
        sectionRoot.append(buildSuppliedPrintGallery());
      }
    }
  }

  async function loadBlogPost() {
    const root = document.querySelector('[data-blog-post]');
    if (!root) return;
    const message = root.querySelector('[data-blog-post-status]');
    const slug = new URLSearchParams(window.location.search).get('slug');
    if (!client || !slug) {
      status(message, 'Article unavailable. Check the link and Supabase configuration.', true);
      return;
    }
    const { data, error } = await client.from('blog_posts')
      .select('title,slug,excerpt,content,featured_image_url,published_at,seo_title,seo_description')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error || !data) {
      status(message, error ? `Could not load article: ${error.message}` : 'Article not found.', true);
      return;
    }
    const elements = [];
    if (data.published_at) {
      const date = document.createElement('p');
      date.className = 'blog-date';
      date.textContent = new Date(data.published_at).toLocaleDateString('en-IN', { dateStyle: 'long' });
      elements.push(date);
    }
    const title = document.createElement('h1');
    title.textContent = data.title;
    elements.push(title);
    if (data.featured_image_url) {
      const url = safeImageUrl(data.featured_image_url);
      if (url) {
        const image = document.createElement('img');
        image.className = 'blog-article-image';
        image.src = url;
        image.alt = data.title;
        elements.push(image);
      }
    }
    if (data.excerpt) {
      const excerpt = document.createElement('p');
      excerpt.className = 'lead';
      excerpt.textContent = data.excerpt;
      elements.push(excerpt);
    }
    const content = document.createElement('div');
    content.className = 'blog-article-content';
    String(data.content || '').split(/\n{2,}/).forEach((paragraphText) => {
      const paragraph = document.createElement('p');
      paragraph.textContent = paragraphText;
      content.append(paragraph);
    });
    elements.push(content);
    root.replaceChildren(...elements);
    const articleTitle = data.seo_title || `${data.title} | AB Ad World`;
    const articleDescription = data.seo_description || data.excerpt || 'Practical advice on printing, branding and digital growth from AB Ad World.';
    const articleUrl = new URL(`blog-post.html?slug=${encodeURIComponent(data.slug)}`, window.location.href).href;
    window.ABSEO?.update({
      title: articleTitle,
      description: articleDescription,
      url: articleUrl,
      image: data.featured_image_url || undefined,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: data.title,
        description: articleDescription,
        datePublished: data.published_at || undefined,
        image: data.featured_image_url || undefined,
        mainEntityOfPage: articleUrl,
        publisher: { '@type': 'Organization', name: 'AB Ad World', url: 'https://abadworld.cloud/' }
      }
    });
  }

  function makeProductCard(product) {
    const card = document.createElement('article');
    card.className = 'product-card commerce-product-card';
    card.dataset.category = product.category || 'Advertising';

    const galleryItems = productGalleryItems(product).map((image) => ({ ...image, url: safeImageUrl(image.url) })).filter((image) => image.url);
    if (galleryItems.length) {
      const gallery = document.createElement('div');
      window.ABImageGallery?.render(gallery, galleryItems, {
        className: 'product-card-gallery commerce-product-image',
        href: `product.html?slug=${encodeURIComponent(product.slug)}`,
        linkLabel: `Open ${product.name}`
      });
      card.append(gallery);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'commerce-product-placeholder';
      placeholder.setAttribute('aria-hidden', 'true');
      placeholder.textContent = 'AB';
      card.append(placeholder);
    }

    const title = document.createElement('h3');
    const titleLink = document.createElement('a');
    titleLink.href = `product.html?slug=${encodeURIComponent(product.slug)}`;
    titleLink.textContent = product.name;
    title.append(titleLink);
    const description = document.createElement('p');
    description.textContent = product.short_description || product.description || '';
    const metadata = document.createElement('div');
    metadata.className = 'meta-row';
    const price = makeProductPriceDisplay(product);
    const actions = document.createElement('div');
    actions.className = 'commerce-product-actions';
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'small-link';
    add.dataset.cartAdd = product.id;
    add.textContent = 'Add to cart';
    const favorite = document.createElement('button');
    favorite.type = 'button';
    favorite.className = 'small-link favorite-toggle';
    favorite.dataset.favoriteToggle = product.id;
    favorite.setAttribute('aria-pressed', String(favoriteIds.has(product.id)));
    favorite.setAttribute('aria-label', favoriteIds.has(product.id) ? `Remove ${product.name} from favorites` : `Save ${product.name} to favorites`);
    favorite.textContent = favoriteIds.has(product.id) ? '★ Saved' : '☆ Save';
    actions.append(add, favorite);
    metadata.append(price, actions);
    card.append(title, description, metadata);
    return card;
  }

  function attachProductActions(root) {
    if (!root || root.dataset.commerceActions === 'bound') return;
    root.dataset.commerceActions = 'bound';
    root.addEventListener('click', async (event) => {
      const addButton = event.target.closest('[data-cart-add]');
      if (addButton) {
        const card = addButton.closest('.product-card');
        const productId = addButton.dataset.cartAdd;
        const products = JSON.parse(root.dataset.products || '[]');
        const product = products.find((item) => item.id === productId);
        if (product) {
          const cart = getCart();
          const existing = cart.find((item) => item.id === product.id);
          if (existing) existing.quantity += 1;
          else cart.push({ id: product.id, name: product.name, price: productPrice(product), quantity: 1 });
          localStorage.setItem(CART_KEY, JSON.stringify(cart));
          updateCartBadge();
          addButton.textContent = 'Added';
          window.setTimeout(() => { if (addButton.isConnected) addButton.textContent = 'Add to cart'; }, 1000);
        }
        return;
      }

      const favoriteButton = event.target.closest('[data-favorite-toggle]');
      if (!favoriteButton) return;
      if (!currentUser) {
        window.location.href = 'account.html?next=products.html';
        return;
      }

      const productId = favoriteButton.dataset.favoriteToggle;
      const isFavorite = favoriteIds.has(productId);
      const result = isFavorite
        ? await client.from('customer_favorites').delete().eq('product_id', productId).eq('user_id', currentUser.id)
        : await client.from('customer_favorites').insert({ user_id: currentUser.id, product_id: productId });
      if (result.error) {
        favoriteButton.title = result.error.message;
        return;
      }
      if (isFavorite) favoriteIds.delete(productId);
      else favoriteIds.add(productId);
      favoriteButton.setAttribute('aria-pressed', String(!isFavorite));
      favoriteButton.setAttribute('aria-label', isFavorite ? 'Save product to favorites' : 'Remove product from favorites');
      favoriteButton.textContent = isFavorite ? '☆ Save' : '★ Saved';
      const favoritesRoot = document.querySelector('[data-customer-favorites]');
      if (favoritesRoot) loadCustomerData();
    });
  }

  function getCart() {
    try {
      const items = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(items) ? items : [];
    } catch (error) {
      return [];
    }
  }

  function updateCartBadge() {
    const total = getCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    document.querySelectorAll('[data-cart-count]').forEach((node) => { node.textContent = String(total); });
  }

  async function loadFavoriteIds() {
    favoriteIds = new Set();
    if (!client || !currentUser) return;
    const { data, error } = await client.from('customer_favorites').select('product_id').eq('user_id', currentUser.id);
    if (!error) favoriteIds = new Set((data || []).map((row) => row.product_id));
  }

  async function attachProductGalleries(products) {
    const productIds = (products || []).map((product) => product.id).filter(Boolean);
    let images = [];
    if (productIds.length) {
      const { data, error } = await client.from('product_images')
        .select('product_id,image_url,alt_text,is_primary,sort_order')
        .in('product_id', productIds)
        .order('is_primary', { ascending: false })
        .order('sort_order', { ascending: true });
      if (!error) images = data || [];
      else console.warn('Product gallery images are unavailable:', error.message);
    }
    const grouped = new Map();
    images.forEach((image) => {
      if (!grouped.has(image.product_id)) grouped.set(image.product_id, []);
      grouped.get(image.product_id).push({ url: image.image_url, alt: image.alt_text || '' });
    });
    return (products || []).map((product) => {
      const gallery = grouped.get(product.id) || [];
      if (product.image_url && !gallery.some((image) => image.url === product.image_url)) {
        gallery.unshift({ url: product.image_url, alt: product.name });
      }
      return { ...product, gallery_images: gallery };
    });
  }

  function productGalleryItems(product) {
    const images = Array.isArray(product.gallery_images) ? [...product.gallery_images] : [];
    if (product.image_url && !images.some((image) => image.url === product.image_url)) {
      images.unshift({ url: product.image_url, alt: product.name });
    }
    return images;
  }

  async function loadProducts(root, isHome) {
    const message = document.querySelector(isHome ? '[data-home-product-status]' : '[data-product-status]');
    if (!root) return;
    attachProductActions(root);
    if (!client) {
      root.replaceChildren();
      status(message, 'Product catalogue unavailable. Configure the public Supabase URL and anon key.');
      return;
    }

    status(message, 'Loading products…');
    const { data, error } = await publishedFilter(client.from('products')
      .select('id,name,slug,category,short_description,description,base_price,sale_price,image_url,specifications,status,is_published,stock_quantity'))
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Product catalogue request failed:', error);
      root.replaceChildren();
      status(message, 'Could not load products. Check the Supabase connection and product-table policies.', true);
      return;
    }

    const rows = await attachProductGalleries(data || []);
    root.dataset.products = JSON.stringify(rows);
    if (!rows.length) {
      root.replaceChildren();
      status(message, 'No published products are available yet.');
      return;
    }

    await loadFavoriteIds();
    root.replaceChildren(...rows.map(makeProductCard));
    status(message, `${rows.length} ${rows.length === 1 ? 'product' : 'products'} available.`);
  }

  function setupProductCatalog() {
    const homeGrid = document.querySelector('[data-product-grid]');
    const shopGrid = document.querySelector('[data-all-products]');
    const root = shopGrid || homeGrid;
    if (!root) return;

    const isHome = Boolean(homeGrid && !shopGrid);
    const search = document.getElementById('productSearch');
    const filters = document.querySelector('[data-product-filters]');
    let products = [];

    attachProductActions(root);
    if (search) {
      search.addEventListener('input', () => applyProductFilters(root, products, search.value, filters?.querySelector('.active')?.dataset.filter || 'all'));
    }

    loadProducts(root, isHome).then(async () => {
      try { products = JSON.parse(root.dataset.products || '[]'); } catch (error) { products = []; }
      if (filters && products.length) {
        const categories = [...new Set(products.map((product) => product.category || 'Advertising'))].sort();
        filters.replaceChildren();
        ['all', ...categories].forEach((category) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = `filter-btn${category === 'all' ? ' active' : ''}`;
          button.dataset.filter = category;
          button.textContent = category === 'all' ? 'All' : category;
          button.addEventListener('click', () => {
            filters.querySelectorAll('.filter-btn').forEach((item) => item.classList.toggle('active', item === button));
            applyProductFilters(root, products, search?.value || '', category);
          });
          filters.append(button);
        });
      }
    });
  }

  function applyProductFilters(root, products, searchText, selectedCategory) {
    const query = searchText.trim().toLocaleLowerCase();
    const filtered = products.filter((product) => {
      const categoryMatches = selectedCategory === 'all' || (product.category || 'Advertising') === selectedCategory;
      const text = `${product.name} ${product.category || ''} ${product.short_description || ''} ${product.description || ''}`.toLocaleLowerCase();
      return categoryMatches && text.includes(query);
    });
    root.replaceChildren(...filtered.map(makeProductCard));
    const message = document.querySelector('[data-product-status]');
    if (!filtered.length) status(message, 'No products match your search.');
    else status(message, `${filtered.length} ${filtered.length === 1 ? 'product' : 'products'} found.`);
  }

  async function setupProductDetail() {
    const root = document.querySelector('[data-product-detail]');
    if (!root) return;
    if (!client) {
      root.replaceChildren();
      status(root, 'Product details unavailable. Configure the public Supabase URL and anon key.', true);
      return;
    }

    const parameters = new URLSearchParams(window.location.search);
    const productSlug = parameters.get('slug');
    const productId = parameters.get('product');
    if (!productSlug && !productId) {
      root.replaceChildren();
      status(root, 'Choose a product from the catalog to view its details.', true);
      return;
    }

    let productQuery = publishedFilter(client.from('products')
      .select('id,name,slug,category,short_description,description,base_price,sale_price,image_url,specifications,status,is_published,stock_quantity,seo_title,seo_description,sku'));
    productQuery = productSlug ? productQuery.eq('slug', productSlug) : productQuery.eq('id', productId);
    const { data, error } = await productQuery;
    const product = (await attachProductGalleries(data || []))[0];
    if (error || !product) {
      root.replaceChildren();
      status(root, error ? 'Could not load this product.' : 'Product not found or no longer available.', true);
      return;
    }
    const productTitle = product.seo_title || `${product.name} | AB Ad World`;
    const productDescription = product.seo_description || product.short_description || product.description || `${product.name} from AB Ad World. View product details and request ordering information.`;
    const productUrl = new URL(`product.html?slug=${encodeURIComponent(product.slug)}`, window.location.href).href;
    const productImage = productGalleryItems(product)[0]?.url;
    window.ABSEO?.update({
      title: productTitle,
      description: productDescription,
      url: productUrl,
      image: productImage,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: productDescription,
        image: productImage ? [productImage] : undefined,
        sku: product.sku || undefined,
        brand: { '@type': 'Brand', name: 'AB Ad World' },
        offers: Number(productPrice(product)) > 0 ? {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: String(productPrice(product)),
          availability: Number(product.stock_quantity) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          url: productUrl
        } : undefined
      }
    });

    await loadFavoriteIds();
    const layout = document.createElement('div');
    layout.className = 'detail-layout';
    const showcase = document.createElement('div');
    showcase.className = 'product-showcase';
    const galleryItems = productGalleryItems(product).map((image) => ({ ...image, url: safeImageUrl(image.url) })).filter((image) => image.url);
    if (galleryItems.length) {
      const gallery = document.createElement('div');
      window.ABImageGallery?.render(gallery, galleryItems, { className: 'product-detail-gallery', thumbnails: true });
      showcase.append(gallery);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'product-visual';
      placeholder.textContent = 'AB';
      showcase.append(placeholder);
    }

    const content = document.createElement('div');
    content.className = 'detail-content';
    const category = document.createElement('p');
    category.className = 'eyebrow';
    category.textContent = product.category || 'Product';
    const title = document.createElement('h1');
    title.textContent = product.name;
    const price = makeProductPriceDisplay(product);
    price.classList.add('detail-price');
    const description = document.createElement('p');
    description.textContent = product.description || product.short_description || '';
    content.append(category, title, price, description);

    const specifications = product.specifications && typeof product.specifications === 'object' ? Object.entries(product.specifications) : [];
    if (specifications.length) {
      const specHeading = document.createElement('h2');
      specHeading.textContent = 'Specifications';
      const specList = document.createElement('dl');
      specList.className = 'specification-list';
      specifications.forEach(([label, value]) => {
        const row = document.createElement('div');
        const term = document.createElement('dt');
        term.textContent = label;
        const detail = document.createElement('dd');
        detail.textContent = typeof value === 'string' ? value : JSON.stringify(value);
        row.append(term, detail);
        specList.append(row);
      });
      content.append(specHeading, specList);
    }

    const actions = document.createElement('div');
    actions.className = 'detail-actions';
    const add = document.createElement('button');
    add.className = 'button';
    add.type = 'button';
    add.dataset.detailAdd = product.id;
    add.textContent = 'Add to cart';
    const favorite = document.createElement('button');
    favorite.className = 'button secondary';
    favorite.type = 'button';
    favorite.dataset.favoriteToggle = product.id;
    favorite.setAttribute('aria-pressed', String(favoriteIds.has(product.id)));
    favorite.textContent = favoriteIds.has(product.id) ? '★ Saved' : '☆ Save to favorites';
    actions.append(add, favorite);
    content.append(actions);
    layout.append(showcase, content);
    root.replaceChildren(layout);

    root.addEventListener('click', async (event) => {
      const addButton = event.target.closest('[data-detail-add]');
      if (addButton) {
        const cart = getCart();
        const existing = cart.find((item) => item.id === product.id);
        if (existing) existing.quantity += 1;
        else cart.push({ id: product.id, name: product.name, price: productPrice(product), quantity: 1 });
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartBadge();
        addButton.textContent = 'Added';
        return;
      }
      const favoriteButton = event.target.closest('[data-favorite-toggle]');
      if (!favoriteButton) return;
      if (!currentUser) {
        window.location.href = 'account.html?next=product.html';
        return;
      }
      const isFavorite = favoriteIds.has(product.id);
      const result = isFavorite
        ? await client.from('customer_favorites').delete().eq('product_id', product.id).eq('user_id', currentUser.id)
        : await client.from('customer_favorites').insert({ user_id: currentUser.id, product_id: product.id });
      if (result.error) {
        favoriteButton.title = result.error.message;
        return;
      }
      if (isFavorite) favoriteIds.delete(product.id);
      else favoriteIds.add(product.id);
      favoriteButton.setAttribute('aria-pressed', String(!isFavorite));
      favoriteButton.textContent = isFavorite ? '☆ Save to favorites' : '★ Saved';
    });
  }

  async function setupAccountAuth() {
    const root = document.querySelector('[data-customer-account]');
    if (!root) return;
    const authPanel = root.querySelector('[data-account-auth]');
    const dashboard = root.querySelector('[data-account-dashboard]');
    const form = root.querySelector('[data-customer-auth-form]');
    const accountStatus = root.querySelector('[data-account-status]');
    let mode = 'login';

    function setMode(nextMode) {
      mode = nextMode;
      const signup = mode === 'signup';
      root.querySelector('[data-account-name-wrap]').classList.toggle('hidden', !signup);
      root.querySelector('[data-account-submit]').textContent = signup ? 'Create account' : 'Sign in';
      root.querySelectorAll('[data-account-mode]').forEach((button) => {
        const selected = button.dataset.accountMode === mode;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-selected', String(selected));
      });
      form.elements.namedItem('password').autocomplete = signup ? 'new-password' : 'current-password';
    }

    root.querySelectorAll('[data-account-mode]').forEach((button) => button.addEventListener('click', () => setMode(button.dataset.accountMode)));
    if (!client) {
      status(accountStatus, 'Customer accounts unavailable. Configure the public Supabase URL and anon key.', true);
      return;
    }
    status(accountStatus, 'Sign in to view your orders and saved products.');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const values = new FormData(form);
      const email = String(values.get('email') || '').trim();
      const password = String(values.get('password') || '');
      status(accountStatus, mode === 'signup' ? 'Creating account…' : 'Signing in…');
      const result = mode === 'signup'
        ? await client.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: String(values.get('full_name') || '').trim() },
            emailRedirectTo: `${window.location.origin}/account.html`
          }
        })
        : await client.auth.signInWithPassword({ email, password });

      if (result.error) {
        status(accountStatus, result.error.message, true);
        return;
      }

      if (mode === 'signup' && !result.data.session) {
        status(accountStatus, 'Account created. Check your email to confirm the address, then sign in.', false);
        return;
      }
      currentUser = result.data.user;
      await showAccount(currentUser);
      const next = new URLSearchParams(window.location.search).get('next');
      if (next && /^[a-z0-9-]+\.html$/i.test(next)) window.location.href = next;
    });

    root.querySelector('[data-password-reset]').addEventListener('click', async () => {
      const email = form.elements.email.value.trim();
      if (!email) {
        status(accountStatus, 'Enter your email address first.', true);
        return;
      }
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/account.html` });
      status(accountStatus, error ? error.message : 'If the address belongs to an account, a reset link has been sent.', Boolean(error));
    });

    root.querySelector('[data-customer-logout]').addEventListener('click', async () => {
      const { error } = await client.auth.signOut();
      if (error) status(accountStatus, error.message, true);
      else window.location.reload();
    });

    const profileForm = root.querySelector('[data-customer-profile-form]');
    const profileStatus = root.querySelector('[data-profile-status]');
    profileForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!currentUser) return;
      const payload = {
        full_name: profileForm.elements.namedItem('full_name').value.trim() || null,
        phone: profileForm.elements.namedItem('phone').value.trim() || null
      };
      const { error } = await client.from('profiles').update(payload).eq('id', currentUser.id);
      if (error) {
        status(profileStatus, `Could not save your profile: ${error.message}`, true);
        return;
      }
      status(profileStatus, 'Profile saved.');
    });

    client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        currentUser = session?.user || null;
        if (currentUser) showAccount(currentUser);
        else {
          dashboard.classList.add('hidden');
          authPanel.classList.remove('hidden');
        }
      }, 0);
    });

    const { data, error } = await client.auth.getSession();
    if (error) status(accountStatus, error.message, true);
    currentUser = data.session?.user || null;
    if (currentUser) await showAccount(currentUser);
  }

  async function showAccount(user) {
    const root = document.querySelector('[data-customer-account]');
    if (!root || !user) return;
    root.querySelector('[data-account-auth]').classList.add('hidden');
    root.querySelector('[data-account-dashboard]').classList.remove('hidden');
    root.querySelector('[data-account-email]').textContent = user.email || '';
    await loadCustomerProfile(user);
    await loadCustomerData();
  }

  async function loadCustomerProfile(user) {
    const root = document.querySelector('[data-customer-account]');
    const form = root?.querySelector('[data-customer-profile-form]');
    const message = root?.querySelector('[data-profile-status]');
    if (!root || !form || !client || !user) return;
    const { data, error } = await client.from('profiles').select('full_name,phone').eq('id', user.id).maybeSingle();
    if (error) {
      status(message, `Could not load your profile: ${error.message}`, true);
      return;
    }
    form.elements.namedItem('full_name').value = data?.full_name || user.user_metadata?.full_name || '';
    form.elements.namedItem('phone').value = data?.phone || '';
    status(message, 'Your profile is up to date.');
  }

  async function loadCustomerData() {
    const root = document.querySelector('[data-customer-account]');
    if (!root || !client || !currentUser) return;
    const ordersNode = root.querySelector('[data-customer-orders]');
    const ordersStatus = root.querySelector('[data-orders-status]');
    const favoritesNode = root.querySelector('[data-customer-favorites]');
    const favoritesStatus = root.querySelector('[data-favorites-status]');
    status(ordersStatus, 'Loading purchase history…');
    status(favoritesStatus, 'Loading favorites…');

    const [ordersResult, favoritesResult] = await Promise.all([
      client.from('orders').select('id,order_number,status,payment_status,total_amount,created_at,order_items(name,quantity,unit_price),shipments(courier_name,tracking_number,status)').order('created_at', { ascending: false }),
      client.from('customer_favorites').select('product_id,products(id,name,slug,image_url,base_price,sale_price,short_description,category)').order('created_at', { ascending: false })
    ]);

    if (ordersResult.error) {
      status(ordersStatus, `Could not load purchase history: ${ordersResult.error.message}`, true);
    } else if (!ordersResult.data?.length) {
      ordersNode.replaceChildren();
      status(ordersStatus, 'No orders yet. Your completed order requests will appear here.');
    } else {
      ordersNode.replaceChildren(...ordersResult.data.map((order) => {
        const item = document.createElement('article');
        item.className = 'account-order';
        const heading = document.createElement('div');
        heading.className = 'account-order-heading';
        const number = document.createElement('h3');
        number.textContent = order.order_number;
        const total = document.createElement('strong');
        total.textContent = money(order.total_amount);
        heading.append(number, total);
        const details = document.createElement('p');
        const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' });
        const itemSummary = (order.order_items || []).map((line) => `${line.name} × ${line.quantity}`).join(', ');
        const shipment = order.shipments?.[0];
        const tracking = shipment?.tracking_number ? ` · Tracking ${shipment.tracking_number}` : '';
        details.textContent = `${orderDate} · ${order.status} · Payment ${order.payment_status} · ${itemSummary}${tracking}`;
        item.append(heading, details);
        return item;
      }));
      status(ordersStatus, `${ordersResult.data.length} ${ordersResult.data.length === 1 ? 'order' : 'orders'}.`);
    }

    if (favoritesResult.error) {
      status(favoritesStatus, `Could not load favorites: ${favoritesResult.error.message}`, true);
    } else {
      const products = await attachProductGalleries((favoritesResult.data || []).map((item) => item.products).filter(Boolean));
      favoriteIds = new Set((favoritesResult.data || []).map((item) => item.product_id));
      favoritesNode.dataset.products = JSON.stringify(products);
      favoritesNode.replaceChildren(...products.map(makeProductCard));
      status(favoritesStatus, products.length ? `${products.length} saved ${products.length === 1 ? 'product' : 'products'}.` : 'No saved products yet.');
      attachProductActions(favoritesNode);
    }
  }

  async function setupCartCheckout() {
    const root = document.querySelector('[data-cart-page]');
    if (!root) return;
    if (!client) return;
    const summary = root.querySelector('.cart-summary');
    if (!summary) return;

    const checkout = document.createElement('button');
    checkout.className = 'button full-width';
    checkout.type = 'button';
    checkout.textContent = 'Place order request';
    const message = document.createElement('p');
    message.className = 'catalog-status';
    message.setAttribute('role', 'status');
    message.setAttribute('aria-live', 'polite');
    const shippingForm = document.createElement('form');
    shippingForm.className = 'checkout-address-form';
    shippingForm.innerHTML = `
      <h4>Delivery details</h4>
      <label>Recipient name<input name="name" autocomplete="name" required maxlength="160"></label>
      <label>Phone<input name="phone" type="tel" autocomplete="tel" required maxlength="40"></label>
      <label>Street address<textarea name="address" autocomplete="street-address" rows="2" required maxlength="500"></textarea></label>
      <div class="field-grid">
        <label>City<input name="city" autocomplete="address-level2" required maxlength="100"></label>
        <label>State<input name="state" autocomplete="address-level1" required maxlength="100"></label>
      </div>
      <label>PIN code<input name="postal_code" inputmode="numeric" autocomplete="postal-code" pattern="[0-9]{6}" required maxlength="6"></label>
    `;
    const getShippingAddress = () => Object.fromEntries(new FormData(shippingForm).entries());
    summary.insertBefore(shippingForm, checkout);
    summary.append(message);

    const payOnline = document.createElement('button');
    payOnline.className = 'button full-width secondary';
    payOnline.type = 'button';
    payOnline.textContent = 'Pay securely with Razorpay';
    summary.append(payOnline);

    async function loadRazorpaySdk() {
      if (window.Razorpay) return true;
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.append(script);
      });
    }

    payOnline.addEventListener('click', async () => {
      if (!currentUser) {
        window.location.href = 'account.html?next=cart.html';
        return;
      }
      const items = getCart().map((item) => ({ product_id: item.id, quantity: Number(item.quantity) }));
      if (!items.length) {
        status(message, 'Your cart is empty.', true);
        return;
      }
      if (!shippingForm.reportValidity()) return;
      payOnline.disabled = true;
      status(message, 'Preparing secure payment…');
      const { data, error } = await client.functions.invoke('create-razorpay-order', {
        body: { items, shipping_address: getShippingAddress() }
      });
      payOnline.disabled = false;
      if (error || !data?.razorpayOrderId) {
        status(message, `Online payment is unavailable: ${error?.message || data?.error || 'Payment service is not configured.'}`, true);
        return;
      }
      if (!await loadRazorpaySdk()) {
        status(message, 'Could not load the payment provider. Your cart is unchanged.', true);
        return;
      }

      const checkoutWidget = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'AB Ad World',
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        prefill: { email: data.customer?.email || '' },
        handler: () => {
          status(message, 'Payment submitted. Order status will update after provider verification.');
          window.location.href = 'account.html';
        },
        modal: {
          ondismiss: () => status(message, 'Payment was not completed. Your order remains unpaid.')
        },
        theme: { color: '#1c4031' }
      });
      checkoutWidget.on('payment.failed', () => status(message, 'Payment failed. You may retry from your cart.'));
      checkoutWidget.open();
    });

    checkout.addEventListener('click', async () => {
      if (!currentUser) {
        window.location.href = 'account.html?next=cart.html';
        return;
      }
      const items = getCart().map((item) => ({ product_id: item.id, quantity: Number(item.quantity) }));
      if (!items.length) {
        status(message, 'Your cart is empty.', true);
        return;
      }
      if (!shippingForm.reportValidity()) return;
      checkout.disabled = true;
      status(message, 'Submitting order request…');
      const { data, error } = await client.rpc('create_customer_order_with_shipping', {
        p_items: items,
        p_shipping_address: getShippingAddress(),
        p_notes: null
      });
      checkout.disabled = false;
      if (error) {
        status(message, `Could not submit order: ${error.message}`, true);
        return;
      }
      const order = Array.isArray(data) ? data[0] : data;
      localStorage.removeItem(CART_KEY);
      updateCartBadge();
      status(message, `Order request ${order.order_number} created. Payment is not collected by this website.`);
      window.setTimeout(() => { window.location.href = 'account.html'; }, 1800);
    });
  }

  async function setupProductAdmin() {
    const root = document.querySelector('[data-product-catalog-admin]');
    if (!root) return;
    const form = root.querySelector('[data-product-form]');
    const fields = form.elements;
    const list = root.querySelector('[data-product-admin-list]');
    const workspace = root.querySelector('[data-product-admin-workspace]');
    const message = root.querySelector('[data-product-admin-status]');
    let isAdmin = false;

    function toLocalDateTimeInput(value) {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      return date.toISOString().slice(0, 16);
    }

    root.querySelector('[data-product-go-signin]').addEventListener('click', () => {
      document.querySelector('[data-admin-tab="services"]')?.click();
      document.querySelector('[data-service-login-form]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    if (!client) {
      status(message, 'Product management unavailable. Configure the Supabase URL and public anon key.', true);
      return;
    }

    function setAccess(user) {
      isAdmin = Boolean(user && user.app_metadata?.role === 'admin');
      workspace.classList.toggle('hidden', !isAdmin);
      root.querySelector('[data-product-go-signin]').classList.toggle('hidden', isAdmin);
      if (isAdmin) {
        status(message, 'Admin access verified. Product data is managed in Supabase.');
        loadAdminProducts();
      } else if (user) {
        status(message, 'This account does not have the admin role.', true);
      } else {
        status(message, 'Sign in under Services with an authorized admin account.');
      }
    }

    async function loadAdminProducts() {
      if (!isAdmin) return;
      status(message, 'Loading products…');
      const { data, error } = await client.from('products').select('*').order('created_at', { ascending: false });
      if (error) {
        status(message, `Could not load products: ${error.message}`, true);
        return;
      }
      const productsWithGalleries = await attachProductGalleries(data || []);
      list.replaceChildren(...productsWithGalleries.map((product) => {
        const row = document.createElement('div');
        row.className = 'admin-list-item product-admin-item';
        const title = document.createElement('div');
        const thumbnails = (product.gallery_images || []).slice(0, 4);
        if (thumbnails.length) {
          const galleryPreview = document.createElement('div');
          galleryPreview.className = 'admin-gallery-preview';
          thumbnails.forEach((imageItem) => {
            const image = document.createElement('img');
            image.src = safeImageUrl(imageItem.url);
            image.alt = imageItem.alt || product.name;
            image.loading = 'lazy';
            galleryPreview.append(image);
          });
          title.append(galleryPreview);
        }
        const name = document.createElement('strong');
        name.textContent = product.name;
        const meta = document.createElement('p');
        const isOffer = product.sale_price !== null && product.sale_price !== undefined && Number(product.sale_price) < Number(product.base_price);
        meta.textContent = `${money(productPrice(product))}${isOffer ? ' · Offer' : ''} · ${product.category || 'Advertising'} · ${product.is_published || product.status === 'published' ? 'Published' : 'Draft'}`;
        title.append(name, meta);
        const actions = document.createElement('div');
        actions.className = 'inline-actions';
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.textContent = 'Edit';
        edit.addEventListener('click', () => fillProductForm(product));
        const publish = document.createElement('button');
        publish.type = 'button';
        publish.textContent = product.is_published || product.status === 'published' ? 'Archive' : 'Publish';
        publish.addEventListener('click', () => updateProduct(product.id, {
          is_published: !(product.is_published || product.status === 'published'),
          status: product.is_published || product.status === 'published' ? 'archived' : 'published'
        }));
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'button small secondary';
        remove.textContent = 'Delete';
        remove.addEventListener('click', () => deleteProduct(product));
        actions.append(edit, publish, remove);
        row.append(title, actions);
        return row;
      }));
      status(message, `${(data || []).length} products loaded.`);
    }

    function fillProductForm(product) {
      fields.namedItem('id').value = product.id;
      fields.namedItem('name').value = product.name;
      fields.namedItem('slug').value = product.slug;
      fields.namedItem('seo_title').value = product.seo_title || '';
      fields.namedItem('seo_description').value = product.seo_description || '';
      fields.namedItem('category').value = product.category || 'Offline Printing';
      fields.namedItem('base_price').value = product.base_price ?? '';
      fields.namedItem('sale_price').value = product.sale_price ?? '';
      fields.namedItem('short_description').value = product.short_description || '';
      fields.namedItem('description').value = product.description || '';
      fields.namedItem('specifications').value = JSON.stringify(product.specifications || {}, null, 2);
      fields.namedItem('weight_grams').value = product.weight_grams ?? '';
      fields.namedItem('hsn_code').value = product.hsn_code || '';
      fields.namedItem('length_cm').value = product.length_cm ?? '';
      fields.namedItem('breadth_cm').value = product.breadth_cm ?? '';
      fields.namedItem('height_cm').value = product.height_cm ?? '';
      fields.namedItem('is_published').checked = Boolean(product.is_published || product.status === 'published');
      form.dataset.currentImageUrl = product.image_url || '';
      form.dataset.currentImageCount = String(product.gallery_images?.length || 0);
      fields.namedItem('images').value = '';
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function updateProduct(id, changes) {
      const { error } = await client.from('products').update(changes).eq('id', id);
      if (error) status(message, `Product update failed: ${error.message}`, true);
      else await loadAdminProducts();
    }

    async function deleteProduct(product) {
      if (!window.confirm(`Permanently delete “${product.name}”? This cannot be undone.`)) return;
      const { count, error: orderLookupError } = await client.from('order_items')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', product.id);
      if (orderLookupError) {
        status(message, `Could not check order history: ${orderLookupError.message}`, true);
        return;
      }
      if (count > 0) {
        status(message, 'This product is part of order history and cannot be deleted. Archive it to remove it from the storefront.', true);
        return;
      }
      const { data: galleryRows, error: galleryLookupError } = await client.from('product_images')
        .select('image_url').eq('product_id', product.id);
      if (galleryLookupError) {
        status(message, `Could not load product gallery before deletion: ${galleryLookupError.message}`, true);
        return;
      }
      const { error } = await client.from('products').delete().eq('id', product.id);
      if (error) {
        status(message, `Product could not be deleted: ${error.message}`, true);
        return;
      }
      const publicMarker = '/storage/v1/object/public/product-images/';
      const config = window.AB_SUPABASE_CONFIG;
      const imageUrls = [product.image_url, ...(galleryRows || []).map((row) => row.image_url)].filter(Boolean);
      const storagePaths = new Set();
      if (config?.url) {
        for (const value of imageUrls) {
          try {
            const imageUrl = new URL(value);
            const supabaseOrigin = new URL(config.url).origin;
            const markerIndex = imageUrl.pathname.indexOf(publicMarker);
            if (imageUrl.origin === supabaseOrigin && markerIndex >= 0) {
              const path = decodeURIComponent(imageUrl.pathname.slice(markerIndex + publicMarker.length));
              if (path) storagePaths.add(path);
            }
          } catch (_error) {
            // Ignore local or non-storage image URLs during storage cleanup.
          }
        }
      }
      if (storagePaths.size) {
        const { error: storageError } = await client.storage.from('product-images').remove([...storagePaths]);
        if (storageError) {
          status(message, `Product deleted, but some gallery images could not be removed from storage: ${storageError.message}`, true);
          await loadAdminProducts();
          return;
        }
      }
      status(message, 'Product and its gallery images deleted.');
      await loadAdminProducts();
    }

    form.addEventListener('reset', () => {
      delete form.dataset.currentImageUrl;
      window.setTimeout(() => { fields.namedItem('id').value = ''; }, 0);
    });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!isAdmin) return;
      const price = Number(fields.namedItem('base_price').value);
      const salePriceInput = fields.namedItem('sale_price').value.trim();
      const salePrice = salePriceInput === '' ? null : Number(salePriceInput);
      let specifications;
      const specificationText = fields.namedItem('specifications').value.trim();
      if (!specificationText) {
        specifications = {};
      } else {
        try {
          specifications = JSON.parse(specificationText);
          if (!specifications || Array.isArray(specifications) || typeof specifications !== 'object') throw new Error('Enter a JSON object or plain text details.');
        } catch (_error) {
          const pairs = specificationText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
          const parsedPairs = pairs.map((line) => {
            const separator = line.indexOf(':');
            return separator > 0 ? [line.slice(0, separator).trim(), line.slice(separator + 1).trim()] : null;
          });
          specifications = parsedPairs.length && parsedPairs.every((pair) => pair && pair[0] && pair[1])
            ? Object.fromEntries(parsedPairs)
            : { Details: specificationText };
        }
      }
      if (!Number.isFinite(price) || price < 0) {
        status(message, 'Enter a non-negative base price.', true);
        return;
      }
      if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0 || salePrice >= price)) {
        status(message, 'An offer price must be non-negative and lower than the base price.', true);
        return;
      }

      const id = fields.namedItem('id').value || crypto.randomUUID();
      const publish = fields.namedItem('is_published').checked;
      const payload = {
        id,
        name: fields.namedItem('name').value.trim(),
        slug: fields.namedItem('slug').value.trim(),
        category: fields.namedItem('category').value.trim(),
        seo_title: fields.namedItem('seo_title').value.trim() || null,
        seo_description: fields.namedItem('seo_description').value.trim() || null,
        base_price: price,
        sale_price: salePrice,
        short_description: fields.namedItem('short_description').value.trim() || null,
        description: fields.namedItem('description').value.trim() || null,
        specifications,
        weight_grams: fields.namedItem('weight_grams').value ? Number(fields.namedItem('weight_grams').value) : null,
        hsn_code: fields.namedItem('hsn_code').value.trim() || null,
        length_cm: fields.namedItem('length_cm').value ? Number(fields.namedItem('length_cm').value) : null,
        breadth_cm: fields.namedItem('breadth_cm').value ? Number(fields.namedItem('breadth_cm').value) : null,
        height_cm: fields.namedItem('height_cm').value ? Number(fields.namedItem('height_cm').value) : null,
        is_published: publish,
        status: publish ? 'published' : 'draft'
      };
      if (!payload.name || !payload.slug || !payload.category) {
        status(message, 'Name, slug, and category must not be empty.', true);
        return;
      }
      const files = Array.from(fields.namedItem('images').files || []);
      const uploadedImages = [];
      for (const [index, file] of files.entries()) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
          status(message, 'Choose PNG, JPG or WebP product images up to 5 MB each.', true);
          return;
        }
        const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-');
        const path = `${id}/${crypto.randomUUID()}-${safeName}`;
        status(message, `Uploading product image ${index + 1} of ${files.length}…`);
        let uploadError;
        try {
          ({ error: uploadError } = await client.storage.from(IMAGE_BUCKET).upload(path, file, { upsert: false, cacheControl: '3600' }));
        } catch (error) {
          uploadError = error;
        }
        if (uploadError) {
          const networkHint = /failed to fetch|network/i.test(uploadError.message || '')
            ? ' The browser could not reach Supabase Storage; check internet access, the configured Supabase project URL, and any browser CORS/origin restriction.'
            : '';
          status(message, `Image upload failed: ${uploadError.message}. Check that migration 003 created the public product-images bucket and admin upload policy.${networkHint}`, true);
          return;
        }
        uploadedImages.push({
          image_url: client.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl,
          alt_text: `${payload.name} image ${index + 1}`,
          is_primary: !form.dataset.currentImageUrl && index === 0,
          sort_order: Number(form.dataset.currentImageCount || 0) + index + 1
        });
      }
      if (uploadedImages.length && !form.dataset.currentImageUrl) payload.image_url = uploadedImages[0].image_url;

      status(message, 'Saving product…');
      const isEditing = Boolean(fields.namedItem('id').value);
      const result = isEditing
        ? await client.from('products').update(payload).eq('id', id)
        : await client.from('products').insert(payload);
      if (result.error) {
        status(message, `Product save failed: ${result.error.message}`, true);
        return;
      }
      if (uploadedImages.length) {
        const { error: galleryError } = await client.from('product_images').insert(
          uploadedImages.map((image) => ({ ...image, product_id: id }))
        );
        if (galleryError) {
          status(message, `Product saved, but its gallery could not be linked: ${galleryError.message}. Confirm migration 003 created the product_images table, then retry adding the images.`, true);
          await loadAdminProducts();
          return;
        }
      }
      form.reset();
      delete form.dataset.currentImageUrl;
      delete form.dataset.currentImageCount;
      status(message, 'Product saved.');
      await loadAdminProducts();
    });

    const { data, error } = await client.auth.getSession();
    if (error) status(message, error.message, true);
    setAccess(data?.session?.user || null);
      client.auth.onAuthStateChange((_event, session) => {
        window.setTimeout(() => setAccess(session?.user || null), 0);
      });
  }

  async function setupAdminGate() {
    const gate = document.querySelector('[data-admin-auth-gate]');
    if (!gate) return;
    const shell = document.querySelector('[data-admin-shell]');
    const form = gate.querySelector('[data-admin-login-form]');
    const message = gate.querySelector('[data-admin-auth-status]');
    const logout = document.querySelector('[data-admin-logout]');

    function applyAdminAccess(user) {
      const isAdmin = Boolean(user && user.app_metadata?.role === 'admin');
      shell.classList.toggle('hidden', !isAdmin);
      gate.classList.toggle('hidden', isAdmin);
      logout.classList.toggle('hidden', !isAdmin);
      if (user && !isAdmin) {
        status(message, 'This account is not authorized for admin access.', true);
      } else if (!user) {
        status(message, 'Sign in with the administrator email and password.');
      }
    }

    if (!client) {
      status(message, 'Admin sign-in unavailable. Configure the public Supabase URL and anon key.', true);
      return;
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const values = new FormData(form);
      status(message, 'Verifying admin account…');
      const { data, error } = await client.auth.signInWithPassword({
        email: values.get('email'),
        password: values.get('password')
      });
      if (error) {
        status(message, `Sign-in failed: ${error.message}`, true);
        return;
      }
      applyAdminAccess(data.user);
    });

    const { data, error } = await client.auth.getSession();
    if (error) status(message, error.message, true);
    applyAdminAccess(data?.session?.user || null);
    client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => applyAdminAccess(session?.user || null), 0);
    });
  }

  async function setupAdminOrders() {
    const list = document.querySelector('[data-admin-order-list]');
    const message = document.querySelector('[data-admin-orders-status]');
    if (!list || !message || !client) return;
    let isAdmin = false;

    async function loadOrders() {
      if (!isAdmin) return;
      status(message, 'Loading orders…');
      const { data, error } = await client.from('orders')
        .select('id,order_number,status,payment_status,delivery_status,total_amount,created_at,order_items(name,quantity),shipments(id,courier_name,tracking_number,status)')
        .order('created_at', { ascending: false });
      if (error) {
        status(message, `Could not load orders: ${error.message}`, true);
        return;
      }

      const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      const deliveryStatuses = ['pending', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'returned'];
      list.replaceChildren(...(data || []).map((order) => {
        const row = document.createElement('article');
        row.className = 'admin-list-item order-admin-item';
        const details = document.createElement('div');
        const heading = document.createElement('strong');
        heading.textContent = `${order.order_number} · ${money(order.total_amount)}`;
        const items = document.createElement('p');
        items.textContent = (order.order_items || []).map((item) => `${item.name} × ${item.quantity}`).join(', ');
        const state = document.createElement('p');
        state.textContent = `Payment: ${order.payment_status} · Placed ${new Date(order.created_at).toLocaleDateString('en-IN')}`;
        details.append(heading, items, state);
        const shipment = order.shipments?.[0];
        if (shipment?.tracking_number) {
          const tracking = document.createElement('p');
          tracking.textContent = `${shipment.courier_name || 'Carrier'} · Tracking ${shipment.tracking_number}`;
          details.append(tracking);
        }

        const controls = document.createElement('div');
        controls.className = 'order-admin-controls';
        const statusSelect = document.createElement('select');
        statusSelect.setAttribute('aria-label', `Order status for ${order.order_number}`);
        orderStatuses.forEach((value) => statusSelect.add(new Option(value, value, false, value === order.status)));
        const deliverySelect = document.createElement('select');
        deliverySelect.setAttribute('aria-label', `Delivery status for ${order.order_number}`);
        deliveryStatuses.forEach((value) => deliverySelect.add(new Option(value, value, false, value === order.delivery_status)));
        const save = document.createElement('button');
        save.type = 'button';
        save.className = 'button small';
        save.textContent = 'Update';
        save.addEventListener('click', async () => {
          save.disabled = true;
          const result = await client.rpc('admin_update_order_status', {
            p_order_id: order.id,
            p_status: statusSelect.value,
            p_delivery_status: deliverySelect.value
          });
          save.disabled = false;
          if (result.error) status(message, `Order update failed: ${result.error.message}`, true);
          else {
            status(message, `Updated ${order.order_number}.`);
            await loadOrders();
          }
        });
        controls.append(statusSelect, deliverySelect, save);
        if (order.payment_status === 'paid' && !shipment && order.delivery_status !== 'delivered') {
          const createShipment = document.createElement('button');
          createShipment.type = 'button';
          createShipment.className = 'button small secondary';
          createShipment.textContent = 'Create shipment';
          createShipment.addEventListener('click', async () => {
            createShipment.disabled = true;
            status(message, `Creating carrier shipment for ${order.order_number}…`);
            const result = await client.functions.invoke('create-shiprocket-shipment', { body: { order_id: order.id } });
            createShipment.disabled = false;
            if (result.error || result.data?.error) {
              status(message, `Shipment failed: ${result.data?.error || result.error.message}`, true);
            } else {
              status(message, `Shipment created for ${order.order_number}.`);
              await loadOrders();
            }
          });
          controls.append(createShipment);
        }
        if (order.payment_status === 'paid') {
          const courierInput = document.createElement('input');
          courierInput.type = 'text';
          courierInput.placeholder = 'Courier';
          courierInput.setAttribute('aria-label', `Courier for ${order.order_number}`);
          courierInput.value = shipment?.courier_name || '';
          const trackingInput = document.createElement('input');
          trackingInput.type = 'text';
          trackingInput.placeholder = 'Tracking number';
          trackingInput.setAttribute('aria-label', `Tracking number for ${order.order_number}`);
          trackingInput.value = shipment?.tracking_number || '';
          const saveTracking = document.createElement('button');
          saveTracking.type = 'button';
          saveTracking.className = 'button small secondary';
          saveTracking.textContent = 'Save tracking';
          saveTracking.addEventListener('click', async () => {
            const values = {
              order_id: order.id,
              courier_name: courierInput.value.trim() || null,
              tracking_number: trackingInput.value.trim() || null,
              status: order.delivery_status || 'pending',
              pincode: null
            };
            const result = shipment?.id
              ? await client.from('shipments').update(values).eq('id', shipment.id)
              : await client.from('shipments').insert(values);
            if (result.error) status(message, `Tracking update failed: ${result.error.message}`, true);
            else await loadOrders();
          });
          controls.append(courierInput, trackingInput, saveTracking);
        }
        row.append(details, controls);
        return row;
      }));
      status(message, `${(data || []).length} orders loaded. Payment status is read-only here.`);
    }

    function onSession(user) {
      isAdmin = Boolean(user && user.app_metadata?.role === 'admin');
      if (isAdmin) loadOrders();
      else list.replaceChildren();
    }

    const { data, error } = await client.auth.getSession();
    if (error) status(message, error.message, true);
    onSession(data?.session?.user || null);
    client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => onSession(session?.user || null), 0);
    });
  }

  async function setupAdminOverview() {
    const stats = document.querySelector('[data-admin-overview-stats]');
    const recent = document.querySelector('[data-admin-orders]');
    const recentEnquiries = document.querySelector('[data-admin-recent-enquiries]');
    const message = document.querySelector('[data-admin-overview-status]');
    if (!stats || !recent || !recentEnquiries || !message || !client) return;
    let isAdmin = false;

    async function loadOverview() {
      if (!isAdmin) return;
      status(message, 'Loading live overview…');
      const [productsResult, servicesResult, ordersResult, pendingResult, recentResult, enquiryResult] = await Promise.all([
        client.from('products').select('id', { count: 'exact', head: true }),
        client.from('services').select('id', { count: 'exact', head: true }),
        client.from('orders').select('id', { count: 'exact', head: true }),
        client.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        client.from('orders').select('id,order_number,status,total_amount,created_at').order('created_at', { ascending: false }).limit(5),
        client.from('enquiries').select('id,name,subject,status,created_at').order('created_at', { ascending: false }).limit(5)
      ]);
      const error = productsResult.error || servicesResult.error || ordersResult.error || pendingResult.error || recentResult.error || enquiryResult.error;
      if (error) {
        status(message, `Could not load dashboard data: ${error.message}`, true);
        return;
      }

      const metrics = [
        ['Products', productsResult.count || 0],
        ['Services', servicesResult.count || 0],
        ['Orders', ordersResult.count || 0],
        ['Pending orders', pendingResult.count || 0]
      ];
      stats.replaceChildren(...metrics.map(([label, value]) => {
        const item = document.createElement('div');
        const count = document.createElement('strong');
        count.textContent = String(value);
        const name = document.createElement('span');
        name.textContent = label;
        item.append(count, name);
        return item;
      }));

      recent.replaceChildren(...(recentResult.data || []).map((order) => {
        const row = document.createElement('div');
        row.className = 'admin-list-item';
        const number = document.createElement('span');
        number.textContent = `${order.order_number} · ${money(order.total_amount)}`;
        const state = document.createElement('strong');
        state.textContent = order.status;
        row.append(number, state);
        return row;
      }));
      if (!recentResult.data?.length) {
        const empty = document.createElement('p');
        empty.className = 'catalog-status';
        empty.textContent = 'No customer orders yet.';
        recent.append(empty);
      }
      recentEnquiries.replaceChildren(...(enquiryResult.data || []).map((enquiry) => {
        const row = document.createElement('div');
        row.className = 'admin-list-item';
        const label = document.createElement('span');
        label.textContent = `${enquiry.name} · ${enquiry.subject || 'Website enquiry'}`;
        const state = document.createElement('strong');
        state.textContent = enquiry.status;
        row.append(label, state);
        return row;
      }));
      if (!enquiryResult.data?.length) {
        const empty = document.createElement('p');
        empty.className = 'catalog-status';
        empty.textContent = 'No enquiries yet.';
        recentEnquiries.append(empty);
      }
      status(message, 'Overview loaded from Supabase. Revenue is omitted until payment verification is integrated.');
    }

    function onSession(user) {
      isAdmin = Boolean(user && user.app_metadata?.role === 'admin');
      if (isAdmin) loadOverview();
      else {
        stats.replaceChildren();
        recent.replaceChildren();
        recentEnquiries.replaceChildren();
      }
    }

    const { data, error } = await client.auth.getSession();
    if (error) status(message, error.message, true);
    onSession(data?.session?.user || null);
    client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => onSession(session?.user || null), 0);
    });
  }

  async function setupAdminEnquiries() {
    const list = document.querySelector('[data-admin-enquiries]');
    const message = document.querySelector('[data-admin-enquiries-status]');
    if (!list || !message || !client) return;
    let isAdmin = false;

    async function loadEnquiries() {
      if (!isAdmin) return;
      status(message, 'Loading enquiries…');
      const { data, error } = await client.from('enquiries')
        .select('id,name,email,phone,subject,message,source,status,created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) {
        status(message, `Could not load enquiries: ${error.message}`, true);
        return;
      }

      const statuses = ['new', 'contacted', 'quoted', 'closed', 'spam'];
      list.replaceChildren(...(data || []).map((enquiry) => {
        const card = document.createElement('article');
        card.className = 'admin-card enquiry-admin-card';
        const title = document.createElement('h3');
        title.textContent = enquiry.subject || 'Website enquiry';
        const contact = document.createElement('p');
        contact.textContent = `${enquiry.name} · ${enquiry.email}${enquiry.phone ? ` · ${enquiry.phone}` : ''}`;
        const body = document.createElement('p');
        body.textContent = enquiry.message;
        const meta = document.createElement('p');
        meta.className = 'catalog-status';
        meta.textContent = `${enquiry.source || 'website'} · ${new Date(enquiry.created_at).toLocaleString('en-IN')}`;
        const controls = document.createElement('div');
        controls.className = 'inline-actions';
        const stateSelect = document.createElement('select');
        stateSelect.setAttribute('aria-label', `Enquiry status from ${enquiry.name}`);
        statuses.forEach((value) => stateSelect.add(new Option(value, value, false, value === enquiry.status)));
        const update = document.createElement('button');
        update.type = 'button';
        update.className = 'button small';
        update.textContent = 'Update status';
        update.addEventListener('click', async () => {
          const { error: updateError } = await client.from('enquiries').update({ status: stateSelect.value }).eq('id', enquiry.id);
          if (updateError) status(message, `Could not update enquiry: ${updateError.message}`, true);
          else await loadEnquiries();
        });
        controls.append(stateSelect, update);
        card.append(title, contact, body, meta, controls);
        return card;
      }));
      status(message, `${(data || []).length} enquiries loaded.`);
    }

    function onSession(user) {
      isAdmin = Boolean(user && user.app_metadata?.role === 'admin');
      if (isAdmin) loadEnquiries();
      else list.replaceChildren();
    }

    const { data, error } = await client.auth.getSession();
    if (error) status(message, error.message, true);
    onSession(data?.session?.user || null);
    client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => onSession(session?.user || null), 0);
    });
  }

  async function setupContentAdmin() {
    const blogForm = document.querySelector('[data-blog-form]');
    const portfolioForm = document.querySelector('[data-portfolio-form]');
    const faqForm = document.querySelector('[data-faq-form]');
    const settingsForm = document.getElementById('siteSettingsForm');
    if ((!blogForm && !portfolioForm && !faqForm && !settingsForm) || !client) return;

    const blogStatus = document.querySelector('[data-blog-admin-status]');
    const portfolioStatus = document.querySelector('[data-portfolio-admin-status]');
    const faqStatus = document.querySelector('[data-faq-admin-status]');
    const settingsStatus = document.querySelector('[data-settings-status]');
    const blogList = document.querySelector('[data-admin-blog-list]');
    const portfolioList = document.querySelector('[data-admin-portfolio-list]');
    const faqList = document.querySelector('[data-admin-faq-list]');
    let isAdmin = false;

    async function loadBlogs() {
      if (!isAdmin || !blogList) return;
      const { data, error } = await client.from('blog_posts').select('*').order('created_at', { ascending: false });
      if (error) {
        blogList.replaceChildren();
        status(blogStatus, `Could not load posts: ${error.message}`, true);
        return;
      }
      blogList.replaceChildren(...(data || []).map((post) => {
        const row = document.createElement('div');
        row.className = 'admin-list-item';
        const title = document.createElement('span');
        title.textContent = `${post.title} · ${post.status}`;
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.textContent = 'Edit';
        edit.addEventListener('click', () => {
          blogForm.elements.namedItem('id').value = post.id;
          blogForm.elements.namedItem('title').value = post.title;
          blogForm.elements.namedItem('slug').value = post.slug;
          blogForm.elements.namedItem('excerpt').value = post.excerpt || '';
          blogForm.elements.namedItem('seo_title').value = post.seo_title || '';
          blogForm.elements.namedItem('seo_description').value = post.seo_description || '';
          blogForm.elements.namedItem('content').value = post.content || '';
          blogForm.elements.namedItem('status').value = post.status;
          blogForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        row.append(title, edit);
        return row;
      }));
      status(blogStatus, `${(data || []).length} posts loaded.`);
    }

    async function loadPortfolio() {
      if (!isAdmin || !portfolioList) return;
      const { data, error } = await client.from('portfolio_projects').select('*').order('display_order', { ascending: true });
      if (error) {
        portfolioList.replaceChildren();
        status(portfolioStatus, `Could not load portfolio: ${error.message}`, true);
        return;
      }
      portfolioList.replaceChildren(...(data || []).map((project) => {
        const row = document.createElement('div');
        row.className = 'admin-list-item';
        const title = document.createElement('span');
        title.textContent = `${project.title} · ${project.is_published ? 'Published' : 'Draft'}`;
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.textContent = 'Edit';
        edit.addEventListener('click', () => {
          portfolioForm.elements.namedItem('id').value = project.id;
          portfolioForm.elements.namedItem('title').value = project.title;
          portfolioForm.elements.namedItem('slug').value = project.slug;
          portfolioForm.elements.namedItem('category').value = project.category || '';
          portfolioForm.elements.namedItem('description').value = project.description || '';
          portfolioForm.elements.namedItem('is_published').checked = project.is_published;
          portfolioForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        const publish = document.createElement('button');
        publish.type = 'button';
        publish.textContent = project.is_published ? 'Archive' : 'Publish';
        publish.addEventListener('click', async () => {
          const { error: updateError } = await client.from('portfolio_projects').update({ is_published: !project.is_published }).eq('id', project.id);
          if (updateError) status(portfolioStatus, updateError.message, true);
          else await loadPortfolio();
        });
        row.append(title, edit, publish);
        return row;
      }));
      status(portfolioStatus, `${(data || []).length} portfolio items loaded.`);
    }

    async function loadSettings() {
      if (!isAdmin || !settingsForm) return;
      const { data, error } = await client.from('site_settings').select('key,value');
      if (error) {
        settingsForm.reset();
        status(settingsStatus, `Could not load settings: ${error.message}`, true);
        return;
      }
      const values = Object.fromEntries((data || []).map((row) => [row.key, typeof row.value === 'string' ? row.value : String(row.value ?? '')]));
      document.getElementById('settingsBusinessName').value = values.business_name || '';
      document.getElementById('settingsAddress').value = values.location || '';
      document.getElementById('settingsPhone').value = values.phone || '';
      document.getElementById('settingsWhatsApp').value = values.whatsapp || '';
      document.getElementById('settingsEmail').value = values.email || '';
      document.getElementById('settingsHours').value = values.hours || '';
      document.getElementById('settingsMapLink').value = values.map_url || '';
      document.getElementById('settingsSlogan').value = values.slogan || '';
      status(settingsStatus, 'Settings loaded from Supabase.');
    }

    async function loadFaqs() {
      if (!isAdmin || !faqList) return;
      const { data, error } = await client.from('faqs').select('*').order('display_order', { ascending: true });
      if (error) {
        faqList.replaceChildren();
        status(faqStatus, `Could not load FAQs: ${error.message}`, true);
        return;
      }
      faqList.replaceChildren(...(data || []).map((faq) => {
        const row = document.createElement('div');
        row.className = 'admin-list-item';
        const label = document.createElement('span');
        label.textContent = `${faq.question} · ${faq.is_published ? 'Published' : 'Draft'}`;
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.textContent = 'Edit';
        edit.addEventListener('click', () => {
          faqForm.elements.namedItem('id').value = faq.id;
          faqForm.elements.namedItem('question').value = faq.question;
          faqForm.elements.namedItem('answer').value = faq.answer;
          faqForm.elements.namedItem('is_published').checked = faq.is_published;
          faqForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        row.append(label, edit);
        return row;
      }));
      status(faqStatus, `${(data || []).length} FAQ entries loaded.`);
    }

    blogForm?.addEventListener('reset', () => { window.setTimeout(() => { blogForm.elements.namedItem('id').value = ''; }, 0); });
    blogForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!isAdmin) return;
      const values = blogForm.elements;
      const title = values.namedItem('title').value.trim();
      const slug = values.namedItem('slug').value.trim();
      const content = values.namedItem('content').value.trim();
      if (!title || !slug || !content) {
        status(blogStatus, 'Title, slug, and article content are required.', true);
        return;
      }
      const payload = {
        title,
        slug,
        excerpt: values.namedItem('excerpt').value.trim() || null,
        seo_title: values.namedItem('seo_title').value.trim() || null,
        seo_description: values.namedItem('seo_description').value.trim() || null,
        content,
        status: values.namedItem('status').value,
        published_at: values.namedItem('status').value === 'published' ? new Date().toISOString() : null
      };
      const image = await uploadImage(values.namedItem('image').files[0], 'site-content', 'blog', slug);
      if (image.error) {
        status(blogStatus, image.error.message, true);
        return;
      }
      if (image.url) payload.featured_image_url = image.url;
      const id = values.namedItem('id').value;
      status(blogStatus, 'Saving post…');
      const result = id ? await client.from('blog_posts').update(payload).eq('id', id) : await client.from('blog_posts').insert(payload);
      if (result.error) {
        status(blogStatus, `Save failed: ${result.error.message}`, true);
        return;
      }
      blogForm.reset();
      status(blogStatus, 'Blog post saved.');
      await loadBlogs();
    });

    portfolioForm?.addEventListener('reset', () => { window.setTimeout(() => { portfolioForm.elements.namedItem('id').value = ''; }, 0); });
    portfolioForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!isAdmin) return;
      const values = portfolioForm.elements;
      const title = values.namedItem('title').value.trim();
      const slug = values.namedItem('slug').value.trim();
      if (!title || !slug) {
        status(portfolioStatus, 'Title and slug are required.', true);
        return;
      }
      const payload = {
        title,
        slug,
        category: values.namedItem('category').value.trim() || null,
        description: values.namedItem('description').value.trim() || null,
        is_published: values.namedItem('is_published').checked
      };
      const image = await uploadImage(values.namedItem('image').files[0], 'site-content', 'portfolio', slug, true);
      if (image.error) {
        status(portfolioStatus, image.error.message, true);
        return;
      }
      if (image.url && image.mediaType === 'video') {
        payload.video_url = image.url;
        payload.media_type = 'video';
      } else if (image.url) {
        payload.thumbnail_url = image.url;
        payload.video_url = null;
        payload.media_type = 'image';
      }
      const id = values.namedItem('id').value;
      status(portfolioStatus, 'Saving project…');
      const result = id ? await client.from('portfolio_projects').update(payload).eq('id', id) : await client.from('portfolio_projects').insert(payload);
      if (result.error) {
        status(portfolioStatus, `Save failed: ${result.error.message}`, true);
        return;
      }
      portfolioForm.reset();
      status(portfolioStatus, 'Portfolio item saved.');
      await loadPortfolio();
    });

    faqForm?.addEventListener('reset', () => { window.setTimeout(() => { faqForm.elements.namedItem('id').value = ''; }, 0); });
    faqForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!isAdmin) return;
      const values = faqForm.elements;
      const question = values.namedItem('question').value.trim();
      const answer = values.namedItem('answer').value.trim();
      if (!question || !answer) {
        status(faqStatus, 'Question and answer are required.', true);
        return;
      }
      const payload = { question, answer, is_published: values.namedItem('is_published').checked };
      const id = values.namedItem('id').value;
      const result = id
        ? await client.from('faqs').update(payload).eq('id', id)
        : await client.from('faqs').insert(payload);
      if (result.error) {
        status(faqStatus, `Save failed: ${result.error.message}`, true);
        return;
      }
      faqForm.reset();
      status(faqStatus, 'FAQ saved.');
      await loadFaqs();
    });

    settingsForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!isAdmin) return;
      const rows = [
        ['business_name', 'settingsBusinessName'], ['location', 'settingsAddress'],
        ['phone', 'settingsPhone'], ['whatsapp', 'settingsWhatsApp'],
        ['email', 'settingsEmail'], ['hours', 'settingsHours'],
        ['map_url', 'settingsMapLink'], ['slogan', 'settingsSlogan']
      ].map(([key, id]) => ({ key, value: document.getElementById(id).value.trim(), updated_at: new Date().toISOString() }));
      status(settingsStatus, 'Saving business settings…');
      const { error } = await client.from('site_settings').upsert(rows, { onConflict: 'key' });
      if (error) {
        status(settingsStatus, `Save failed: ${error.message}`, true);
        return;
      }
      await loadPublicSettings();
      status(settingsStatus, 'Business settings saved.');
    });

    async function onSession(user) {
      isAdmin = Boolean(user && user.app_metadata?.role === 'admin');
      if (!isAdmin) return;
      await Promise.all([loadBlogs(), loadPortfolio(), loadFaqs(), loadSettings()]);
    }

    const { data, error } = await client.auth.getSession();
    if (error) {
      status(blogStatus, error.message, true);
      status(portfolioStatus, error.message, true);
      status(settingsStatus, error.message, true);
    }
    await onSession(data?.session?.user || null);
    client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => onSession(session?.user || null), 0);
    });
  }

  async function setupPageBuilderAndMedia() {
    const sectionForm = document.querySelector('[data-page-section-form]');
    const bannerForm = document.querySelector('[data-banner-form]');
    const mediaForm = document.querySelector('[data-media-form]');
    if ((!sectionForm && !bannerForm && !mediaForm) || !client) return;

    const sectionList = document.querySelector('[data-admin-page-sections]');
    const sectionStatus = document.querySelector('[data-page-sections-status]');
    const bannerList = document.querySelector('[data-admin-banners]');
    const bannerStatus = document.querySelector('[data-banners-status]');
    const mediaList = document.querySelector('[data-media-library]');
    const mediaStatus = document.querySelector('[data-media-status]');
    let isAdmin = false;

    async function loadSections() {
      if (!isAdmin || !sectionList) return;
      const { data, error } = await client.from('page_sections').select('*').order('page_slug').order('display_order');
      if (error) {
        sectionList.replaceChildren();
        status(sectionStatus, `Could not load sections: ${error.message}`, true);
        return;
      }
      sectionList.replaceChildren(...(data || []).map((item) => {
        const row = document.createElement('div');
        row.className = 'admin-list-item';
        const label = document.createElement('span');
        label.textContent = `${item.page_slug}/${item.section_key} · ${item.is_active ? 'Published' : 'Hidden'}`;
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.textContent = 'Edit';
        edit.addEventListener('click', () => {
          const fields = sectionForm.elements;
          for (const key of ['id', 'page_slug', 'section_key', 'section_type', 'title', 'subtitle', 'body', 'image_alt', 'button_label', 'button_url', 'display_order']) {
            fields.namedItem(key).value = item[key] ?? '';
          }
          fields.namedItem('is_active').checked = item.is_active;
          sectionForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = 'Delete';
        remove.addEventListener('click', async () => {
          if (!window.confirm(`Delete the ${item.title} section?`)) return;
          const { error: deleteError } = await client.from('page_sections').delete().eq('id', item.id);
          if (deleteError) status(sectionStatus, deleteError.message, true);
          else await loadSections();
        });
        row.append(label, edit, remove);
        return row;
      }));
      status(sectionStatus, `${(data || []).length} sections loaded.`);
    }

    async function loadBanners() {
      if (!isAdmin || !bannerList) return;
      const { data, error } = await client.from('banners').select('*').order('page_slug').order('display_order');
      if (error) {
        bannerList.replaceChildren();
        status(bannerStatus, `Could not load banners: ${error.message}`, true);
        return;
      }
      bannerList.replaceChildren(...(data || []).map((banner) => {
        const row = document.createElement('div');
        row.className = 'admin-list-item';
        const label = document.createElement('span');
        const now = Date.now();
        const isInSchedule = (!banner.starts_at || new Date(banner.starts_at).getTime() <= now)
          && (!banner.ends_at || new Date(banner.ends_at).getTime() >= now);
        const visibility = !banner.is_active ? 'Paused' : isInSchedule ? 'Live' : 'Scheduled';
        label.textContent = `${banner.page_slug} · ${banner.title || 'Untitled'} · ${visibility}`;
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.textContent = 'Edit';
        edit.addEventListener('click', () => {
          const fields = bannerForm.elements;
          for (const key of ['id', 'page_slug', 'title', 'subtitle', 'body', 'button_label', 'link_url', 'display_order']) fields.namedItem(key).value = banner[key] ?? '';
          fields.namedItem('is_active').checked = banner.is_active;
          fields.namedItem('starts_at').value = toLocalDateTimeInput(banner.starts_at);
          fields.namedItem('ends_at').value = toLocalDateTimeInput(banner.ends_at);
          bannerForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = 'Delete';
        remove.addEventListener('click', async () => {
          if (!window.confirm(`Delete the ${banner.title || 'banner'} banner?`)) return;
          const { error: deleteError } = await client.from('banners').delete().eq('id', banner.id);
          if (deleteError) status(bannerStatus, deleteError.message, true);
          else await loadBanners();
        });
        row.append(label, edit, remove);
        return row;
      }));
      status(bannerStatus, `${(data || []).length} banners loaded.`);
    }

    async function loadMedia() {
      if (!isAdmin || !mediaList) return;
      const { data, error } = await client.from('media_assets').select('*').order('created_at', { ascending: false });
      if (error) {
        mediaList.replaceChildren();
        status(mediaStatus, `Could not load media: ${error.message}`, true);
        return;
      }
      mediaList.replaceChildren(...(data || []).map((asset) => {
        const card = document.createElement('article');
        card.className = 'media-library-item';
        const image = document.createElement('img');
        image.src = safeImageUrl(asset.public_url);
        image.alt = asset.alt_text;
        image.loading = 'lazy';
        const label = document.createElement('p');
        label.textContent = `${asset.alt_text} · ${asset.collection}${asset.is_public ? ' · Public' : ' · Admin only'}`;
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'button small secondary';
        remove.textContent = 'Delete image';
        remove.addEventListener('click', async () => {
          if (!window.confirm(`Delete “${asset.alt_text}” from the media library?`)) return;
          if (asset.storage_bucket !== 'local') {
            const { error: storageError } = await client.storage.from(asset.storage_bucket).remove([asset.storage_path]);
            if (storageError) {
              status(mediaStatus, `Storage deletion failed: ${storageError.message}`, true);
              return;
            }
          }
          const { error: recordError } = await client.from('media_assets').delete().eq('id', asset.id);
          if (recordError) status(mediaStatus, recordError.message, true);
          else await loadMedia();
        });
        card.append(image, label, remove);
        return card;
      }));
      status(mediaStatus, `${(data || []).length} uploaded images.`);
    }

    async function loadSections() {
      if (!isAdmin || !sectionList) return;
      const { data, error } = await client.from('page_sections').select('*').order('page_slug').order('display_order');
      if (error) {
        sectionList.replaceChildren();
        status(sectionStatus, `Could not load sections: ${error.message}`, true);
        return;
      }
      sectionList.replaceChildren(...(data || []).map((item) => {
        const row = document.createElement('div');
        row.className = 'admin-list-item';
        const title = document.createElement('span');
        title.textContent = `${item.page_slug}/${item.section_key} · ${item.title} · ${item.is_active ? 'Active' : 'Hidden'}`;
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.textContent = 'Edit';
        edit.addEventListener('click', () => {
          const fields = sectionForm.elements;
          ['id', 'page_slug', 'section_key', 'section_type', 'title', 'subtitle', 'body', 'media_collection', 'image_alt', 'button_label', 'button_url', 'display_order'].forEach((key) => {
            fields.namedItem(key).value = item[key] ?? '';
          });
          fields.namedItem('is_active').checked = item.is_active;
          sectionForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = 'Delete';
        remove.addEventListener('click', async () => {
          if (!window.confirm(`Delete section “${item.title}”?`)) return;
          const { error: deleteError } = await client.from('page_sections').delete().eq('id', item.id);
          if (deleteError) status(sectionStatus, deleteError.message, true);
          else await loadSections();
        });
        row.append(title, edit, remove);
        return row;
      }));
      status(sectionStatus, `${(data || []).length} sections loaded.`);
    }

    async function loadBanners() {
      if (!isAdmin || !bannerList) return;
      const { data, error } = await client.from('banners').select('*').order('page_slug').order('display_order');
      if (error) {
        bannerList.replaceChildren();
        status(bannerStatus, `Could not load banners: ${error.message}`, true);
        return;
      }
      bannerList.replaceChildren(...(data || []).map((banner) => {
        const row = document.createElement('div');
        row.className = 'admin-list-item';
        const label = document.createElement('span');
        const now = Date.now();
        const isInSchedule = (!banner.starts_at || new Date(banner.starts_at).getTime() <= now)
          && (!banner.ends_at || new Date(banner.ends_at).getTime() >= now);
        const visibility = !banner.is_active ? 'Paused' : isInSchedule ? 'Live' : 'Scheduled';
        label.textContent = `${banner.page_slug} · ${banner.title || 'Untitled'} · ${visibility}`;
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.textContent = 'Edit';
        edit.addEventListener('click', () => {
          const fields = bannerForm.elements;
          ['id', 'page_slug', 'title', 'subtitle', 'body', 'button_label', 'link_url', 'display_order'].forEach((key) => {
            fields.namedItem(key).value = banner[key] ?? '';
          });
          fields.namedItem('is_active').checked = banner.is_active;
          fields.namedItem('starts_at').value = toLocalDateTimeInput(banner.starts_at);
          fields.namedItem('ends_at').value = toLocalDateTimeInput(banner.ends_at);
          bannerForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = 'Delete';
        remove.addEventListener('click', async () => {
          if (!window.confirm(`Delete banner “${banner.title || 'Untitled'}”?`)) return;
          const { error: deleteError } = await client.from('banners').delete().eq('id', banner.id);
          if (deleteError) status(bannerStatus, deleteError.message, true);
          else await loadBanners();
        });
        row.append(label, edit, remove);
        return row;
      }));
      status(bannerStatus, `${(data || []).length} banners loaded.`);
    }

    sectionForm?.addEventListener('reset', () => { window.setTimeout(() => { sectionForm.elements.namedItem('id').value = ''; }, 0); });
    sectionForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!isAdmin) return;
      const fields = sectionForm.elements;
      const pageSlug = fields.namedItem('page_slug').value.trim().toLowerCase();
      const sectionKey = fields.namedItem('section_key').value.trim().toLowerCase();
      const title = fields.namedItem('title').value.trim();
      if (!pageSlug || !sectionKey || !title) {
        status(sectionStatus, 'Enter a page slug, section key, and title.', true);
        return;
      }
      const payload = {
        page_slug: pageSlug,
        section_key: sectionKey,
        section_type: fields.namedItem('section_type').value,
        title,
        subtitle: fields.namedItem('subtitle').value.trim() || null,
        body: fields.namedItem('body').value.trim() || null,
        media_collection: fields.namedItem('media_collection').value.trim() || null,
        image_alt: fields.namedItem('image_alt').value.trim() || null,
        button_label: fields.namedItem('button_label').value.trim() || null,
        button_url: safeLinkUrl(fields.namedItem('button_url').value.trim()) || null,
        display_order: Number(fields.namedItem('display_order').value || 0),
        is_active: fields.namedItem('is_active').checked
      };
      const image = await uploadImage(fields.namedItem('image').files[0], 'site-content', `sections/${pageSlug}`, sectionKey);
      if (image.error) {
        status(sectionStatus, image.error.message, true);
        return;
      }
      if (image.url) payload.image_url = image.url;
      const id = fields.namedItem('id').value;
      const result = id
        ? await client.from('page_sections').update(payload).eq('id', id)
        : await client.from('page_sections').upsert(payload, { onConflict: 'page_slug,section_key' });
      if (result.error) {
        status(sectionStatus, `Save failed: ${result.error.message}`, true);
        return;
      }
      sectionForm.reset();
      status(sectionStatus, 'Page section saved.');
      await loadSections();
    });

    bannerForm?.addEventListener('reset', () => { window.setTimeout(() => { bannerForm.elements.namedItem('id').value = ''; }, 0); });
    bannerForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!isAdmin) return;
      const fields = bannerForm.elements;
      const pageSlug = fields.namedItem('page_slug').value.trim().toLowerCase();
      const startValue = fields.namedItem('starts_at').value;
      const endValue = fields.namedItem('ends_at').value;
      if (!pageSlug || (startValue && endValue && new Date(endValue) <= new Date(startValue))) {
        status(bannerStatus, 'Check the page slug and ensure the end time is after the start time.', true);
        return;
      }
      const payload = {
        page_slug: pageSlug,
        title: fields.namedItem('title').value.trim() || null,
        subtitle: fields.namedItem('subtitle').value.trim() || null,
        body: fields.namedItem('body').value.trim() || null,
        button_label: fields.namedItem('button_label').value.trim() || null,
        link_url: safeLinkUrl(fields.namedItem('link_url').value.trim()) || null,
        starts_at: startValue ? new Date(startValue).toISOString() : null,
        ends_at: endValue ? new Date(endValue).toISOString() : null,
        display_order: Number(fields.namedItem('display_order').value || 0),
        is_active: fields.namedItem('is_active').checked
      };
      const image = await uploadImage(fields.namedItem('image').files[0], 'site-content', `banners/${pageSlug}`, `banner-${Date.now()}`);
      if (image.error) {
        status(bannerStatus, image.error.message, true);
        return;
      }
      if (image.url) payload.image_url = image.url;
      const id = fields.namedItem('id').value;
      const result = id ? await client.from('banners').update(payload).eq('id', id) : await client.from('banners').insert(payload);
      if (result.error) {
        status(bannerStatus, `Save failed: ${result.error.message}`, true);
        return;
      }
      bannerForm.reset();
      status(bannerStatus, 'Banner saved.');
      await loadBanners();
    });

    mediaForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!isAdmin) return;
      const fields = mediaForm.elements;
      const file = fields.namedItem('file').files[0];
      const altText = fields.namedItem('alt_text').value.trim();
      if (!file || !altText) {
        status(mediaStatus, 'Select an image and provide alt text.', true);
        return;
      }
      const collection = fields.namedItem('collection').value;
      const image = await uploadImage(file, 'site-content', collection, 'asset');
      if (image.error) {
        status(mediaStatus, image.error.message, true);
        return;
      }
      const storagePath = decodeURIComponent(new URL(image.url).pathname.split('/object/public/site-content/')[1] || '');
      if (!storagePath) {
        status(mediaStatus, 'Could not identify uploaded image path.', true);
        return;
      }
      const { error } = await client.from('media_assets').insert({
        storage_path: storagePath,
        storage_bucket: 'site-content',
        public_url: image.url,
        alt_text: altText,
        collection,
        is_public: fields.namedItem('is_public').checked,
        created_by: currentUser?.id || null
      });
      if (error) {
        status(mediaStatus, `Image uploaded but its library record failed: ${error.message}`, true);
        return;
      }
      mediaForm.reset();
      status(mediaStatus, 'Image added to media library.');
      await loadMedia();
    });

    async function onSession(user) {
      isAdmin = Boolean(user && user.app_metadata?.role === 'admin');
      if (isAdmin) await Promise.all([loadSections(), loadBanners(), loadMedia()]);
      else {
        sectionList?.replaceChildren();
        bannerList?.replaceChildren();
        mediaList?.replaceChildren();
      }
    }

    const { data } = await client.auth.getSession();
    await onSession(data?.session?.user || null);
    client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => onSession(session?.user || null), 0);
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    document.querySelectorAll('.hero-visual img, .workstream-photo img').forEach((image) => {
      image.addEventListener('error', () => image.remove(), { once: true });
    });
    client = getClient();
    if (client) {
      const { data } = await client.auth.getUser();
      currentUser = data.user || null;
      client.auth.onAuthStateChange((_event, session) => { currentUser = session?.user || null; });
    }
    setupProductCatalog();
    setupProductDetail();
    setupAccountAuth();
    setupCartCheckout();
    setupAdminGate();
    setupProductAdmin();
    setupAdminOrders();
    setupAdminOverview();
    setupAdminEnquiries();
    setupContentAdmin();
    setupPageBuilderAndMedia();
    loadPublicSettings();
    loadPublicContent();
    loadBlogPost();
    updateCartBadge();
    if ('serviceWorker' in navigator) {
      const commerceScript = [...document.scripts].find((script) => /(?:^|\/)commerce\.js(?:\?|$)/.test(script.src));
      if (commerceScript) {
        const workerUrl = new URL('service-worker.js', commerceScript.src);
        navigator.serviceWorker.register(workerUrl.href).catch((error) => {
          console.warn('PWA offline cache could not be registered:', error.message);
        });
      }
    }
    const installButton = document.getElementById('installAppButton');
    let installPrompt = null;
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      installPrompt = event;
      installButton?.classList.remove('hidden');
    });
    installButton?.addEventListener('click', async () => {
      if (!installPrompt) return;
      await installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      installButton.classList.add('hidden');
    });
    window.addEventListener('appinstalled', () => installButton?.classList.add('hidden'));
  });
})();
