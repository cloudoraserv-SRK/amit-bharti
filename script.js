const STORAGE_KEYS = {
  cart: 'amitBhartiCart',
  siteData: 'amitBhartiSiteData'
};

const DEFAULT_SETTINGS = {
  businessName: 'Amit Bharti Flex & Printing',
  slogan: 'Printing, branding and digital growth support',
  location: 'Station Road, Jalaun, Uttar Pradesh',
  phone: 'Add business phone in admin',
  whatsapp: '919999999999',
  email: 'hello@example.com',
  hours: 'Business hours managed in admin',
  mapLink: 'https://maps.google.com/?q=Station+Road+Jalaun+Uttar+Pradesh'
};

const DEFAULT_PRODUCTS = [
  {
    id: 'flex-banner',
    name: 'Flex Banner',
    category: 'signage',
    price: 599,
    emoji: '📢',
    short: 'Outdoor flex banners built for storefronts, campaigns and events.',
    description: 'High-visibility banners for shops, events, expositions and seasonal promotions with durable material options and custom sizing.',
    features: ['Outdoor-ready print material', 'Custom sizing and quantity', 'Fast local delivery support']
  },
  {
    id: 'business-cards',
    name: 'Business Cards',
    category: 'paper',
    price: 299,
    emoji: '💼',
    short: 'Premium business cards for a polished local-first first impression.',
    description: 'Professional business cards with premium finish options, color matching and compact ordering for anytime use.',
    features: ['Multiple thickness options', 'Custom front and back design', 'Small and bulk order support']
  },
  {
    id: 'packaging',
    name: 'Packaging',
    category: 'signage',
    price: 899,
    emoji: '📦',
    short: 'Packaging and boxes designed to make products feel premium.',
    description: 'Custom packaging and branded boxes for retail collections, gifting, promotions and product launches.',
    features: ['Retail-ready packaging', 'Custom sizing', 'Print-ready artwork support']
  },
  {
    id: 'tshirt-printing',
    name: 'T-shirt Printing',
    category: 'fashion',
    price: 349,
    emoji: '👕',
    short: 'Team shirts, event branding and custom merchandise runs.',
    description: 'Printed apparel for teams, events, schools and promotional merchandise with flexible quantities and finishes.',
    features: ['Custom color and print options', 'Bulk quantity support', 'Quick production scheduling']
  },
  {
    id: 'mug-printing',
    name: 'Mug Printing',
    category: 'gift',
    price: 249,
    emoji: '☕',
    short: 'Personalized mugs for gifting, workplace use and customer appreciation.',
    description: 'Useful gift items for teams, events and promotion campaigns with custom artwork and print finishing.',
    features: ['Corporate gifting support', 'Artwork customization', 'Durable ceramic finishes']
  },
  {
    id: 'name-plate',
    name: 'Name Plate',
    category: 'office',
    price: 399,
    emoji: '🏷️',
    short: 'Professional signage for offices, reception desks and shopfronts.',
    description: 'Custom tabletops, signage and name plates that improve identity for storefronts, offices and workspaces.',
    features: ['Multiple material finishes', 'Custom text and layout', 'Professional appearance']
  },
  {
    id: 'sticker-print',
    name: 'Sticker Printing',
    category: 'paper',
    price: 180,
    emoji: '✨',
    short: 'Branded stickers for packaging, distribution and retail visibility.',
    description: 'Compact, versatile printed stickers perfect for personal branding, business packaging and event giveaways.',
    features: ['Cut-to-size labels', 'High-quality adhesive materials', 'Small batch flexibility']
  },
  {
    id: 'poster-print',
    name: 'Poster Printing',
    category: 'signage',
    price: 450,
    emoji: '🖼️',
    short: 'Posters built for event promotion, store announcements and campaigns.',
    description: 'Large format and standard posters for events, campaigns and local business promotions with bold, readable layouts.',
    features: ['Large format printing', 'Matte or gloss finish', 'Event-ready art support']
  }
];

const DEFAULT_SERVICES = [
  {
    id: 'website-design',
    title: 'Website Development',
    slug: 'website-development',
    type: 'Web',
    price: 15000,
    description: 'Business websites and landing pages designed for trust, usability and conversion.',
    deliverables: ['Responsive design', 'SEO setup', 'Lead capture forms']
  },
  {
    id: 'ecommerce',
    title: 'E-Commerce Development',
    slug: 'e-commerce-development',
    type: 'Web',
    price: 28000,
    description: 'Online storefronts that support products, carts, checkout and customer trust.',
    deliverables: ['Storefront UX', 'Cart and checkout flow', 'Order management']
  },
  {
    id: 'social-media',
    title: 'Social Media Marketing',
    slug: 'social-media-marketing',
    type: 'Marketing',
    price: 12000,
    description: 'Content planning and social campaigns to improve engagement and local brand recall.',
    deliverables: ['Content calendar', 'Creative direction', 'Campaign reporting']
  },
  {
    id: 'ads',
    title: 'Meta Ads & Google Ads',
    slug: 'meta-ads-google-ads',
    type: 'Marketing',
    price: 18000,
    description: 'Traffic and conversion campaigns built around the right audience and ongoing optimization.',
    deliverables: ['Campaign setup', 'Audience targeting', 'Performance review']
  },
  {
    id: 'graphic-design',
    title: 'Graphic Design',
    slug: 'graphic-design',
    type: 'Branding',
    price: 8000,
    description: 'Marketing creatives, product content and visual support for campaigns and packaging.',
    deliverables: ['Brand creative', 'Packaging assets', 'Social creatives']
  },
  {
    id: 'ai-video',
    title: 'AI Video Creation',
    slug: 'ai-video-creation',
    type: 'Creative',
    price: 14000,
    description: 'Short-form promotional videos that boost awareness and make your business easier to trust.',
    deliverables: ['Script idea', 'Voice and video generation', 'Ready-to-share output']
  }
];

const DEFAULT_PORTFOLIO = [
  { id: 'printing-campaign', title: 'Retail Printing Campaign', category: 'Printing', emoji: '🖨️', description: 'Business signage and promotional print support for a local shopfront launch.' },
  { id: 'brand-refresh', title: 'Brand Refresh', category: 'Branding', emoji: '🎨', description: 'Visual refresh for a local business looking for a more premium identity.' },
  { id: 'event-setup', title: 'Event Promotion Set', category: 'Marketing', emoji: '🚀', description: 'Promotional banners, event collaterals and social support for a local event.' }
];

const DEFAULT_BLOGS = [
  { id: 'business-card-importance', title: 'Why a strong business card still matters', slug: 'why-a-strong-business-card-still-matters', excerpt: 'Even in digital-first marketing, a high-quality card gives trust and recall.', date: '2026-10-01' },
  { id: 'local-branding', title: 'How local branding helps small businesses win trust', slug: 'how-local-branding-helps-small-businesses-win-trust', excerpt: 'Consistency in print, signage and online presence makes your business easier to remember.', date: '2026-09-14' },
  { id: 'website-vs-social', title: 'Website or social media first?', slug: 'website-or-social-media-first', excerpt: 'A clear conversion plan often starts with a trusted website and strong local discovery.', date: '2026-08-29' }
];

const DEFAULT_FAQS = [
  { id: 'faq-1', question: 'Can I order custom sizes or quantities?', answer: 'Yes. The admin can update products, pricing and options. For custom work, send your quantity and dimensions in the quote form.' },
  { id: 'faq-2', question: 'Do you support artwork uploads?', answer: 'The storefront is designed for artwork upload flows and can be connected to Supabase Storage and private customer buckets.' },
  { id: 'faq-3', question: 'How long does production take?', answer: 'Production timelines depend on quantity, finish, artwork approval and delivery location. The admin dashboard allows delivery estimates to be updated easily.' }
];

const DEFAULT_ORDERS = [
  { id: 'ORD-1001', label: 'Pending print order', status: 'Processing', total: 1899 },
  { id: 'ORD-1002', label: 'Brand kit enquiry', status: 'Quoted', total: 2400 },
  { id: 'ORD-1003', label: 'Website project', status: 'In progress', total: 32000 }
];

function getState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.siteData) || 'null');
    if (raw) return raw;
  } catch (error) {
    console.warn('Failed to read persisted app state:', error);
  }

  const initialState = {
    settings: { ...DEFAULT_SETTINGS },
    products: [...DEFAULT_PRODUCTS],
    services: [...DEFAULT_SERVICES],
    portfolio: [...DEFAULT_PORTFOLIO],
    blogs: [...DEFAULT_BLOGS],
    faqs: [...DEFAULT_FAQS],
    orders: [...DEFAULT_ORDERS]
  };

  localStorage.setItem(STORAGE_KEYS.siteData, JSON.stringify(initialState));
  return initialState;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEYS.siteData, JSON.stringify(state));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function getWhatsAppNumber() {
  const state = getState();
  const value = state.settings.whatsapp || '919999999999';
  return value.replace(/\D/g, '');
}

function renderSettings() {
  document.querySelectorAll('[data-site-location]').forEach((node) => {
    node.textContent = 'Location pending confirmation';
  });

  document.querySelectorAll('[data-site-email]').forEach((node) => {
    node.textContent = 'Email pending confirmation';
    if (node.tagName === 'A') {
      node.removeAttribute('href');
    }
  });

  document.querySelectorAll('[data-site-phone]').forEach((node) => {
    node.textContent = 'Phone pending confirmation';
    if (node.tagName === 'A') {
      node.removeAttribute('href');
    }
  });

  document.querySelectorAll('[data-site-hours]').forEach((node) => {
    node.textContent = 'Business hours pending confirmation';
  });

  const yearLabel = document.getElementById('yearLabel');
  if (yearLabel) {
    yearLabel.textContent = String(new Date().getFullYear());
  }
}

function renderProductCard(product) {
  return `
    <article class="product-card" data-category="${product.category}">
      <div class="product-icon">${product.emoji || '📦'}</div>
      <h3>${product.name}</h3>
      <p>${product.short}</p>
      <div class="meta-row">
        <span>${formatCurrency(product.price)}</span>
        <div>
          <button class="small-link" type="button" data-product="${product.name}">Quote</button>
          <button class="small-link" type="button" data-add-cart="${product.id}">Add</button>
        </div>
      </div>
    </article>
  `;
}

function renderServiceCard(service) {
  return `
    <article class="service-card">
      <div class="service-icon">✨</div>
      <h3>${service.title}</h3>
      <p>${service.description}</p>
      <div class="meta-row">
        <span>${formatCurrency(service.price || 0)}</span>
        <button class="small-link" type="button" data-product="${service.title}">Quote</button>
      </div>
    </article>
  `;
}

function renderPortfolioCard(item) {
  return `
    <article class="portfolio-card">
      <div class="portfolio-visual">${item.emoji || '🖨️'}</div>
      <div class="blog-date">${item.category || 'Portfolio'}</div>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
    </article>
  `;
}

function renderBlogCard(post) {
  return `
    <article class="blog-card">
      <div class="blog-date">${new Date(post.date || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
      <h3>${post.title}</h3>
      <p>${post.excerpt}</p>
      <a class="small-link" href="blog.html">Read article</a>
    </article>
  `;
}

function renderFaqList() {
  return;
}

function renderHomePage() {
  return;
}

function renderProductsPage() {
  return;
}

function renderServicesPage() {
  if (document.querySelector('[data-service-catalog]')) return;
  const state = getState();
  const grid = document.querySelector('[data-services-grid]');
  if (!grid) return;
  grid.innerHTML = state.services.map(renderServiceCard).join('');
}

function renderPortfolioPage() {
  return;
}

function renderBlogPage() {
  return;
}

function renderProductDetailPage() {
  return;
}

function renderCartPage() {
  const cartRoot = document.querySelector('[data-cart-page]');
  if (!cartRoot) return;

  const state = getState();
  const cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]');

  if (!cart.length) {
    cartRoot.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Choose a product and start your custom print order.</p>
        <a class="button" href="products.html">Browse products</a>
      </div>
    `;
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  cartRoot.innerHTML = `
    <div class="cart-items">
      ${cart.map((item) => `
        <div class="cart-item">
          <div class="cart-item-icon">${state.products.find((product) => product.id === item.id)?.emoji || '📦'}</div>
          <div class="cart-item-meta">
            <h3>${item.name}</h3>
            <p>${formatCurrency(item.price)} each</p>
          </div>
          <div class="cart-item-controls">
            <button type="button" data-cart-minus="${item.id}">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-cart-plus="${item.id}">+</button>
          </div>
          <strong>${formatCurrency(item.quantity * item.price)}</strong>
          <button type="button" class="remove-btn" data-cart-remove="${item.id}">Remove</button>
        </div>
      `).join('')}
    </div>
    <aside class="cart-summary">
      <h3>Order summary</h3>
      <div class="summary-row"><span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong></div>
      <div class="summary-row"><span>Shipping</span><span>Calculated later</span></div>
      <div class="summary-row"><span>Total</span><strong>${formatCurrency(subtotal)}</strong></div>
      <button class="button full-width" type="button" data-cart-whatsapp>Order on WhatsApp</button>
      <a class="button secondary full-width" href="products.html">Add more items</a>
    </aside>
  `;

  document.querySelectorAll('[data-cart-plus]').forEach((button) => {
    button.addEventListener('click', () => updateCartQuantity(button.dataset.cartPlus, 1));
  });

  document.querySelectorAll('[data-cart-minus]').forEach((button) => {
    button.addEventListener('click', () => updateCartQuantity(button.dataset.cartMinus, -1));
  });

  document.querySelectorAll('[data-cart-remove]').forEach((button) => {
    button.addEventListener('click', () => removeCartItem(button.dataset.cartRemove));
  });

  const whatsappButton = document.querySelector('[data-cart-whatsapp]');
  whatsappButton?.addEventListener('click', () => {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]');
    const summary = items.map((item) => `${item.quantity} x ${item.name}`).join(', ');
    openWhatsApp(`Hi Amit Bharti, I want to place the following order: ${summary}. Please confirm pricing and delivery.`);
  });
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]');
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, quantity = 1) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === productId);
  const product = getState().products.find((entry) => entry.id === productId);
  if (!product) return;

  if (item) {
    item.quantity += quantity;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, quantity });
  }

  saveCart(cart);
  renderCartPage();
}

function updateCartQuantity(productId, delta) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;

  item.quantity = Math.max(1, item.quantity + delta);
  saveCart(cart);
  renderCartPage();
}

function removeCartItem(productId) {
  const nextCart = getCart().filter((item) => item.id !== productId);
  saveCart(nextCart);
  renderCartPage();
}

function updateCartBadge() {
  const total = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('[data-cart-count]').forEach((node) => {
    node.textContent = String(total);
  });
}

function openWhatsApp(message) {
  const sanitized = encodeURIComponent(message);
  const phone = getWhatsAppNumber();
  window.open(`https://wa.me/${phone}?text=${sanitized}`, '_blank', 'noopener,noreferrer');
}

function bindQuoteButtons() {
  const quoteButtons = document.querySelectorAll('[data-product]');
  quoteButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.dataset.product || 'custom order';
      const productSelect = document.getElementById('productSelect');
      const messageBox = document.getElementById('quoteMessage');
      const target = document.getElementById('quote');

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      if (productSelect) {
        productSelect.value = value;
      }

      if (messageBox) {
        messageBox.value = `I want a quote for ${value}. Please share pricing, quantities and timeline.`;
      }
    });
  });

  document.querySelectorAll('[data-whatsapp]').forEach((button) => {
    button.addEventListener('click', () => {
      const productName = button.dataset.whatsapp || 'custom order';
      openWhatsApp(`Hi Amit Bharti, I want to enquire about ${productName}. Please share pricing and delivery details.`);
    });
  });
}

function bindAddCartButtons() {
  document.querySelectorAll('[data-add-cart]').forEach((button) => {
    button.addEventListener('click', () => {
      addToCart(button.dataset.addCart, 1);
    });
  });
}

function bindGlobalActions() {
  bindQuoteButtons();
  bindAddCartButtons();

  document.querySelectorAll('[data-template-btn]').forEach((button) => {
    button.addEventListener('click', () => {
      const productSelect = document.getElementById('productSelect');
      const quoteMessage = document.getElementById('quoteMessage');
      const target = document.getElementById('quote');
      const label = button.dataset.templateBtn;

      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (productSelect) productSelect.value = label;
      if (quoteMessage) quoteMessage.value = `I want to use the ${label} template. Please share the option details and pricing.`;
    });
  });

  const quoteForm = document.getElementById('quoteForm');
  quoteForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(quoteForm);
    const client = window.AB_SUPABASE_CLIENT;
    const message = quoteForm.querySelector('[data-enquiry-status]');
    if (!client) {
      if (message) message.textContent = 'Enquiry submission is unavailable until Supabase is configured.';
      return;
    }
    if (message) message.textContent = 'Sending enquiry…';
    const { error } = await client.rpc('submit_enquiry', {
      p_name: form.get('name'),
      p_email: form.get('email'),
      p_phone: form.get('phone') || null,
      p_subject: form.get('product') || 'Quote request',
      p_message: form.get('message'),
      p_source: 'homepage_quote'
    });
    if (error) {
      if (message) message.textContent = `Could not send enquiry: ${error.message}`;
      return;
    }
    if (message) message.textContent = 'Thank you. Your enquiry was sent.';
    quoteForm.reset();
  });

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const service = new URLSearchParams(window.location.search).get('service');
    const enquiryOptions = {
      printing: { subject: 'Offline printing enquiry', message: 'I am interested in offline printing, signage or branding. Please contact me with options.' },
      'social-media': { subject: 'Social media campaign enquiry', message: 'I am interested in social media content and campaigns. Please contact me with options.' },
      website: { subject: 'Website project enquiry', message: 'I am interested in a website for my business. Please contact me with options.' }
    };
    const selectedEnquiry = enquiryOptions[service];
    if (selectedEnquiry) {
      contactForm.elements.namedItem('subject').value = selectedEnquiry.subject;
      contactForm.elements.namedItem('message').value = selectedEnquiry.message;
    }
  }
  contactForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(contactForm);
    const client = window.AB_SUPABASE_CLIENT;
    const message = contactForm.querySelector('[data-enquiry-status]');
    if (!client) {
      if (message) message.textContent = 'Enquiry submission is unavailable until Supabase is configured.';
      return;
    }
    if (message) message.textContent = 'Sending enquiry…';
    const { error } = await client.rpc('submit_enquiry', {
      p_name: form.get('name'),
      p_email: form.get('email'),
      p_phone: form.get('phone') || null,
      p_subject: form.get('subject') || 'Website contact',
      p_message: form.get('message'),
      p_source: 'contact_page'
    });
    if (error) {
      if (message) message.textContent = `Could not send enquiry: ${error.message}`;
      return;
    }
    if (message) message.textContent = 'Thank you. Your enquiry was sent.';
    contactForm.reset();
  });

  document.querySelectorAll('[data-admin-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      const tabName = button.dataset.adminTab;
      document.querySelectorAll('.admin-tab').forEach((tab) => tab.classList.toggle('active', tab === button));
      document.querySelectorAll('.admin-panel').forEach((panel) => {
        panel.classList.toggle('active', panel.dataset.adminPanel === tabName);
      });
    });
  });
}

function renderAdminDashboard() {
  const state = getState();
  const adminBody = document.body.classList.contains('admin-body');
  if (!adminBody) return;

  const statsRoot = document.querySelector('[data-admin-overview-stats]');
  statsRoot?.replaceChildren();

  const orderList = document.querySelector('[data-admin-orders]');
  orderList?.replaceChildren();

  const productList = document.querySelector('[data-admin-product-list]');
  if (productList) {
    productList.innerHTML = state.products.map((product) => `
      <div class="admin-list-item">
        <span>${product.name}</span>
        <span>
          <button type="button" data-edit-product="${product.id}">Edit</button>
          <button type="button" data-delete-product="${product.id}">Delete</button>
        </span>
      </div>
    `).join('');

    productList.querySelectorAll('[data-edit-product]').forEach((button) => {
      button.addEventListener('click', () => loadProductForm(button.dataset.editProduct));
    });

    productList.querySelectorAll('[data-delete-product]').forEach((button) => {
      button.addEventListener('click', () => deleteProduct(button.dataset.deleteProduct));
    });
  }

  const serviceList = document.querySelector('[data-admin-service-list]');
  if (serviceList) {
    serviceList.innerHTML = state.services.map((service) => `
      <div class="admin-list-item">
        <span>${service.title}</span>
        <span>
          <button type="button" data-edit-service="${service.id}">Edit</button>
          <button type="button" data-delete-service="${service.id}">Delete</button>
        </span>
      </div>
    `).join('');

    serviceList.querySelectorAll('[data-edit-service]').forEach((button) => {
      button.addEventListener('click', () => loadServiceForm(button.dataset.editService));
    });

    serviceList.querySelectorAll('[data-delete-service]').forEach((button) => {
      button.addEventListener('click', () => deleteService(button.dataset.deleteService));
    });
  }

  const portfolioList = document.querySelector('[data-admin-portfolio-list]');
  if (portfolioList) {
    portfolioList.innerHTML = state.portfolio.map((item) => `
      <div class="admin-list-item"><span>${item.title}</span><button type="button">Feature</button></div>
    `).join('');
  }

  const blogList = document.querySelector('[data-admin-blog-list]');
  if (blogList) {
    blogList.innerHTML = state.blogs.map((post) => `
      <div class="admin-list-item"><span>${post.title}</span><button type="button">Open</button></div>
    `).join('');
  }

  const faqList = document.querySelector('[data-admin-faq-list]');
  if (faqList) {
    faqList.innerHTML = state.faqs.map((item) => `
      <div class="admin-list-item"><span>${item.question}</span><button type="button">Review</button></div>
    `).join('');
  }

  const orderListPanel = document.querySelector('[data-admin-order-list]');
  orderListPanel?.replaceChildren();

  const settingsForm = document.getElementById('siteSettingsForm');
  if (settingsForm) {
    document.getElementById('settingsBusinessName').value = state.settings.businessName || '';
    document.getElementById('settingsAddress').value = state.settings.location || '';
    document.getElementById('settingsPhone').value = state.settings.phone || '';
    document.getElementById('settingsWhatsApp').value = state.settings.whatsapp || '';
    document.getElementById('settingsEmail').value = state.settings.email || '';
    document.getElementById('settingsHours').value = state.settings.hours || '';
    document.getElementById('settingsMapLink').value = state.settings.mapLink || '';
    document.getElementById('settingsSlogan').value = state.settings.slogan || '';
  }

  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const id = document.getElementById('productId').value || `product-${Date.now()}`;
      const item = {
        id,
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: Number(document.getElementById('productPrice').value || 0),
        short: document.getElementById('productDescription').value.slice(0, 120),
        description: document.getElementById('productDescription').value,
        emoji: '📦',
        features: ['Custom options', 'Artwork support', 'Quick turnaround']
      };

      const current = getState();
      const index = current.products.findIndex((entry) => entry.id === id);
      if (index >= 0) {
        current.products[index] = { ...current.products[index], ...item };
      } else {
        current.products.unshift(item);
      }

      saveState(current);
      renderAll();
      productForm.reset();
    });
  }

  const serviceForm = document.getElementById('serviceForm');
  if (serviceForm) {
    serviceForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const id = document.getElementById('serviceId').value || `service-${Date.now()}`;
      const item = {
        id,
        title: document.getElementById('serviceTitle').value,
        slug: document.getElementById('serviceSlug').value || document.getElementById('serviceTitle').value.toLowerCase().replace(/\s+/g, '-'),
        type: document.getElementById('serviceType').value,
        price: Number(document.getElementById('servicePrice').value || 0),
        description: document.getElementById('serviceDescription').value,
        deliverables: ['Strategy', 'Execution']
      };

      const current = getState();
      const index = current.services.findIndex((entry) => entry.id === id);
      if (index >= 0) {
        current.services[index] = { ...current.services[index], ...item };
      } else {
        current.services.unshift(item);
      }

      saveState(current);
      renderAll();
      serviceForm.reset();
    });
  }

  settingsForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const next = getState();
    next.settings = {
      ...next.settings,
      businessName: document.getElementById('settingsBusinessName').value,
      location: document.getElementById('settingsAddress').value,
      phone: document.getElementById('settingsPhone').value,
      whatsapp: document.getElementById('settingsWhatsApp').value,
      email: document.getElementById('settingsEmail').value,
      hours: document.getElementById('settingsHours').value,
      mapLink: document.getElementById('settingsMapLink').value,
      slogan: document.getElementById('settingsSlogan').value
    };
    saveState(next);
    renderSettings();
    renderAll();
  });

  document.querySelector('[data-product-new]')?.addEventListener('click', () => resetProductForm());
  document.querySelector('[data-service-new]')?.addEventListener('click', () => resetServiceForm());
  document.querySelector('[data-product-reset]')?.addEventListener('click', () => resetProductForm());
  document.querySelector('[data-service-reset]')?.addEventListener('click', () => resetServiceForm());

  document.querySelector('[data-admin-logout]')?.addEventListener('click', async () => {
    const client = window.AB_SUPABASE_CLIENT;
    if (!client) {
      alert('Supabase is not configured. Add the project URL and public anon key before using admin sign-in.');
      return;
    }

    const { error } = await client.auth.signOut();
    if (error) {
      alert(`Sign-out failed: ${error.message}`);
      return;
    }

    window.location.reload();
  });
}

function loadProductForm(productId) {
  const product = getState().products.find((entry) => entry.id === productId);
  if (!product) return;
  document.getElementById('productId').value = product.id;
  document.getElementById('productName').value = product.name;
  document.getElementById('productSlug').value = product.slug || product.name.toLowerCase().replace(/\s+/g, '-');
  document.getElementById('productCategory').value = product.category || '';
  document.getElementById('productPrice').value = product.price || 0;
  document.getElementById('productDescription').value = product.description || '';
}

function resetProductForm() {
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
}

function loadServiceForm(serviceId) {
  const service = getState().services.find((entry) => entry.id === serviceId);
  if (!service) return;
  document.getElementById('serviceId').value = service.id;
  document.getElementById('serviceTitle').value = service.title || '';
  document.getElementById('serviceSlug').value = service.slug || '';
  document.getElementById('serviceType').value = service.type || '';
  document.getElementById('servicePrice').value = service.price || 0;
  document.getElementById('serviceDescription').value = service.description || '';
}

function resetServiceForm() {
  document.getElementById('serviceForm').reset();
  document.getElementById('serviceId').value = '';
}

function deleteProduct(productId) {
  const next = getState();
  next.products = next.products.filter((entry) => entry.id !== productId);
  saveState(next);
  renderAll();
}

function deleteService(serviceId) {
  const next = getState();
  next.services = next.services.filter((entry) => entry.id !== serviceId);
  saveState(next);
  renderAll();
}

function renderAll() {
  renderSettings();
  renderHomePage();
  renderProductsPage();
  renderServicesPage();
  renderPortfolioPage();
  renderBlogPage();
  renderFaqList();
  renderProductDetailPage();
  renderCartPage();
  renderAdminDashboard();
  bindGlobalActions();
  updateCartBadge();
}

document.addEventListener('DOMContentLoaded', () => {
  renderAll();
});
