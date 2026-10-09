// Bingo Tour & Travels Interactive Scripts

document.addEventListener('DOMContentLoaded', () => {
  // Clean up any legacy sensitive lead data stored in LocalStorage
  try {
    localStorage.removeItem('bingo_leads');
  } catch (err) {}

  // 1. Mobile Hamburger Navigation Toggle
  const burgerToggle = document.getElementById('burgerToggle');
  const navMenu = document.getElementById('navMenu');

  if (burgerToggle && navMenu) {
    burgerToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = burgerToggle.querySelector('i');
      if (icon) {
        icon.className = navMenu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
      }
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = burgerToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      });
    });
  }

  // 2. Photo Slider Logic (Hero Showcase with Pill Overlay)
  const slideItems = document.querySelectorAll('.slide-item');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');

  if (slideItems.length > 0) {
    let currentSlide = 0;
    let slideInterval = null;

    function showSlide(index) {
      currentSlide = (index + slideItems.length) % slideItems.length;
      slideItems.forEach((item, idx) => {
        item.classList.toggle('active', idx === currentSlide);
      });
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlide);
      });
    }

    function startAutoSlide() {
      slideInterval = setInterval(() => {
        showSlide(currentSlide + 1);
      }, 4500);
    }

    function resetAutoSlide() {
      if (slideInterval) clearInterval(slideInterval);
      startAutoSlide();
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
        resetAutoSlide();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
        resetAutoSlide();
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        showSlide(idx);
        resetAutoSlide();
      });
    });

    startAutoSlide();
  }

  // 3. Destinations Search Feature (Keyword, Gate, Dwar, Murti & Attractions)
  const destSearchInput = document.getElementById('destSearchInput');
  if (destSearchInput) {
    destSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const destCards = document.querySelectorAll('.dest-card');
      const stateBlocks = document.querySelectorAll('.state-block');

      destCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(query) || query === '') {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });

      stateBlocks.forEach(block => {
        const visibleCards = block.querySelectorAll('.dest-card[style="display: flex;"]');
        const stateTitle = block.querySelector('.state-title-bar')?.textContent.toLowerCase() || '';
        if (visibleCards.length > 0 || stateTitle.includes(query) || query === '') {
          block.style.display = 'block';
          if (stateTitle.includes(query) && query !== '') {
            block.querySelectorAll('.dest-card').forEach(c => c.style.display = 'flex');
          }
        } else {
          block.style.display = 'none';
        }
      });
    });
  }

  // 4. Tour Gallery Dynamic Filter & Load
  const galleryGrid = document.getElementById('galleryGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  function sanitizeUrl(url) {
    if (!url) return '';
    const trimmed = String(url).trim();
    if (/^(javascript|data|vbscript):/i.test(trimmed)) {
      return '#';
    }
    return trimmed;
  }

  function renderGallery(items) {
    if (!galleryGrid) return;
    galleryGrid.textContent = '';

    const fragment = document.createDocumentFragment();
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'gallery-card';

      const imgContainer = document.createElement('div');
      imgContainer.className = 'gallery-img-container';

      const img = document.createElement('img');
      img.src = sanitizeUrl(item.src);
      img.alt = item.title || '';
      img.setAttribute('loading', 'lazy');

      const badge = document.createElement('span');
      badge.className = 'gallery-card-badge';
      badge.textContent = item.category || '';

      const cust = document.createElement('span');
      cust.className = 'gallery-card-cust';
      const icon = document.createElement('i');
      icon.className = 'fas fa-user-friends';
      cust.appendChild(icon);
      cust.appendChild(document.createTextNode(` ${item.customers} Guests`));

      imgContainer.appendChild(img);
      imgContainer.appendChild(badge);
      imgContainer.appendChild(cust);

      const info = document.createElement('div');
      info.className = 'gallery-info';

      const h4 = document.createElement('h4');
      h4.textContent = item.title || '';

      const p = document.createElement('p');
      p.textContent = item.desc || '';

      info.appendChild(h4);
      info.appendChild(p);

      card.appendChild(imgContainer);
      card.appendChild(info);

      fragment.appendChild(card);
    });

    galleryGrid.appendChild(fragment);
  }

  if (galleryGrid) {
    fetch('assets/tours_data.json')
      .then(res => res.json())
      .then(data => {
        renderGallery(data);

        filterBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            if (filter === 'all') {
              renderGallery(data);
            } else {
              const filtered = data.filter(item => item.category.toLowerCase().includes(filter.toLowerCase()));
              renderGallery(filtered);
            }
          });
        });
      })
      .catch(err => console.error('Gallery load error:', err));
  }

  // 5. WhatsApp Booking Forms Handling
  const bookingForms = document.querySelectorAll('form.lead-form, form#quickBookingForm');
  bookingForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = form.querySelector('[id*="Name"]') || form.querySelector('input[type="text"]');
      const phoneInput = form.querySelector('[id*="Phone"]') || form.querySelector('input[type="tel"]');
      const tourInput = form.querySelector('[id*="Tour"]') || form.querySelector('select[name="tour"]');
      const vehicleInput = form.querySelector('[id*="Vehicle"]') || form.querySelector('select[name="vehicle"]');
      const guestsInput = form.querySelector('[id*="Guests"]');
      const dateInput = form.querySelector('[id*="Date"]');
      const messageInput = form.querySelector('textarea');

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const tour = tourInput ? tourInput.value : 'General Inquiry';
      const vehicle = vehicleInput ? vehicleInput.value : 'Any Suitable Vehicle';
      const guests = guestsInput ? guestsInput.value : 'Flexible';
      const date = dateInput ? dateInput.value : 'Flexible';
      const userMsg = messageInput ? messageInput.value.trim() : '';

      let text = `*New Booking Inquiry - Bingo Tour & Travels*%0A%0A` +
        `👤 *Name:* ${encodeURIComponent(name)}%0A` +
        `📞 *Phone:* ${encodeURIComponent(phone)}%0A` +
        `📍 *Destination / Service:* ${encodeURIComponent(tour)}%0A` +
        `🚗 *Vehicle Preferred:* ${encodeURIComponent(vehicle)}%0A` +
        `👥 *Passengers:* ${encodeURIComponent(guests)}%0A` +
        `📅 *Travel Date:* ${encodeURIComponent(date || 'Flexible')}`;

      if (userMsg) {
        text += `%0A💬 *Message:* ${encodeURIComponent(userMsg)}`;
      }

      text += `%0A%0APlease share quote & itinerary details.`;

      const waUrl = `https://wa.me/918058985804?text=${text}`;

      window.open(waUrl, '_blank', 'noopener,noreferrer');
      alert(`Thank you ${name}! Opening WhatsApp to connect directly with Owner Jyotiram.`);
      form.reset();
    });
  });
});
