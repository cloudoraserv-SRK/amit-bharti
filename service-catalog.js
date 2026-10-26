(function () {
  const UNIT_LABELS = {
    per_sq_ft: 'per sq. ft.',
    per_piece: 'per piece',
    per_day: 'per day',
    per_page: 'per page',
    per_vehicle: 'per vehicle',
    one_time: 'one time',
    quote: 'by quote'
  };

  function createClient() {
    if (window.AB_SUPABASE_CLIENT) return window.AB_SUPABASE_CLIENT;
    const config = window.AB_SUPABASE_CONFIG;
    if (!window.supabase || !config?.url || !config?.anonKey) return null;
    window.AB_SUPABASE_CLIENT = window.supabase.createClient(config.url, config.anonKey);
    return window.AB_SUPABASE_CLIENT;
  }

  function formatPrice(row) {
    if (row.price === null || row.price === undefined) return 'Contact for quote';
    const price = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: row.currency || 'INR',
      minimumFractionDigits: Number(row.price) % 1 ? 2 : 0,
      maximumFractionDigits: 2
    }).format(Number(row.price));
    return row.is_price_from ? `Starting at ${price}` : price;
  }

  function setStatus(node, message, isError) {
    if (!node) return;
    node.textContent = message;
    node.classList.toggle('error', Boolean(isError));
  }

  function safeImageUrl(value) {
    if (!value) return '';
    try {
      const url = new URL(value, window.location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch (_error) {
      return '';
    }
  }

  async function queryServices(client, columns, configure = (query) => query) {
    const makeQuery = (includeImage) => configure(client.from('services')
      .select(includeImage ? `${columns},image_url` : columns));
    let result = await makeQuery(true);
    if (result.error && /image_url|schema cache/i.test(result.error.message || '')) {
      result = await makeQuery(false);
    }
    return result;
  }

  async function attachServiceGalleries(client, services) {
    const serviceIds = (services || []).map((service) => service.id).filter(Boolean);
    let images = [];
    if (serviceIds.length) {
      const { data, error } = await client.from('service_images')
        .select('service_id,image_url,alt_text,is_primary,sort_order')
        .in('service_id', serviceIds)
        .order('is_primary', { ascending: false })
        .order('sort_order', { ascending: true });
      if (!error) images = data || [];
      else console.warn('Service gallery images are unavailable:', error.message);
    }
    const grouped = new Map();
    images.forEach((image) => {
      if (!grouped.has(image.service_id)) grouped.set(image.service_id, []);
      grouped.get(image.service_id).push({ url: image.image_url, alt: image.alt_text || '' });
    });
    return (services || []).map((service) => {
      const gallery = grouped.get(service.id) || [];
      if (service.image_url && !gallery.some((image) => image.url === service.image_url)) {
        gallery.unshift({ url: service.image_url, alt: service.name });
      }
      return { ...service, gallery_images: gallery };
    });
  }

  function buildServiceCard(row) {
    const card = document.createElement('article');
    card.className = 'catalog-card';

    const heading = document.createElement('div');
    heading.className = 'catalog-card-heading';
    const galleryItems = (row.gallery_images || (row.image_url ? [{ url: row.image_url, alt: row.name }] : []))
      .map((image) => ({ ...image, url: safeImageUrl(image.url) })).filter((image) => image.url);
    if (galleryItems.length) {
      const gallery = document.createElement('div');
      window.ABImageGallery?.render(gallery, galleryItems, {
        className: 'service-card-gallery',
        href: `service.html?slug=${encodeURIComponent(row.slug)}`,
        linkLabel: `Open ${row.name}`
      });
      card.append(gallery);
    }
    const name = document.createElement('h2');
    const nameLink = document.createElement('a');
    nameLink.href = `service.html?slug=${encodeURIComponent(row.slug)}`;
    nameLink.textContent = row.name;
    name.append(nameLink);
    const status = document.createElement('span');
    status.className = 'catalog-status-badge';
    status.textContent = 'Approved';
    heading.append(name, status);

    const price = document.createElement('p');
    price.className = 'catalog-price';
    price.textContent = formatPrice(row);
    const unit = document.createElement('p');
    unit.className = 'catalog-unit';
    unit.textContent = UNIT_LABELS[row.unit] || row.unit;
    const description = document.createElement('p');
    description.className = 'catalog-note';
    description.textContent = row.description || '';
    const note = document.createElement('p');
    note.className = 'catalog-price-note';
    note.textContent = row.price_note || '';
    const category = document.createElement('p');
    category.className = 'catalog-category';
    category.textContent = row.category;
    const detailLink = document.createElement('a');
    detailLink.className = 'small-link service-detail-link';
    detailLink.href = `service.html?slug=${encodeURIComponent(row.slug)}`;
    detailLink.textContent = 'View service details';

    card.append(heading, price, unit);
    if (description.textContent) card.append(description);
    if (note.textContent) card.append(note);
    card.append(category, detailLink);
    return card;
  }

  function setupPublicCatalog(client) {
    const root = document.querySelector('[data-service-catalog]');
    if (!root) return;

    const grid = root.querySelector('[data-services-grid]');
    const status = root.querySelector('[data-catalog-status]');
    const search = root.querySelector('#serviceSearch');
    const category = root.querySelector('#serviceCategory');
    if (!client) {
      setStatus(status, 'Catalogue unavailable: configure the public Supabase URL and anon key in supabase-config.js.', true);
      return;
    }

    let rows = [];
    const primaryCategories = ['Offline Printing', 'Social Media', 'Websites'];
    function render() {
      const query = search.value.trim().toLocaleLowerCase();
      const selectedCategory = category.value;
      const filtered = rows.filter((row) => {
        const matchesCategory = selectedCategory === 'all' || row.category === selectedCategory;
        const haystack = `${row.name} ${row.category} ${row.description || ''} ${row.price_note || ''}`.toLocaleLowerCase();
        return matchesCategory && haystack.includes(query);
      });

      const categoryNames = selectedCategory === 'all'
        ? [...new Set([...primaryCategories, ...rows.map((row) => row.category).filter(Boolean)])]
        : [selectedCategory];
      const visibleCategories = categoryNames.filter((name) => {
        if (!query && selectedCategory === 'all') return true;
        return filtered.some((row) => row.category === name);
      });
      grid.replaceChildren(...visibleCategories.map((name) => {
        const section = document.createElement('section');
        section.className = 'service-category-section';
        const heading = document.createElement('div');
        heading.className = 'service-category-heading';
        const titleWrap = document.createElement('div');
        const title = document.createElement('h2');
        title.textContent = name;
        const count = filtered.filter((row) => row.category === name).length;
        const subtitle = document.createElement('p');
        subtitle.textContent = count ? `${count} approved ${count === 1 ? 'service' : 'services'}` : 'Custom projects welcome';
        titleWrap.append(title, subtitle);
        heading.append(titleWrap);
        section.append(heading);
        const categoryRows = filtered.filter((row) => row.category === name);
        if (categoryRows.length) {
          const cards = document.createElement('div');
          cards.className = 'catalog-grid';
          cards.append(...categoryRows.map(buildServiceCard));
          section.append(cards);
        } else {
          const empty = document.createElement('div');
          empty.className = 'category-empty-state';
          const message = document.createElement('p');
          message.textContent = 'Tell us what you have in mind and we’ll prepare a tailored quote.';
          const contact = document.createElement('a');
          contact.className = 'small-link';
          contact.href = name === 'Websites'
            ? 'contact.html?service=website#contactForm'
            : name === 'Social Media'
              ? 'contact.html?service=social-media#contactForm'
              : 'contact.html?service=printing#contactForm';
          contact.textContent = 'Request a quote';
          empty.append(message, contact);
          section.append(empty);
        }
        return section;
      }));
      if (rows.length === 0) {
        setStatus(status, 'No approved services are published yet.', false);
      } else if (filtered.length === 0) {
        setStatus(status, 'No services match this search.', false);
      } else {
        setStatus(status, `${filtered.length} approved ${filtered.length === 1 ? 'service' : 'services'}.`, false);
      }
    }

    search.addEventListener('input', render);
    category.addEventListener('change', render);

    queryServices(client, 'id,name,slug,category,description,price,currency,unit,price_note,is_price_from,is_active,needs_confirmation,display_order', (query) => query
      .eq('is_active', true)
      .eq('needs_confirmation', false)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true }))
      .then(async ({ data, error }) => {
        if (error) throw error;
        rows = await attachServiceGalleries(client, data || []);
        const categories = [...new Set([...primaryCategories, ...rows.map((row) => row.category).filter(Boolean)])].sort();
        category.replaceChildren(new Option('All categories', 'all'));
        categories.forEach((value) => category.add(new Option(value, value)));
        const requestedCategory = new URLSearchParams(window.location.search).get('category');
        if (requestedCategory && categories.includes(requestedCategory)) category.value = requestedCategory;
        render();
      })
      .catch((error) => {
        console.error('Service catalogue request failed:', error);
        grid.replaceChildren();
        setStatus(status, 'Could not load the catalogue. Check the Supabase connection and services-table policies, then try again.', true);
      });
  }

  function setupHomeServices(client) {
    const root = document.querySelector('[data-home-services]');
    if (!root) return;

    function showMessage(message) {
      const note = document.createElement('p');
      note.className = 'catalog-status';
      note.textContent = message;
      root.replaceChildren(note);
    }

    if (!client) {
      showMessage('Service catalogue unavailable. Configure the public Supabase URL and anon key to display approved services.');
      return;
    }

    showMessage('Loading approved services…');
    queryServices(client, 'id,name,slug,category,description,price,currency,unit,price_note,is_price_from', (query) => query
      .eq('is_active', true)
      .eq('needs_confirmation', false)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })
      .limit(3))
      .then(async ({ data, error }) => {
        if (error) throw error;
        if (!data?.length) {
          showMessage('No approved services are published yet.');
          return;
        }

        const services = await attachServiceGalleries(client, data || []);
        const cards = services.map((row) => {
          const card = document.createElement('article');
          card.className = 'service-card';
          const galleryItems = (row.gallery_images || []).map((image) => ({ ...image, url: safeImageUrl(image.url) })).filter((image) => image.url);
          if (galleryItems.length) {
            const gallery = document.createElement('div');
            window.ABImageGallery?.render(gallery, galleryItems, {
              className: 'service-card-gallery',
              href: `service.html?slug=${encodeURIComponent(row.slug)}`,
              linkLabel: `Open ${row.name}`
            });
            card.append(gallery);
          }
          const title = document.createElement('h3');
          const link = document.createElement('a');
          link.href = `service.html?slug=${encodeURIComponent(row.slug)}`;
          link.textContent = row.name;
          title.append(link);
          const description = document.createElement('p');
          description.textContent = row.description || row.price_note || row.category;
          const meta = document.createElement('div');
          meta.className = 'meta-row';
          const price = document.createElement('span');
          price.textContent = `${formatPrice(row)} ${UNIT_LABELS[row.unit] || row.unit}`;
          const rateLink = document.createElement('a');
          rateLink.className = 'small-link';
          rateLink.href = `service.html?slug=${encodeURIComponent(row.slug)}`;
          rateLink.textContent = 'View details';
          meta.append(price, rateLink);
          card.append(title, description, meta);
          return card;
        });
        root.replaceChildren(...cards);
      })
      .catch((error) => {
        console.error('Homepage services request failed:', error);
        showMessage('Could not load approved services. Visit the rate list or try again later.');
      });
  }

  async function setupServiceDetail(client) {
    const root = document.querySelector('[data-service-detail]');
    if (!root) return;
    const slug = new URLSearchParams(window.location.search).get('slug');
    if (!client || !slug) {
      root.replaceChildren();
      setStatus(root, !client ? 'Service details are unavailable until Supabase is configured.' : 'Choose a service from the catalogue to view its details.', true);
      return;
    }

    const { data, error } = await queryServices(client,
      'id,name,slug,category,description,price,currency,unit,price_note,is_price_from,is_active,needs_confirmation',
      (query) => query.eq('slug', slug).eq('is_active', true).eq('needs_confirmation', false).limit(1));
    const service = data?.[0];
    if (error || !service) {
      root.replaceChildren();
      setStatus(root, error ? `Could not load service: ${error.message}` : 'This service is not published or no longer available.', true);
      return;
    }
    const [withGallery] = await attachServiceGalleries(client, [service]);
    const layout = document.createElement('div');
    layout.className = 'detail-layout service-detail-layout';
    const showcase = document.createElement('div');
    showcase.className = 'product-showcase';
    const images = (withGallery.gallery_images || []).map((image) => ({ ...image, url: safeImageUrl(image.url) })).filter((image) => image.url);
    if (images.length) {
      const gallery = document.createElement('div');
      window.ABImageGallery?.render(gallery, images, { className: 'service-detail-gallery', thumbnails: true });
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
    category.textContent = service.category;
    const heading = document.createElement('h1');
    heading.textContent = service.name;
    const price = document.createElement('p');
    price.className = 'catalog-price detail-price';
    price.textContent = `${formatPrice(service)} ${UNIT_LABELS[service.unit] || service.unit}`;
    const description = document.createElement('p');
    description.className = 'catalog-note';
    description.textContent = service.description || 'Contact us to discuss the scope and options for this service.';
    content.append(category, heading, price, description);
    if (service.price_note) {
      const note = document.createElement('p');
      note.className = 'catalog-price-note';
      note.textContent = service.price_note;
      content.append(note);
    }
    const actions = document.createElement('div');
    actions.className = 'detail-actions';
    const quote = document.createElement('a');
    quote.className = 'button';
    quote.href = `contact.html?service=${encodeURIComponent(service.slug)}#contactForm`;
    quote.textContent = 'Request a quote';
    const catalogue = document.createElement('a');
    catalogue.className = 'button secondary';
    catalogue.href = 'services.html';
    catalogue.textContent = 'Back to services';
    actions.append(quote, catalogue);
    content.append(actions);
    layout.append(showcase, content);
    root.replaceChildren(layout);
    const serviceTitle = `${service.name} | AB Ad World`;
    const serviceDescription = service.description || `Learn about ${service.name} from AB Ad World. Review the scope and request a tailored quote.`;
    const serviceUrl = new URL(`service.html?slug=${encodeURIComponent(service.slug)}`, window.location.href).href;
    window.ABSEO?.update({
      title: serviceTitle,
      description: serviceDescription,
      url: serviceUrl,
      image: images[0]?.url,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        serviceType: service.category,
        description: serviceDescription,
        provider: { '@type': 'Organization', name: 'AB Ad World', url: 'https://abadworld.cloud/' },
        areaServed: { '@type': 'AdministrativeArea', name: 'Jalaun, Uttar Pradesh' },
        url: serviceUrl
      }
    });
  }

  function setupAdmin(client) {
    const root = document.querySelector('[data-service-catalog-admin]');
    if (!root) return;

    const loginForm = root.querySelector('[data-service-login-form]');
    const status = root.querySelector('[data-admin-catalog-status]');
    const workspace = root.querySelector('[data-service-admin-workspace]');
    const list = root.querySelector('[data-service-admin-list]');
    const sessionActions = root.querySelector('[data-service-session-actions]');
    const form = root.querySelector('[data-service-form]');
    const fields = form.elements;
    let isAdmin = false;

    function setSignedIn(user) {
      isAdmin = Boolean(user && user.app_metadata?.role === 'admin');
      sessionActions.classList.toggle('hidden', !user);
      workspace.classList.toggle('hidden', !isAdmin);
      loginForm.classList.toggle('hidden', Boolean(user));
      root.querySelector('[data-service-admin-email]').textContent = user?.email || '';

      if (user && !isAdmin) {
        setStatus(status, 'This account is signed in but does not have the admin role. Ask the project owner to grant app_metadata.role = admin.', true);
      } else if (isAdmin) {
        setStatus(status, 'Admin access verified.', false);
        loadAdminRows();
      }
    }

    async function loadAdminRows() {
      if (!isAdmin) return;
      setStatus(status, 'Loading catalogue entries…', false);
      const { data, error } = await queryServices(client, 'id,name,slug,category,description,price,currency,unit,price_note,is_price_from,is_active,needs_confirmation,display_order', (query) => query
        .order('display_order', { ascending: true })
        .order('name', { ascending: true }));
      if (error) {
        setStatus(status, `Could not load catalogue entries: ${error.message}`, true);
        return;
      }
      const rowsWithGalleries = await attachServiceGalleries(client, data || []);

      const publishedCount = (data || []).filter((row) => row.is_active && !row.needs_confirmation).length;
      const approvalCount = (data || []).filter((row) => row.needs_confirmation).length;
      const inactiveCount = (data || []).filter((row) => !row.is_active).length;

      list.replaceChildren();
      rowsWithGalleries.forEach((row) => {
        const item = document.createElement('div');
        item.className = 'admin-list-item service-admin-item';
        const details = document.createElement('div');
        const thumbnails = (row.gallery_images || []).slice(0, 4);
        if (thumbnails.length) {
          const galleryPreview = document.createElement('div');
          galleryPreview.className = 'admin-gallery-preview';
          thumbnails.forEach((imageItem) => {
            const image = document.createElement('img');
            image.src = safeImageUrl(imageItem.url);
            image.alt = imageItem.alt || row.name;
            image.loading = 'lazy';
            galleryPreview.append(image);
          });
          details.append(galleryPreview);
        }
        const title = document.createElement('strong');
        title.textContent = row.name;
        const meta = document.createElement('p');
        const visibility = row.needs_confirmation
          ? (row.is_active ? 'Active, approval required' : 'Draft, approval required')
          : row.is_active ? 'Published' : 'Archived';
        meta.textContent = `${row.category} · ${formatPrice(row)} ${UNIT_LABELS[row.unit] || row.unit} · ${visibility}`;
        details.append(title, meta);

        const actions = document.createElement('div');
        actions.className = 'inline-actions';
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.textContent = 'Edit';
        edit.addEventListener('click', () => fillForm(row));
        const archive = document.createElement('button');
        archive.type = 'button';
        archive.textContent = row.needs_confirmation ? 'Approve & publish' : row.is_active ? 'Archive' : 'Activate';
        archive.addEventListener('click', () => updateRow(row.id, row.needs_confirmation
          ? { is_active: true, needs_confirmation: false }
          : { is_active: !row.is_active }));
        actions.append(edit, archive);
        item.append(details, actions);
        list.append(item);
      });
      setStatus(status, `${(data || []).length} entries · ${publishedCount} published · ${approvalCount} need approval · ${inactiveCount} inactive.`, false);
    }

    function fillForm(row) {
      fields.id.value = row.id;
      fields.name.value = row.name;
      fields.slug.value = row.slug;
      fields.category.value = row.category;
      fields.unit.value = row.unit;
      fields.price.value = row.price ?? '';
      fields.price_note.value = row.price_note || '';
      fields.description.value = row.description || '';
      fields.images.value = '';
      fields.is_price_from.checked = row.is_price_from;
      fields.is_active.checked = row.is_active;
      fields.needs_confirmation.checked = row.needs_confirmation;
      form.dataset.currentImageCount = String(row.gallery_images?.length || 0);
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function updateRow(id, changes) {
      const { error } = await client.from('services').update(changes).eq('id', id);
      if (error) {
        setStatus(status, `Update failed: ${error.message}`, true);
        return;
      }
      await loadAdminRows();
    }

    if (!client) {
      loginForm.classList.add('hidden');
      setStatus(status, 'Admin catalogue unavailable: configure the public Supabase URL and anon key in supabase-config.js.', true);
      return;
    }

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = new FormData(loginForm);
      setStatus(status, 'Signing in…', false);
      const { data: result, error } = await client.auth.signInWithPassword({
        email: data.get('email'),
        password: data.get('password')
      });
      if (error) {
        setStatus(status, `Sign-in failed: ${error.message}`, true);
        return;
      }
      setSignedIn(result.user);
    });

    root.querySelector('[data-service-logout]').addEventListener('click', async () => {
      await client.auth.signOut();
      isAdmin = false;
      workspace.classList.add('hidden');
      sessionActions.classList.add('hidden');
      loginForm.classList.remove('hidden');
      setStatus(status, 'Signed out.', false);
    });

    form.addEventListener('reset', () => {
      window.setTimeout(() => {
        fields.id.value = '';
        fields.category.value = 'Offline Printing';
        fields.needs_confirmation.checked = true;
        delete form.dataset.currentImageCount;
      }, 0);
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!isAdmin) return;

      const priceValue = fields.price.value.trim();
      const payload = {
        name: fields.name.value.trim(),
        slug: fields.slug.value.trim(),
        category: fields.category.value.trim(),
        unit: fields.unit.value,
        price: priceValue === '' ? null : Number(priceValue),
        currency: 'INR',
        price_note: fields.price_note.value.trim() || null,
        description: fields.description.value.trim() || null,
        is_price_from: fields.is_price_from.checked,
        is_active: fields.is_active.checked,
        needs_confirmation: fields.needs_confirmation.checked
      };

      const imageFiles = Array.from(fields.images.files || []);
      const uploadedImages = [];
      for (const [index, imageFile] of imageFiles.entries()) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(imageFile.type) || imageFile.size > 8 * 1024 * 1024) {
          setStatus(status, 'Choose a PNG, JPG or WebP service image up to 8 MB.', true);
          return;
        }
        const extension = imageFile.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        const path = `services/${payload.slug}-${Date.now()}-${index}-${crypto.randomUUID()}.${extension}`;
        setStatus(status, `Uploading service image ${index + 1} of ${imageFiles.length}…`, false);
        let uploadError;
        try {
          ({ error: uploadError } = await client.storage.from('site-content').upload(path, imageFile, {
            cacheControl: '3600', upsert: false, contentType: imageFile.type
          }));
        } catch (error) {
          uploadError = error;
        }
        if (uploadError) {
          const networkHint = /failed to fetch|network/i.test(uploadError.message || '')
            ? ' The browser could not reach Supabase Storage; check internet access, the configured Supabase project URL, and any browser CORS/origin restriction.'
            : '';
          setStatus(status, `Image upload failed: ${uploadError.message}. Confirm migration 004 created the site-content bucket and admin upload policy.${networkHint}`, true);
          return;
        }
        uploadedImages.push({
          image_url: client.storage.from('site-content').getPublicUrl(path).data.publicUrl,
          alt_text: imageFile.name.replace(/\.[^.]+$/, ''),
          is_primary: !payload.image_url && index === 0,
          sort_order: Number(form.dataset.currentImageCount || 0) + index + 1
        });
      }
      if (uploadedImages.length && !payload.image_url) payload.image_url = uploadedImages[0].image_url;

      if (!payload.name || !payload.slug || !payload.category || !payload.unit || (payload.price !== null && (!Number.isFinite(payload.price) || payload.price < 0))) {
        setStatus(status, 'Enter a name, slug, category and unit, and use a non-negative price.', true);
        return;
      }

      setStatus(status, 'Saving catalogue item…', false);
      const query = fields.id.value
        ? client.from('services').update(payload).eq('id', fields.id.value).select('id').single()
        : client.from('services').insert(payload).select('id').single();
      const { data: savedService, error } = await query;
      if (error) {
        const migrationHint = payload.image_url && /image_url|column/i.test(error.message || '')
          ? ' Apply Supabase migration 013_service_images.sql, then retry.'
          : '';
        setStatus(status, `Save failed: ${error.message}.${migrationHint}`, true);
        return;
      }

      if (uploadedImages.length) {
        const { error: galleryError } = await client.from('service_images').insert(
          uploadedImages.map((image) => ({ ...image, service_id: savedService.id }))
        );
        if (galleryError) {
          setStatus(status, `Service saved, but its gallery could not be linked: ${galleryError.message}. Apply migration 014_service_image_gallery.sql, then retry adding the images.`, true);
          await loadAdminRows();
          return;
        }
      }

      form.reset();
      fields.id.value = '';
      delete form.dataset.currentImageCount;
      fields.category.value = 'Offline Printing';
      fields.needs_confirmation.checked = true;
      setStatus(status, 'Catalogue item saved.', false);
      await loadAdminRows();
    });

    client.auth.getSession().then(({ data, error }) => {
      if (error) {
        setStatus(status, `Could not check sign-in: ${error.message}`, true);
        return;
      }
      setSignedIn(data.session?.user || null);
    });

    client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => setSignedIn(session?.user || null), 0);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const client = createClient();
    setupPublicCatalog(client);
    setupHomeServices(client);
    setupServiceDetail(client);
    setupAdmin(client);
  });
})();
