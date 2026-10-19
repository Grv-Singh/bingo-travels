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
      const icon = burgerToggle.querySelector('.material-symbols-rounded, i');
      if (icon) {
        icon.textContent = navMenu.classList.contains('active') ? 'close' : 'menu';
      }
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = burgerToggle.querySelector('.material-symbols-rounded, i');
        if (icon) icon.textContent = 'menu';
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

  // 6. Interactive Visual Fare Estimator (Inspired by Savaari / Rajputana Cabs)
  const calcTabs = document.querySelectorAll('.calc-tab-btn');
  const calcRouteSelect = document.getElementById('calcRouteSelect');
  const calcRouteLabel = document.getElementById('calcRouteLabel');
  const calcVehOptions = document.querySelectorAll('.calc-veh-option');
  const calcPriceDisplay = document.getElementById('calcPriceDisplay');
  const calcDescDisplay = document.getElementById('calcDescDisplay');
  const calcWaBtn = document.getElementById('calcWaBtn');

  if (calcRouteSelect && calcPriceDisplay) {
    let currentTrip = 'oneway';
    let currentVeh = 'sedan';

    const routeData = {
      oneway: [
        { val: 'jaipur-delhi', label: 'Jaipur to Delhi / IGI Airport', sedan: 4200, suv: 6000, premium: 6800, tempo: 8500, desc: '260 km • ~4.5 hrs direct drop' },
        { val: 'jaipur-agra', label: 'Jaipur to Agra (Taj Mahal)', sedan: 3800, suv: 5500, premium: 6300, tempo: 7800, desc: '240 km • ~4 hrs direct drop' },
        { val: 'jaipur-ajmer', label: 'Jaipur to Ajmer / Pushkar', sedan: 2600, suv: 3800, premium: 4400, tempo: 5500, desc: '145 km • ~2.5 hrs direct drop' },
        { val: 'jaipur-khatu', label: 'Jaipur to Khatu Shyam Ji / Salasar', sedan: 2500, suv: 3600, premium: 4200, tempo: 5200, desc: '120 km • ~2 hrs direct drop' },
        { val: 'jaipur-udaipur', label: 'Jaipur to Udaipur (Lake City)', sedan: 6500, suv: 9000, premium: 10500, tempo: 13500, desc: '395 km • ~6.5 hrs direct drop' },
        { val: 'jaipur-kota', label: 'Jaipur to Kota', sedan: 3800, suv: 5400, premium: 6200, tempo: 7900, desc: '250 km • ~4 hrs direct drop' }
      ],
      outstation: [
        { val: '2day-rajasthan', label: '2 Days Outstation (Min 500 km)', sedan: 5500, suv: 8000, premium: 9000, tempo: 13200, desc: '₹11/km (Sedan), ₹16/km (SUV) • 250km/day min' },
        { val: '3day-udaipur', label: '3 Days Udaipur & Kumbhalgarh (Min 750 km)', sedan: 8250, suv: 12000, premium: 13500, tempo: 19800, desc: 'Complete 3-day return tour with fuel & driver' },
        { val: '5day-golden-triangle', label: '5 Days Golden Triangle (Delhi-Agra-Jaipur)', sedan: 14500, suv: 21000, premium: 24000, tempo: 33000, desc: 'Includes full interstate permit & highway drive' },
        { val: '8day-chardham', label: '8-10 Days Uttarakhand 4 Dham Yatra', sedan: 27500, suv: 40000, premium: 45000, tempo: 66000, desc: 'Kedarnath, Badrinath, Gangotri & Yamunotri package' }
      ],
      local: [
        { val: 'local-8-80', label: 'Full Day Sightseeing (8 Hours / 80 Km)', sedan: 2000, suv: 3000, premium: 3500, tempo: 5000, desc: 'Covers Amber Fort, Hawa Mahal, City Palace, Jal Mahal' },
        { val: 'local-12-120', label: 'Extended Sightseeing (12 Hours / 120 Km)', sedan: 2600, suv: 3800, premium: 4500, tempo: 6500, desc: 'Includes Nahargarh sunset, Chokhi Dhani evening tour' },
        { val: 'airport-transfer', label: 'Jaipur Airport Pickup / Drop Transfer', sedan: 800, suv: 1400, premium: 1800, tempo: 2500, desc: 'Punctual terminal pickup with luggage assistance' }
      ]
    };

    function updateOptions() {
      calcRouteSelect.textContent = '';
      const list = routeData[currentTrip] || routeData.oneway;
      list.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.val;
        opt.textContent = item.label;
        opt.dataset.sedan = item.sedan;
        opt.dataset.suv = item.suv;
        opt.dataset.premium = item.premium;
        opt.dataset.tempo = item.tempo;
        opt.dataset.desc = item.desc;
        calcRouteSelect.appendChild(opt);
      });
      calculate();
    }

    const vehImgMap = {
      sedan: 'assets/images/vehicles/sedan.png',
      suv: 'assets/images/vehicles/suv.png',
      premium: 'assets/images/vehicles/premium_suv.png',
      tempo: 'assets/images/vehicles/tempo.png'
    };

    function calculate() {
      const selected = calcRouteSelect.options[calcRouteSelect.selectedIndex];
      if (!selected) return;

      const desc = selected.dataset.desc || '';
      const routeText = selected.textContent;
      const vehNameMap = { sedan: 'AC Sedan (4 Seater)', suv: 'Family SUV (6-7 Seater)', premium: 'Premium SUV (VIP 7 Seater)', tempo: 'Tempo / Minibus (12-26 Seater)' };
      const vehLabel = vehNameMap[currentVeh] || currentVeh;

      const calcVehImg = document.getElementById('calcVehImg');
      if (calcVehImg && vehImgMap[currentVeh]) {
        calcVehImg.src = vehImgMap[currentVeh];
        calcVehImg.alt = vehLabel;
      }

      calcPriceDisplay.textContent = 'Best Rate Guaranteed';
      calcDescDisplay.textContent = `${routeText} • ${vehLabel} (${desc})`;

      const waMsg = encodeURIComponent(`Hi Jyotiram ji, I would like to check the best fare for:\n- Route: ${routeText}\n- Vehicle Type: ${vehLabel}\n- Detail: ${desc}\nPlease share the live rate & availability.`);
      if (calcWaBtn) {
        calcWaBtn.href = `https://wa.me/918058985804?text=${waMsg}`;
      }
    }

    calcTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        calcTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTrip = tab.dataset.trip;
        if (currentTrip === 'oneway') calcRouteLabel.innerHTML = '<i class="fas fa-map-marker-alt"></i> Select Route Destination';
        else if (currentTrip === 'outstation') calcRouteLabel.innerHTML = '<i class="fas fa-route"></i> Select Outstation Tour Duration';
        else calcRouteLabel.innerHTML = '<i class="fas fa-clock"></i> Select Local Sightseeing Package';
        updateOptions();
      });
    });

    calcVehOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        calcVehOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        currentVeh = opt.dataset.veh;
        calculate();
      });
    });

    calcRouteSelect.addEventListener('change', calculate);
    calculate();

    const heroBookingForm = document.getElementById('heroBookingForm');
    if (heroBookingForm) {
      heroBookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('calcName');
        const phoneInput = document.getElementById('calcPhone');
        const selected = calcRouteSelect.options[calcRouteSelect.selectedIndex];

        const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Guest';
        const phone = (phoneInput && phoneInput.value.trim()) ? phoneInput.value.trim() : 'Not provided';
        const routeText = selected ? selected.textContent : 'Jaipur Outstation';
        const desc = selected ? (selected.dataset.desc || '') : '';
        const vehNameMap = {
          sedan: 'AC Sedan (4 Seater)',
          suv: 'Family SUV (6-7 Seater)',
          premium: 'Premium SUV (VIP 7 Seater)',
          tempo: 'Tempo / Minibus (12-26 Seater)'
        };
        const vehLabel = vehNameMap[currentVeh] || currentVeh;

        const message = 
          `*New Taxi Booking Request - Bingo Tour & Travels*\n\n` +
          `• *Name:* ${name}\n` +
          `• *Phone / WhatsApp:* ${phone}\n` +
          `• *Route / Circuit:* ${routeText}\n` +
          `• *Vehicle Type:* ${vehLabel}\n` +
          `• *Details:* ${desc}\n\n` +
          `Hi Jyotiram ji, please confirm availability and best guaranteed fare.`;

        const waUrl = `https://wa.me/918058985804?text=${encodeURIComponent(message)}`;

        // Open WhatsApp directly without popup blockers
        window.open(waUrl, '_blank') || (window.location.href = waUrl);
      });
    }
  }
});
