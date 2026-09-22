/**
 * @jest-environment jsdom
 */

describe('Bingo Tour & Travels Interactive Scripts (app.js)', () => {
  let originalFetch;
  let mockToursData;

  beforeEach(() => {
    // Clear requirement cache so script runs freshly for each test
    jest.resetModules();

    // Reset DOM
    document.body.innerHTML = `
      <!-- 1. Car 360 Turntable Elements -->
      <img id="carDisplayImg" src="assets/images/car_front.png" alt="Toyota Innova Front View">
      <button class="angle-btn active" data-angle="0">Front</button>
      <button class="angle-btn" data-angle="1">Right Side</button>
      <button class="angle-btn" data-angle="2">Rear</button>
      <button class="angle-btn" data-angle="3">Left Side</button>
      <button class="btn-auto-rotate spinning" id="autoRotateBtn"><i class="fas fa-pause"></i> Pause 360°</button>

      <!-- 2. Gallery Filter & Dynamic Rendering Elements -->
      <div class="gallery-filter">
        <button class="filter-btn active" data-filter="all">All Photos</button>
        <button class="filter-btn" data-filter="Pilgrimage">Pilgrimage Yatras</button>
        <button class="filter-btn" data-filter="Jaipur">Jaipur Sightseeing</button>
      </div>
      <div class="gallery-grid" id="galleryGrid"></div>

      <!-- 3. Lead Booking Form Elements -->
      <form id="quickBookingForm">
        <input type="text" id="leadName" value="John Doe" />
        <input type="tel" id="leadPhone" value="9876543210" />
        <select id="leadGuests">
          <option value="1 to 4 People" selected>1 to 4 People</option>
          <option value="5 to 7 People">5 to 7 People</option>
        </select>
        <select id="leadTour">
          <option value="Jaipur Full Day Sightseeing" selected>Jaipur Full Day Sightseeing</option>
        </select>
        <input type="date" id="leadDate" value="2026-05-10" />
        <button type="submit">Submit</button>
      </form>

      <!-- 4. RC Verification Modal Elements -->
      <button id="viewRcBtn">View RC</button>
      <div class="modal-backdrop" id="rcModal">
        <button id="closeRcModal">&times;</button>
      </div>
    `;

    // Clear localStorage
    localStorage.clear();

    jest.clearAllMocks();

    // Mock window.open and alert
    window.open = jest.fn();
    window.alert = jest.fn();

    // Mock fetch for tours_data.json
    mockToursData = [
      {
        src: 'assets/images/tours/khatu_shyam_ji.jpg',
        title: 'Khatu Shyam Ji Darshan',
        category: 'Pilgrimage Yatras',
        desc: 'Spiritual trip',
        customers: '150+'
      },
      {
        src: 'assets/images/tours/amer_fort.jpg',
        title: 'Amer Fort Sightseeing',
        category: 'Jaipur Sightseeing',
        desc: 'Heritage tour',
        customers: '200+'
      }
    ];

    originalFetch = global.fetch;
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === 'assets/tours_data.json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockToursData)
        });
      }
      return Promise.reject(new Error('404 Not Found'));
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
  });

  function initAppScript() {
    require('../assets/app.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
  }

  describe('1. Car 360 Turntable Logic', () => {
    test('initializes auto-rotate on DOMContentLoaded', () => {
      jest.useFakeTimers();
      initAppScript();

      const autoRotateBtn = document.getElementById('autoRotateBtn');
      expect(autoRotateBtn.classList.contains('spinning')).toBe(true);
      expect(autoRotateBtn.innerHTML).toContain('Pause 360°');
      jest.useRealTimers();
    });

    test('switches car image and updates active angle button on click', () => {
      jest.useFakeTimers();
      initAppScript();

      const carImg = document.getElementById('carDisplayImg');
      const angleBtns = document.querySelectorAll('.angle-btn');

      // Click second angle button (Right Profile)
      angleBtns[1].click();

      // Fast-forward opacity timeout (150ms)
      jest.advanceTimersByTime(150);

      expect(carImg.src).toContain('assets/images/car_right.png');
      expect(carImg.alt).toBe('Right Profile');
      expect(angleBtns[1].classList.contains('active')).toBe(true);
      expect(angleBtns[0].classList.contains('active')).toBe(false);
      jest.useRealTimers();
    });

    test('toggles auto-rotate when autoRotateBtn is clicked', () => {
      jest.useFakeTimers();
      initAppScript();

      const autoRotateBtn = document.getElementById('autoRotateBtn');

      // First click should stop auto-rotate
      autoRotateBtn.click();
      expect(autoRotateBtn.classList.contains('spinning')).toBe(false);
      expect(autoRotateBtn.innerHTML).toContain('Auto Rotate');

      // Second click should restart auto-rotate
      autoRotateBtn.click();
      expect(autoRotateBtn.classList.contains('spinning')).toBe(true);
      expect(autoRotateBtn.innerHTML).toContain('Pause 360°');
      jest.useRealTimers();
    });

    test('rotates to next angle automatically every 2200ms when auto-rotate is active', () => {
      jest.useFakeTimers();
      initAppScript();

      const carImg = document.getElementById('carDisplayImg');

      // Advance timer by 2200ms for interval + 150ms for opacity timeout
      jest.advanceTimersByTime(2200);
      jest.advanceTimersByTime(150);

      expect(carImg.src).toContain('assets/images/car_right.png');
      jest.useRealTimers();
    });
  });

  describe('2. Gallery Filter & Dynamic Rendering', () => {
    test('fetches and renders gallery items on load', async () => {
      initAppScript();

      // Wait for fetch promise chain in app.js
      await new Promise(process.nextTick);
      await new Promise(process.nextTick);

      const galleryGrid = document.getElementById('galleryGrid');
      expect(global.fetch).toHaveBeenCalledWith('assets/tours_data.json');
      expect(galleryGrid.children.length).toBe(2);
      expect(galleryGrid.innerHTML).toContain('Khatu Shyam Ji Darshan');
      expect(galleryGrid.innerHTML).toContain('Amer Fort Sightseeing');
    });

    test('filters gallery items based on category button click', async () => {
      initAppScript();

      await new Promise(process.nextTick);
      await new Promise(process.nextTick);

      const filterBtns = document.querySelectorAll('.filter-btn');
      const galleryGrid = document.getElementById('galleryGrid');

      // Click Pilgrimage filter button
      filterBtns[1].click();

      expect(filterBtns[1].classList.contains('active')).toBe(true);
      expect(filterBtns[0].classList.contains('active')).toBe(false);
      expect(galleryGrid.children.length).toBe(1);
      expect(galleryGrid.innerHTML).toContain('Khatu Shyam Ji Darshan');
      expect(galleryGrid.innerHTML).not.toContain('Amer Fort Sightseeing');
    });

    test('shows all gallery items when "all" filter button is clicked', async () => {
      initAppScript();

      await new Promise(process.nextTick);
      await new Promise(process.nextTick);

      const filterBtns = document.querySelectorAll('.filter-btn');
      const galleryGrid = document.getElementById('galleryGrid');

      // Click Pilgrimage first, then All
      filterBtns[1].click();
      expect(galleryGrid.children.length).toBe(1);

      filterBtns[0].click();
      expect(galleryGrid.children.length).toBe(2);
    });

    test('handles fetch error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      initAppScript();

      await new Promise(process.nextTick);
      await new Promise(process.nextTick);

      expect(consoleSpy).toHaveBeenCalledWith('Gallery load error:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('3. Quick Booking Form Logic', () => {
    test('submits form, saves lead to localStorage, opens WhatsApp, and resets form', () => {
      initAppScript();

      const bookingForm = document.getElementById('quickBookingForm');
      const resetSpy = jest.spyOn(bookingForm, 'reset');

      const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
      bookingForm.dispatchEvent(submitEvent);

      // Check localStorage
      const savedLeads = JSON.parse(localStorage.getItem('bingo_leads') || '[]');
      expect(savedLeads.length).toBeGreaterThanOrEqual(1);
      const lead = savedLeads[0];
      expect(lead.name).toBe('John Doe');
      expect(lead.phone).toBe('9876543210');
      expect(lead.tour).toBe('Jaipur Full Day Sightseeing');

      // Check WhatsApp URL
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/918058985804?text='),
        '_blank'
      );
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('John%20Doe'),
        '_blank'
      );

      // Check Alert and Form Reset
      expect(window.alert).toHaveBeenCalledWith(
        'Thank you John Doe! Opening WhatsApp to connect with Jyotiram directly.'
      );
      expect(resetSpy).toHaveBeenCalled();
    });
  });

  describe('4. RC Verification Modal Logic', () => {
    test('opens RC modal when View RC button is clicked', () => {
      initAppScript();

      const viewRcBtn = document.getElementById('viewRcBtn');
      const rcModal = document.getElementById('rcModal');

      viewRcBtn.click();
      expect(rcModal.classList.contains('active')).toBe(true);
    });

    test('closes RC modal when close button is clicked', () => {
      initAppScript();

      const viewRcBtn = document.getElementById('viewRcBtn');
      const closeRcModal = document.getElementById('closeRcModal');
      const rcModal = document.getElementById('rcModal');

      viewRcBtn.click();
      expect(rcModal.classList.contains('active')).toBe(true);

      closeRcModal.click();
      expect(rcModal.classList.contains('active')).toBe(false);
    });

    test('closes RC modal when clicking directly on modal backdrop', () => {
      initAppScript();

      const viewRcBtn = document.getElementById('viewRcBtn');
      const rcModal = document.getElementById('rcModal');

      viewRcBtn.click();
      expect(rcModal.classList.contains('active')).toBe(true);

      // Click on backdrop directly
      rcModal.click();
      expect(rcModal.classList.contains('active')).toBe(false);
    });
  });
});
