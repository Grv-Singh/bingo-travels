// Bingo Tour & Travels Interactive Scripts

document.addEventListener('DOMContentLoaded', () => {
  // Clean up any legacy sensitive lead data stored in LocalStorage
  try {
    localStorage.removeItem('bingo_leads');
  } catch (err) {}

  // 1. Car 360 Turntable Logic
  const carImg = document.getElementById('carDisplayImg');
  const angleBtns = document.querySelectorAll('.angle-btn');
  const autoRotateBtn = document.getElementById('autoRotateBtn');

  const angles = [
    { name: 'front', src: 'assets/images/car_front.png', label: 'Front View' },
    { name: 'right', src: 'assets/images/car_right.png', label: 'Right Profile' },
    { name: 'rear', src: 'assets/images/car_rear.png', label: 'Rear View' },
    { name: 'left', src: 'assets/images/car_left.png', label: 'Left Profile' }
  ];

  let currentAngleIdx = 0;
  let autoRotateInterval = null;

  function setCarAngle(index) {
    currentAngleIdx = (index + angles.length) % angles.length;
    carImg.style.opacity = '0';
    setTimeout(() => {
      carImg.src = angles[currentAngleIdx].src;
      carImg.alt = angles[currentAngleIdx].label;
      carImg.style.opacity = '1';
    }, 150);

    angleBtns.forEach((btn, idx) => {
      if (idx === currentAngleIdx) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  angleBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      stopAutoRotate();
      setCarAngle(idx);
    });
  });

  function startAutoRotate() {
    autoRotateInterval = setInterval(() => {
      setCarAngle(currentAngleIdx + 1);
    }, 2200);
    autoRotateBtn.classList.add('spinning');
    autoRotateBtn.innerHTML = '<i class="fas fa-pause"></i> Pause 360°';
  }

  function stopAutoRotate() {
    if (autoRotateInterval) {
      clearInterval(autoRotateInterval);
      autoRotateInterval = null;
    }
    autoRotateBtn.classList.remove('spinning');
    autoRotateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Auto Rotate';
  }

  autoRotateBtn.addEventListener('click', () => {
    if (autoRotateInterval) {
      stopAutoRotate();
    } else {
      startAutoRotate();
    }
  });

  // Start auto-rotate on load
  startAutoRotate();

  // 2. Gallery Filter & Dynamic Rendering
  const galleryGrid = document.getElementById('galleryGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');

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

  // 3. Lead Booking Form to WhatsApp
  const bookingForm = document.getElementById('quickBookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('leadName').value.trim();
      const phone = document.getElementById('leadPhone').value.trim();
      const tour = document.getElementById('leadTour').value;
      const date = document.getElementById('leadDate').value;
      const guests = document.getElementById('leadGuests').value;

      const message = `*New Booking Inquiry - Bingo Tour & Travels*%0A%0A` +
        `👤 *Name:* ${encodeURIComponent(name)}%0A` +
        `📞 *Phone:* ${encodeURIComponent(phone)}%0A` +
        `📍 *Package / Destination:* ${encodeURIComponent(tour)}%0A` +
        `📅 *Travel Date:* ${encodeURIComponent(date || 'Flexible')}%0A` +
        `👥 *Guests:* ${encodeURIComponent(guests)}%0A` +
        `🚗 *Vehicle:* Toyota Innova 2.5 GX (RJ14 UE 1517)%0A%0A` +
        `Please share the best quote and itinerary.`;

      const waUrl = `https://wa.me/918058985804?text=${message}`;

      // Open WhatsApp
      window.open(waUrl, '_blank');
      alert(`Thank you ${name}! Opening WhatsApp to connect with Jyotiram directly.`);
      bookingForm.reset();
    });
  }

  // 4. Modal for RC Verification
  const rcModal = document.getElementById('rcModal');
  const viewRcBtn = document.getElementById('viewRcBtn');
  const closeRcModal = document.getElementById('closeRcModal');

  if (viewRcBtn && rcModal) {
    viewRcBtn.addEventListener('click', () => {
      rcModal.classList.add('active');
    });
  }
  if (closeRcModal && rcModal) {
    closeRcModal.addEventListener('click', () => {
      rcModal.classList.remove('active');
    });
  }
  if (rcModal) {
    rcModal.addEventListener('click', (e) => {
      if (e.target === rcModal) rcModal.classList.remove('active');
    });
  }
});
