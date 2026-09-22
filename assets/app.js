// Bingo Tour Interactive Scripts

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Burger Navigation Menu Toggle
  const burgerToggle = document.getElementById('burgerToggle');
  const navMenu = document.getElementById('navMenu');

  if (burgerToggle && navMenu) {
    burgerToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = burgerToggle.querySelector('i');
      if (icon) {
        if (navMenu.classList.contains('active')) {
          icon.className = 'fas fa-times';
        } else {
          icon.className = 'fas fa-bars';
        }
      }
    });

    // Close menu on link click
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = burgerToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      });
    });
  }

  // 2. Photo Slider Logic (Hero / Photo Showcase)
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
        if (idx === currentSlide) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
      dots.forEach((dot, idx) => {
        if (idx === currentSlide) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    function startAutoSlide() {
      slideInterval = setInterval(() => {
        showSlide(currentSlide + 1);
      }, 4000);
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

  // 3. Destinations Search Feature
  const destSearchInput = document.getElementById('destSearchInput');
  if (destSearchInput) {
    destSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const destCards = document.querySelectorAll('.dest-card');
      const stateBlocks = document.querySelectorAll('.state-block');

      destCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(query)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });

      // Show/hide state blocks based on whether any card inside is visible
      stateBlocks.forEach(block => {
        const visibleCards = block.querySelectorAll('.dest-card[style="display: flex;"]');
        const stateTitle = block.querySelector('.state-title-bar').textContent.toLowerCase();
        if (visibleCards.length > 0 || stateTitle.includes(query) || query === '') {
          block.style.display = 'block';
          if (stateTitle.includes(query)) {
            // Show all cards in this state if state matches
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

  function renderGallery(items) {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = items.map(item => `
      <div class="gallery-card">
        <div class="gallery-img-container">
          <img src="${item.src}" alt="${item.title}" loading="lazy">
          <span class="gallery-card-badge">${item.category}</span>
          <span class="gallery-card-cust"><i class="fas fa-user-friends"></i> ${item.customers} Guests</span>
        </div>
        <div class="gallery-info">
          <h4>${item.title}</h4>
          <p>${item.desc}</p>
        </div>
      </div>
    `).join('');
  }

  // 5. WhatsApp Booking Forms Handling
  const bookingForms = document.querySelectorAll('form.lead-form');
  bookingForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = form.querySelector('[id*="Name"]') || form.querySelector('input[type="text"]');
      const phoneInput = form.querySelector('[id*="Phone"]') || form.querySelector('input[type="tel"]');
      const tourInput = form.querySelector('[id*="Tour"]') || form.querySelector('select');
      const guestsInput = form.querySelector('[id*="Guests"]');
      const dateInput = form.querySelector('[id*="Date"]');
      const vehicleInput = form.querySelector('[id*="Vehicle"]');
      const messageInput = form.querySelector('textarea');

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const tour = tourInput ? tourInput.value : '';
      const guests = guestsInput ? guestsInput.value : 'Flexible';
      const date = dateInput ? dateInput.value : 'Flexible';
      const vehicle = vehicleInput ? vehicleInput.value : 'Any Suitable Vehicle';
      const userMsg = messageInput ? messageInput.value.trim() : '';

      let text = `*New Booking Inquiry - Bingo Tour*%0A%0A` +
        `👤 *Name:* ${encodeURIComponent(name)}%0A` +
        `📞 *Phone:* ${encodeURIComponent(phone)}%0A` +
        `📍 *Destination / Tour:* ${encodeURIComponent(tour)}%0A` +
        `🚗 *Preferred Vehicle:* ${encodeURIComponent(vehicle)}%0A` +
        `👥 *Passengers:* ${encodeURIComponent(guests)}%0A` +
        `📅 *Travel Date:* ${encodeURIComponent(date || 'Flexible')}`;

      if (userMsg) {
        text += `%0A💬 *Message:* ${encodeURIComponent(userMsg)}`;
      }

      text += `%0A%0APlease share quote & itinerary details.`;

      const waUrl = `https://wa.me/918058985804?text=${text}`;

      // Save lead locally
      try {
        const leads = JSON.parse(localStorage.getItem('bingo_leads') || '[]');
        leads.push({ name, phone, tour, date, guests, vehicle, timestamp: new Date().toISOString() });
        localStorage.setItem('bingo_leads', JSON.stringify(leads));
      } catch (err) {}

      window.open(waUrl, '_blank');
      alert(`Thank you ${name}! Opening WhatsApp to connect with Jyotiram (Owner) directly.`);
      form.reset();
    });
  });
});
