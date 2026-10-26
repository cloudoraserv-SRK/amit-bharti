(function () {
  function validItems(items) {
    return (items || []).map((item) => {
      try {
        const url = new URL(item.url, window.location.href);
        return ['http:', 'https:'].includes(url.protocol) ? { url: url.href, alt: item.alt || '' } : null;
      } catch (_error) {
        return null;
      }
    }).filter(Boolean);
  }

  function render(root, items, options = {}) {
    if (!root) return;
    const slides = validItems(items);
    root.replaceChildren();
    root.className = `image-gallery ${options.className || ''}`.trim();
    if (!slides.length) return;

    let activeIndex = 0;
    const image = document.createElement('img');
    image.className = 'image-gallery-slide';
    image.loading = 'lazy';
    image.alt = slides[0].alt;
    image.src = slides[0].url;
    if (options.href) {
      const imageLink = document.createElement('a');
      imageLink.className = 'image-gallery-image-link';
      imageLink.href = options.href;
      imageLink.setAttribute('aria-label', options.linkLabel || 'Open details');
      imageLink.append(image);
      root.append(imageLink);
    } else {
      root.append(image);
    }

    const update = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      image.src = slides[activeIndex].url;
      image.alt = slides[activeIndex].alt;
      dots.querySelectorAll('button').forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === activeIndex);
        dot.setAttribute('aria-current', String(dotIndex === activeIndex));
      });
      root.dataset.activeSlide = String(activeIndex);
    };

    if (slides.length > 1) {
      const previous = document.createElement('button');
      previous.type = 'button';
      previous.className = 'image-gallery-arrow previous';
      previous.setAttribute('aria-label', 'Show previous image');
      previous.textContent = '‹';
      previous.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        update(activeIndex - 1);
      });
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'image-gallery-arrow next';
      next.setAttribute('aria-label', 'Show next image');
      next.textContent = '›';
      next.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        update(activeIndex + 1);
      });
      root.append(previous, next);

      const dots = document.createElement('div');
      dots.className = 'image-gallery-dots';
      slides.forEach((slide, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Show image ${index + 1}`);
        dot.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          update(index);
        });
        dots.append(dot);
      });
      root.append(dots);

      if (options.thumbnails) {
        const thumbnails = document.createElement('div');
        thumbnails.className = 'image-gallery-thumbnails';
        slides.forEach((slide, index) => {
          const thumbnail = document.createElement('button');
          thumbnail.type = 'button';
          thumbnail.setAttribute('aria-label', `View image ${index + 1}`);
          const thumbImage = document.createElement('img');
          thumbImage.src = slide.url;
          thumbImage.alt = slide.alt;
          thumbImage.loading = 'lazy';
          thumbnail.append(thumbImage);
          thumbnail.addEventListener('click', () => update(index));
          thumbnails.append(thumbnail);
        });
        root.append(thumbnails);
      }
    }
    root.dataset.activeSlide = '0';
  }

  window.ABImageGallery = { render };
})();
