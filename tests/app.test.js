/**
 * @jest-environment jsdom
 */

describe('Gallery Fetch & Error Handling in app.js', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    // Clear DOM and reset HTML structure needed by app.js
    document.body.innerHTML = `
      <img id="carDisplayImg" src="" alt="" />
      <button class="angle-btn active">Angle 1</button>
      <button class="angle-btn">Angle 2</button>

      <button id="autoRotateBtn">Auto Rotate</button>

      <div id="galleryGrid"></div>
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="rajasthan">Rajasthan</button>

      <form id="quickBookingForm">
        <input id="leadName" value="Test Name" />
        <input id="leadPhone" value="1234567890" />
        <select id="leadTour"><option value="Rajasthan Tour">Rajasthan Tour</option></select>
        <input id="leadDate" value="2025-01-01" />
        <input id="leadGuests" value="2" />
      </form>

      <button id="viewRcBtn">View RC</button>
      <div id="rcModal"></div>
      <button id="closeRcModal">Close RC</button>
    `;

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('handles fetch error when fetching tours_data.json fails (network rejection)', async () => {
    const networkError = new Error('Network error loading gallery');
    global.fetch = jest.fn().mockRejectedValue(networkError);

    require('../assets/app.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Allow promise handlers to process
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(global.fetch).toHaveBeenCalledWith('assets/tours_data.json');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Gallery load error:', networkError);
  });

  test('renders gallery successfully when fetch succeeds', async () => {
    const mockTours = [
      {
        src: 'assets/images/tours/tour1.jpg',
        title: 'Golden Triangle Tour',
        category: 'Rajasthan',
        customers: 150,
        desc: 'Explore Delhi, Agra, and Jaipur.'
      }
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockTours)
    });

    require('../assets/app.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(global.fetch).toHaveBeenCalledWith('assets/tours_data.json');
    const galleryGrid = document.getElementById('galleryGrid');
    expect(galleryGrid.innerHTML).toContain('Golden Triangle Tour');
    expect(galleryGrid.innerHTML).toContain('Rajasthan');
  });

  test('filters gallery items when filter buttons are clicked', async () => {
    const mockTours = [
      {
        src: 'assets/images/tours/tour1.jpg',
        title: 'Jaipur Palace Tour',
        category: 'Rajasthan',
        customers: 100,
        desc: 'Palace tour'
      },
      {
        src: 'assets/images/tours/tour2.jpg',
        title: 'Kerala Backwaters',
        category: 'South India',
        customers: 80,
        desc: 'Backwaters tour'
      }
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockTours)
    });

    require('../assets/app.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await new Promise(resolve => setTimeout(resolve, 0));

    const filterBtns = document.querySelectorAll('.filter-btn');
    const rajasthanBtn = filterBtns[1]; // data-filter="rajasthan"

    rajasthanBtn.click();

    const galleryGrid = document.getElementById('galleryGrid');
    expect(galleryGrid.innerHTML).toContain('Jaipur Palace Tour');
    expect(galleryGrid.innerHTML).not.toContain('Kerala Backwaters');
  });
});
