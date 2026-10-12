const PRODUCT_CATALOG = [
  {
    id: 'flex-banner',
    name: 'Flex Banner',
    category: 'signage',
    price: 599,
    emoji: '📢',
    short: 'Outdoor flex banners for shops, events and promotions.',
    description: 'High-impact flex banners built for storefronts, events, roadshows and seasonal promotions.',
    features: ['Weather-resistant material', 'Outdoor-ready finish', 'High-visibility printing'],
  },
  {
    id: 'tshirt-printing',
    name: 'T-shirt Printing',
    category: 'fashion',
    price: 299,
    emoji: '👕',
    short: 'Custom shirts for teams, events, schools and brand merch.',
    description: 'Premium cotton and custom art prints for uniforms, promotional apparel, weddings and special events.',
    features: ['Custom color matching', 'Bulk order support', 'Quick production'],
  },
  {
    id: 'mug-printing',
    name: 'Mug Printing',
    category: 'gift',
    price: 249,
    emoji: '🫖',
    short: 'Personalized mugs for gifting, promotions and workplace use.',
    description: 'Elegant mugs designed for personal gifting, employee kits, and branded giveaways.',
    features: ['Ceramic quality', 'Corporate gifting', 'Custom artwork'],
  },
  {
    id: 'pen-printing',
    name: 'Pen Printing',
    category: 'office',
    price: 90,
    emoji: '🖊️',
    short: 'Premium branded pens for gifting, offers and corporate events.',
    description: 'Professional pens for events, onboarding kits, and attention-grabbing promotions.',
    features: ['Bulk pricing', 'Brand logos', 'Corporate packs'],
  },
  {
    id: 'keychain-printing',
    name: 'Keychain Printing',
    category: 'gift',
    price: 120,
    emoji: '🗝️',
    short: 'Custom branded keychains for shops, events and giveaways.',
    description: 'Compact, stylish keychains that pair branding with everyday utility.',
    features: ['Custom shapes', 'Gift-friendly', 'Bulk runs'],
  },
  {
    id: 'name-plate-printing',
    name: 'Name Plate Printing',
    category: 'office',
    price: 399,
    emoji: '🏷️',
    short: 'Elegant plates for offices, homes, reception desks and shops.',
    description: 'Professional signage with a premium feel for offices, residences, shops and reception areas.',
    features: ['Modern styling', 'Custom sizes', 'Durable finish'],
  },
  {
    id: 'packaging-printing',
    name: 'Packaging Printing',
    category: 'signage',
    price: 799,
    emoji: '📦',
    short: 'Custom cartons, labels and wraps for product presentation.',
    description: 'Beautiful packaging and product wraps to elevate product presentation and brand trust.',
    features: ['Retail packaging', 'Label printing', 'Custom sizing'],
  },
  {
    id: 'gift-box-printing',
    name: 'Gift Box Printing',
    category: 'gift',
    price: 349,
    emoji: '🎁',
    short: 'Personalized gift packaging for birthdays, weddings and events.',
    description: 'Premium gift boxes for events, weddings, festive gifting and corporate packing.',
    features: ['Custom design', 'Festive styles', 'Protective finish'],
  },
];

const translations = {
  en: {
    title: 'Amit Bharti Flex & Printing',
    toplineMain: 'YOUR IDEAS. BEAUTIFULLY PRINTED.',
    toplineLocation: 'Station Road · Jalaun, U.P.',
    brandTag: 'FLEX & PRINTING',
    navShop: 'Shop all prints',
    navTemplates: 'Templates',
    navServices: 'Our services',
    navVisit: 'Visit our shop',
    changeLanguage: 'Language',
    langPromptEyebrow: 'WELCOME',
    langTitle: 'Choose your language',
    langSubtitle: 'Select your preferred language to continue.',
    continueBtn: 'Continue',
    heroEyebrow: 'A LITTLE INK. A BIG IMPRESSION.',
    heroLine1: 'Think it.',
    heroLine2: 'Print it.',
    heroLine3: 'Make it yours.',
    heroLead: 'From a visiting card to a whole shopfront. Custom printing for every idea, occasion and business.',
    heroPrimaryBtn: 'Find your print',
    heroSecondaryBtn: 'Request a quote',
    productsEyebrow: 'OUR POPULAR PRINTS',
    productsTitle: 'Everything you need to stand out.',
    servicesEyebrow: 'HOW WE WORK',
    servicesTitle: 'Fast, local and made around your needs.',
  },
  hi: {
    title: 'अमित भारती फ्लेक्स एंड प्रिंटिंग',
    toplineMain: 'आपके विचार। सुंदर प्रिंट।',
    toplineLocation: 'स्टेशन रोड · जालौन, उ.प्र.',
    brandTag: 'फ्लेक्स और प्रिंटिंग',
    navShop: 'सभी प्रिंट देखें',
    navTemplates: 'टेम्पलेट',
    navServices: 'हमारी सेवाएं',
    navVisit: 'हमारे दुकान पर जाएँ',
    changeLanguage: 'भाषा',
    langPromptEyebrow: 'स्वागत है',
    langTitle: 'अपनी भाषा चुनें',
    langSubtitle: 'आगे बढ़ने के लिए अपनी पसंदीदा भाषा चुनें।',
    continueBtn: 'जारी रखें',
    heroEyebrow: 'थोड़ी स्याही। बड़ी छाप।',
    heroLine1: 'सोचिए।',
    heroLine2: 'प्रिंट कीजिए।',
    heroLine3: 'अपना बनाइए।',
    heroLead: 'व्यवसाय कार्ड से लेकर दुकान की सजावट तक। हर विचार, अवसर और व्यवसाय के लिए कस्टम प्रिंटिंग।',
    heroPrimaryBtn: 'अपना प्रिंट चुनें',
    heroSecondaryBtn: 'कोट मांगें',
    productsEyebrow: 'हमारे लोकप्रिय प्रिंट',
    productsTitle: 'अपने आपको अलग दिखाने के लिए सब कुछ।',
    servicesEyebrow: 'हम कैसे काम करते हैं',
    servicesTitle: 'तेज़, स्थानीय और आपकी ज़रूरतों के अनुसार।',
  },
  bn: {
    title: 'অমিত ভরতি ফ্লেক্স অ্যান্ড প্রিন্টিং',
    toplineMain: 'আপনার ধারণা। সুন্দর প্রিন্ট।',
    toplineLocation: 'স্টেশন রোড · জালাউন, উ.প্র.',
    brandTag: 'ফ্লেক্স ও প্রিন্টিং',
    navShop: 'সব প্রিন্ট দেখুন',
    navTemplates: 'টেমপ্লেট',
    navServices: 'আমাদের পরিষেবা',
    navVisit: 'আমাদের দোকানে যান',
    changeLanguage: 'ভাষা',
    langPromptEyebrow: 'স্বাগতম',
    langTitle: 'আপনার ভাষা নির্বাচন করুন',
    langSubtitle: 'চালিয়ে যেতে আপনার পছন্দের ভাষা নির্বাচন করুন।',
    continueBtn: 'চালিয়ে যান',
    heroEyebrow: 'একটু কালি। বড় প্রভাব।',
    heroLine1: 'চিন্তা করুন।',
    heroLine2: 'প্রিন্ট করুন।',
    heroLine3: 'নিজের করুন।',
    heroLead: 'ব্যবসায়িক কার্ড থেকে শপফ্রন্ট পর্যন্ত। প্রতিটি ধারণা, অনুষ্ঠান এবং ব্যবসার জন্য কাস্টম প্রিন্টিং।',
    heroPrimaryBtn: 'আপনার প্রিন্ট খুঁজুন',
    heroSecondaryBtn: 'কোটা চাই',
    productsEyebrow: 'আমাদের জনপ্রিয় প্রিন্ট',
    productsTitle: 'নিজেকে আলাদা করতে সবকিছু।',
    servicesEyebrow: 'আমরা কীভাবে কাজ করি',
    servicesTitle: 'দ্রুত, স্থানীয় এবং আপনার চাহিদা অনুযায়ী।',
  },
  mr: {
    title: 'अमित भारती फ्लेक्स अँड प्रिंटिंग',
    toplineMain: 'तुमचे विचार. सुंदर प्रिंट.',
    toplineLocation: 'स्टेशन रोड · जालौन, उ.प्र.',
    brandTag: 'फ्लेक्स आणि प्रिंटिंग',
    navShop: 'सर्व प्रिंट्स',
    navTemplates: 'टेम्पलेट',
    navServices: 'आमची सेवा',
    navVisit: 'दुकानवर जा',
    changeLanguage: 'मराठी',
    langPromptEyebrow: 'स्वागत',
    langTitle: 'तुमची भाषा निवडा',
    langSubtitle: 'सुरू करण्यासाठी आपली आवडती भाषा निवडा.',
    continueBtn: 'पुढे जा',
    heroEyebrow: 'थोडी शाई. मोठा प्रभाव.',
    heroLine1: 'विचारा.',
    heroLine2: 'प्रिंट करा.',
    heroLine3: 'आपली बनवा.',
    heroLead: 'बिझनेस कार्डपासून शॉपफ्रंटपर्यंत. प्रत्येक कल्पना, कार्यक्रम आणि व्यवसायासाठी कस्टम प्रिंटिंग.',
    heroPrimaryBtn: 'तुमचा प्रिंट निवडा',
    heroSecondaryBtn: 'कोट मागा',
    productsEyebrow: 'आमच्या लोकप्रिय प्रिंट्स',
    productsTitle: 'तुम्हाला वेगळं बनवण्यासाठी सर्वकाही.',
    servicesEyebrow: 'आम्ही कसे काम करतो',
    servicesTitle: 'त्वरित, स्थानिक आणि तुमच्या गरजेनुसार.',
  }
};

const CART_KEY = 'amitBhartiCart';
const langButtons = document.querySelectorAll('.lang-option');
const modal = document.getElementById('languageModal');
const continueBtn = document.getElementById('continueBtn');
const langToggle = document.getElementById('langToggle');
const filterButtons = document.querySelectorAll('.filter-btn');
const products = document.querySelectorAll('.product-card');
const quoteForm = document.getElementById('quoteForm');
const quoteMessage = quoteForm?.querySelector('textarea');
const authModal = document.getElementById('authModal');
const authTitle = document.getElementById('authTitle');
const authForm = document.getElementById('authForm');
const switchAuthMode = document.getElementById('switchAuthMode');
const templateButtons = document.querySelectorAll('[data-template-btn]');

function formatCurrency(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function deriveProductMessage(productName, quantity = 1) {
  return `Hi Amit Bharti, I want to order ${quantity} ${productName}. Please share pricing, delivery timing, and artwork details.`;
}

function openWhatsApp(message) {
  const url = `https://wa.me/919999999999?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function addToCart(productId, quantity = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    const product = PRODUCT_CATALOG.find((entry) => entry.id === productId);
    if (!product) return;
    cart.push({ id: product.id, name: product.name, quantity, price: product.price });
  }

  saveCart(cart);
  alert('Item added to cart.');
}

function removeFromCart(productId) {
  const next = getCart().filter((item) => item.id !== productId);
  saveCart(next);
  renderCartPage();
}

function updateQuantity(productId, delta) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === productId);

  if (!item) return;

  item.quantity = Math.max(1, item.quantity + delta);
  saveCart(cart);
  renderCartPage();
}

function updateCartBadge() {
  const countElements = document.querySelectorAll('[data-cart-count]');
  const total = getCart().reduce((sum, item) => sum + item.quantity, 0);
  countElements.forEach((element) => {
    element.textContent = String(total);
  });
}

function setLanguage(lang) {
  const selected = translations[lang] || translations.en;
  const allTextNodes = document.querySelectorAll('[data-i18n]');

  allTextNodes.forEach((element) => {
    const key = element.dataset.i18n;
    const value = selected[key];
    if (value) {
      element.textContent = value;
    }
  });

  document.documentElement.lang = lang;
  localStorage.setItem('preferredLanguage', lang);

  langButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.lang === lang);
  });
}

function openLanguageModal() {
  modal?.classList.remove('hidden');
}

function closeLanguageModal() {
  modal?.classList.add('hidden');
}

function buildProductCard(product) {
  return `
    <article class="product-card" data-category="${product.category}">
      <div class="product-icon">${product.emoji}</div>
      <h3>${product.name}</h3>
      <p>${product.short}</p>
      <div class="meta-row">
        <span>${formatCurrency(product.price)}</span>
        <div class="meta-actions">
          <a class="small-link" href="product.html?product=${product.id}">Details</a>
          <button class="small-link" type="button" data-product="${product.name}">Quote</button>
          <button class="button small ghost" type="button" data-add-cart="${product.id}">Add</button>
        </div>
      </div>
    </article>
  `;
}

function renderHomeProducts() {
  const grid = document.querySelector('[data-product-grid]');
  if (!grid) return;

  const items = PRODUCT_CATALOG.map(buildProductCard).join('');
  grid.innerHTML = items;

  bindQuoteButtons();
  bindAddCartButtons();
}

function renderProductsPage() {
  const grid = document.querySelector('[data-all-products]');
  if (!grid) return;
  grid.innerHTML = PRODUCT_CATALOG.map(buildProductCard).join('');
  bindQuoteButtons();
  bindAddCartButtons();

  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
      document.querySelectorAll('[data-all-products] .product-card').forEach((card) => {
        const shouldShow = filter === 'all' || card.dataset.category === filter;
        card.style.display = shouldShow ? 'flex' : 'none';
      });
    });
  });
}

function renderProductDetailPage() {
  const detailSection = document.querySelector('[data-product-detail]');
  if (!detailSection) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('product');
  const product = PRODUCT_CATALOG.find((entry) => entry.id === productId) || PRODUCT_CATALOG[0];

  detailSection.innerHTML = `
    <div class="detail-layout">
      <div class="product-showcase">
        <div class="product-visual">${product.emoji}</div>
      </div>
      <div class="detail-content">
        <div class="eyebrow">CUSTOM PRINT</div>
        <h1>${product.name}</h1>
        <p class="detail-price">${formatCurrency(product.price)}</p>
        <p>${product.description}</p>
        <ul class="feature-list">
          ${product.features.map((feature) => `<li>${feature}</li>`).join('')}
        </ul>
        <div class="detail-actions">
          <button class="button" type="button" data-add-cart="${product.id}">Add to cart</button>
          <button class="button secondary" type="button" data-product="${product.name}">Request quote</button>
          <button class="button secondary" type="button" data-whatsapp="${product.name}">WhatsApp order</button>
        </div>
      </div>
    </div>
  `;

  bindQuoteButtons();
  bindAddCartButtons();
  bindWhatsAppButtons();
}

function renderCartPage() {
  const cartRoot = document.querySelector('[data-cart-page]');
  if (!cartRoot) return;

  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  if (!cart.length) {
    cartRoot.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Pick a product to start your custom print order.</p>
        <a href="products.html" class="button">Browse products</a>
      </div>
    `;
    return;
  }

  cartRoot.innerHTML = `
    <div class="cart-layout">
      <div class="cart-items">
        ${cart.map((item) => {
          const product = PRODUCT_CATALOG.find((entry) => entry.id === item.id);
          return `
            <div class="cart-item">
              <div class="cart-item-icon">${product?.emoji || '📦'}</div>
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
          `;
        }).join('')}
      </div>
      <aside class="cart-summary">
        <h3>Order summary</h3>
        <div class="summary-row"><span>Items</span><strong>${totalItems}</strong></div>
        <div class="summary-row"><span>Total</span><strong>${formatCurrency(totalCost)}</strong></div>
        <button class="button" type="button" data-cart-whatsapp>Order on WhatsApp</button>
        <a class="button secondary" href="products.html">Continue shopping</a>
      </aside>
    </div>
  `;

  document.querySelectorAll('[data-cart-plus]').forEach((button) => {
    button.addEventListener('click', () => updateQuantity(button.dataset.cartPlus, 1));
  });

  document.querySelectorAll('[data-cart-minus]').forEach((button) => {
    button.addEventListener('click', () => updateQuantity(button.dataset.cartMinus, -1));
  });

  document.querySelectorAll('[data-cart-remove]').forEach((button) => {
    button.addEventListener('click', () => removeFromCart(button.dataset.cartRemove));
  });

  const whatsappButton = document.querySelector('[data-cart-whatsapp]');
  whatsappButton?.addEventListener('click', () => {
    const items = getCart();
    const summary = items.map((item) => `${item.quantity} x ${item.name}`).join(', ');
    openWhatsApp(`Hi Amit Bharti, I want to place the following order: ${summary}. Please confirm pricing and delivery.`);
  });
}

function bindAddCartButtons() {
  document.querySelectorAll('[data-add-cart]').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.dataset.addCart;
      addToCart(productId, 1);
    });
  });
}

function bindQuoteButtons() {
  document.querySelectorAll('[data-product]').forEach((button) => {
    button.addEventListener('click', () => {
      const productName = button.dataset.product || 'this product';
      const section = document.getElementById('quote');
      const productSelect = document.getElementById('productSelect');

      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (productSelect) productSelect.value = productName;

      if (quoteMessage) {
        quoteMessage.value = `I want a quote for ${productName}. Please contact me with pricing and details.`;
        quoteMessage.focus();
      }
    });
  });
}

function bindWhatsAppButtons() {
  document.querySelectorAll('[data-whatsapp]').forEach((button) => {
    button.addEventListener('click', () => {
      const productName = button.dataset.whatsapp || 'custom print';
      openWhatsApp(deriveProductMessage(productName, 1));
    });
  });
}

templateButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const template = button.dataset.templateBtn;
    const templateSelect = document.getElementById('templateSelect');
    const section = document.getElementById('quote');

    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (templateSelect && template) templateSelect.value = template;

    if (quoteMessage) {
      quoteMessage.value = `I want to use the ${template} template for my print order.`;
      quoteMessage.focus();
    }
  });
});

quoteForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(quoteForm);
  const name = formData.get('name')?.toString().trim() || 'Customer';
  const product = formData.get('product')?.toString().trim() || 'custom print';

  alert(`Thanks ${name}! Your enquiry for ${product} has been received. We will contact you shortly.`);
  quoteForm.reset();

  const productSelect = document.getElementById('productSelect');
  if (productSelect) productSelect.value = '';
});

document.querySelectorAll('[data-open-auth]').forEach((button) => {
  button.addEventListener('click', () => {
    const mode = button.dataset.openAuth === 'signup' ? 'signup' : 'login';
    authModal?.classList.remove('hidden');
    authTitle.textContent = mode === 'signup' ? 'Create your account' : 'Login to your account';
    switchAuthMode.textContent = mode === 'signup' ? 'Already have an account?' : 'Create account';
    authForm.setAttribute('data-mode', mode);
  });
});

document.querySelector('[data-close-auth="true"]')?.addEventListener('click', () => {
  authModal?.classList.add('hidden');
});

authModal?.addEventListener('click', (event) => {
  if (event.target === authModal) authModal.classList.add('hidden');
});

switchAuthMode?.addEventListener('click', () => {
  const mode = authForm.getAttribute('data-mode') === 'signup' ? 'signup' : 'login';
  const nextMode = mode === 'signup' ? 'login' : 'signup';
  authTitle.textContent = nextMode === 'signup' ? 'Create your account' : 'Login to your account';
  switchAuthMode.textContent = nextMode === 'signup' ? 'Already have an account?' : 'Create account';
  authForm.setAttribute('data-mode', nextMode);
});

authForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const mode = authForm.getAttribute('data-mode') === 'signup' ? 'signup' : 'login';
  const emailInput = document.getElementById('authEmail');
  const email = emailInput?.value || 'customer';

  alert(mode === 'signup' ? `Account created for ${email}. You can now start your custom print order.` : `Welcome back ${email}! Your account is ready.`);
  authForm.reset();
  authModal?.classList.add('hidden');
});

const savedLang = localStorage.getItem('preferredLanguage') || 'en';
setLanguage(savedLang);

if (!localStorage.getItem('preferredLanguage')) {
  openLanguageModal();
}

langButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setLanguage(button.dataset.lang);
  });
});

continueBtn?.addEventListener('click', () => {
  closeLanguageModal();
});

langToggle?.addEventListener('click', () => {
  openLanguageModal();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
    document.querySelectorAll('.product-card').forEach((card) => {
      const shouldShow = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !shouldShow);
    });
  });
});

renderHomeProducts();
renderProductsPage();
renderProductDetailPage();
renderCartPage();
updateCartBadge();
