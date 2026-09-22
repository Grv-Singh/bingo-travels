/**
 * @jest-environment jsdom
 */

describe('Quick Booking Form - LocalStorage & Error Handling Tests', () => {
  let openSpy;
  let alertSpy;
  let domContentLoadedListeners = [];
  const originalAddEventListener = document.addEventListener;

  beforeAll(() => {
    document.addEventListener = function (type, listener, options) {
      if (type === 'DOMContentLoaded') {
        domContentLoadedListeners.push(listener);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  });

  afterAll(() => {
    document.addEventListener = originalAddEventListener;
  });

  beforeEach(() => {
    jest.resetModules();

    // Remove old listeners
    domContentLoadedListeners.forEach(listener => {
      document.removeEventListener('DOMContentLoaded', listener);
    });
    domContentLoadedListeners = [];

    // Clear DOM
    document.body.innerHTML = `
      <img id="carDisplayImg" src="" alt="" />
      <button class="angle-btn active">Front</button>
      <button id="autoRotateBtn">Auto Rotate</button>

      <form id="quickBookingForm">
        <input id="leadName" name="name" />
        <input id="leadPhone" name="phone" />
        <select id="leadTour" name="tour"><option value="Jaipur Sightseeing" selected>Jaipur Sightseeing</option></select>
        <input id="leadDate" name="date" />
        <input id="leadGuests" name="guests" />
        <button type="submit">Book Now</button>
      </form>

      <div id="galleryGrid"></div>
      <button class="filter-btn active" data-filter="all">All</button>

      <div id="rcModal"></div>
      <button id="viewRcBtn">View RC</button>
      <button id="closeRcModal">Close RC</button>
    `;

    // Clear localStorage
    localStorage.clear();

    // Spy on window methods
    openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Mock fetch for gallery
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve([])
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function setupApp() {
    require('../assets/app.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Fill form input values
    document.getElementById('leadName').value = 'John Doe';
    document.getElementById('leadPhone').value = '1234567890';
    document.getElementById('leadTour').value = 'Jaipur Sightseeing';
    document.getElementById('leadDate').value = '2025-05-01';
    document.getElementById('leadGuests').value = '4';
  }

  test('Happy path: saves lead to localStorage, opens WhatsApp, alerts user, and resets form', () => {
    setupApp();
    const form = document.getElementById('quickBookingForm');
    const nameInput = document.getElementById('leadName');

    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    // Check localStorage
    const savedLeads = JSON.parse(localStorage.getItem('bingo_leads') || '[]');
    expect(savedLeads.length).toBe(1);
    expect(savedLeads[0].name).toBe('John Doe');
    expect(savedLeads[0].phone).toBe('1234567890');
    expect(savedLeads[0].tour).toBe('Jaipur Sightseeing');
    expect(savedLeads[0].date).toBe('2025-05-01');
    expect(savedLeads[0].guests).toBe('4');
    expect(savedLeads[0].timestamp).toBeDefined();

    // Check WhatsApp open call
    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy.mock.calls[0][0]).toContain('https://wa.me/918058985804?text=');
    expect(openSpy.mock.calls[0][0]).toContain(encodeURIComponent('John Doe'));
    expect(openSpy.mock.calls[0][1]).toBe('_blank');

    // Check alert call
    expect(alertSpy).toHaveBeenCalledWith('Thank you John Doe! Opening WhatsApp to connect with Jyotiram directly.');

    // Check form reset (input value cleared)
    expect(nameInput.value).toBe('');
  });

  test('Empty catch block resilience: handles localStorage.setItem QuotaExceededError without crashing', () => {
    setupApp();
    // Mock localStorage.setItem to throw an exception (e.g. QuotaExceededError)
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    });

    const form = document.getElementById('quickBookingForm');

    expect(() => {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }).not.toThrow();

    // Ensure application flow continues uninterrupted
    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith('Thank you John Doe! Opening WhatsApp to connect with Jyotiram directly.');
  });

  test('Empty catch block resilience: handles localStorage.getItem exception (e.g. security error or disabled local storage)', () => {
    setupApp();
    // Mock localStorage.getItem to throw an exception
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: The operation is insecure.');
    });

    const form = document.getElementById('quickBookingForm');

    expect(() => {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }).not.toThrow();

    // Ensure application flow continues uninterrupted
    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith('Thank you John Doe! Opening WhatsApp to connect with Jyotiram directly.');
  });

  test('Empty catch block resilience: handles corrupt JSON data in localStorage gracefully', () => {
    setupApp();
    // Set invalid JSON in localStorage
    localStorage.setItem('bingo_leads', 'INVALID_JSON{{{');

    const form = document.getElementById('quickBookingForm');

    expect(() => {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }).not.toThrow();

    // Ensure application flow continues uninterrupted
    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith('Thank you John Doe! Opening WhatsApp to connect with Jyotiram directly.');
  });
});
