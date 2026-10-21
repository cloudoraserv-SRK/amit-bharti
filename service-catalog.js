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

  function buildServiceCard(row) {
    const card = document.createElement('article');
    card.className = 'catalog-card';

    const heading = document.createElement('div');
    heading.className = 'catalog-card-heading';
    const imageUrl = safeImageUrl(row.image_url);
    if (imageUrl) {
      const image = document.createElement('img');
      image.className = 'service-card-image';
      image.src = imageUrl;
      image.alt = row.name;
      image.loading = 'lazy';
      card.append(image);
    }
    const name = document.createElement('h2');
    name.textContent = row.name;
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

    card.append(heading, price, unit);
    if (description.textContent) card.append(description);
    if (note.textContent) card.append(note);
    card.append(category);
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
      .then(({ data, error }) => {
        if (error) throw error;
        rows = data || [];
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
    queryServices(client, 'name,category,description,price,currency,unit,price_note,is_price_from', (query) => query
      .eq('is_active', true)
      .eq('needs_confirmation', false)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })
      .limit(3))
      .then(({ data, error }) => {
        if (error) throw error;
        if (!data?.length) {
          showMessage('No approved services are published yet.');
          return;
        }

        const cards = data.map((row) => {
          const card = document.createElement('article');
          card.className = 'service-card';
          const title = document.createElement('h3');
          title.textContent = row.name;
          const description = document.createElement('p');
          description.textContent = row.description || row.price_note || row.category;
          const meta = document.createElement('div');
          meta.className = 'meta-row';
          const price = document.createElement('span');
          price.textContent = `${formatPrice(row)} ${UNIT_LABELS[row.unit] || row.unit}`;
          const link = document.createElement('a');
          link.className = 'small-link';
          link.href = 'services.html';
          link.textContent = 'View rate';
          meta.append(price, link);
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

      const publishedCount = (data || []).filter((row) => row.is_active && !row.needs_confirmation).length;
      const approvalCount = (data || []).filter((row) => row.needs_confirmation).length;
      const inactiveCount = (data || []).filter((row) => !row.is_active).length;

      list.replaceChildren();
      (data || []).forEach((row) => {
        const item = document.createElement('div');
        item.className = 'admin-list-item service-admin-item';
        const details = document.createElement('div');
        const imageUrl = safeImageUrl(row.image_url);
        if (imageUrl) {
          const image = document.createElement('img');
          image.className = 'service-admin-thumbnail';
          image.src = imageUrl;
          image.alt = row.name;
          image.loading = 'lazy';
          details.append(image);
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
      fields.image.value = '';
      fields.image.dataset.currentUrl = row.image_url || '';
      fields.is_price_from.checked = row.is_price_from;
      fields.is_active.checked = row.is_active;
      fields.needs_confirmation.checked = row.needs_confirmation;
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

      const imageFile = fields.image.files[0];
      if (imageFile) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(imageFile.type) || imageFile.size > 8 * 1024 * 1024) {
          setStatus(status, 'Choose a PNG, JPG or WebP service image up to 8 MB.', true);
          return;
        }
        const extension = imageFile.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        const path = `services/${payload.slug}-${Date.now()}.${extension}`;
        setStatus(status, 'Uploading service image…', false);
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
        payload.image_url = client.storage.from('site-content').getPublicUrl(path).data.publicUrl;
      }

      if (!payload.name || !payload.slug || !payload.category || !payload.unit || (payload.price !== null && (!Number.isFinite(payload.price) || payload.price < 0))) {
        setStatus(status, 'Enter a name, slug, category and unit, and use a non-negative price.', true);
        return;
      }

      setStatus(status, 'Saving catalogue item…', false);
      const query = fields.id.value
        ? client.from('services').update(payload).eq('id', fields.id.value)
        : client.from('services').insert(payload);
      const { error } = await query;
      if (error) {
        const migrationHint = payload.image_url && /image_url|column/i.test(error.message || '')
          ? ' Apply Supabase migration 013_service_images.sql, then retry.'
          : '';
        setStatus(status, `Save failed: ${error.message}.${migrationHint}`, true);
        return;
      }

      form.reset();
      fields.id.value = '';
      fields.category.value = 'Offline Printing';
      fields.image.dataset.currentUrl = '';
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
    setupAdmin(client);
  });
})();
