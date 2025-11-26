/* assets/js/app.js
   Улучшенная интерактивность:
   - улучшенное мобильное меню с анимацией
   - модальное окно с доступностью
   - избранное и корзина с проверкой дубликатов
   - инициализация состояния кнопок
   - система фильтрации работ
*/
document.addEventListener('DOMContentLoaded', ()=>{

  // Mobile nav toggle with improved functionality
  const menuBtn = document.querySelector('#menuBtn');
  const nav = document.querySelector('.nav');
  
  if(menuBtn && nav){
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nav.classList.toggle('show');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
        nav.classList.remove('show');
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        nav.classList.remove('show');
      }
    });
  }

  // LocalStorage helpers with error handling
  function read(key){ 
    try{ 
      return JSON.parse(localStorage.getItem(key)||'[]'); 
    }catch(e){ 
      console.error('Error reading from localStorage:', e);
      return []; 
    } 
  }
  
  function write(key, val){ 
    try{
      localStorage.setItem(key, JSON.stringify(val)); 
    }catch(e){
      console.error('Error writing to localStorage:', e);
    }
  }

  // Initialize favorite buttons state
  function initializeFavorites() {
    const favorites = read('favorites');
    document.querySelectorAll('.js-fav').forEach(btn => {
      const id = btn.dataset.id;
      if (id && favorites.includes(id)) {
        btn.classList.add('active');
        btn.textContent = '♥';
      } else {
        btn.textContent = '❤';
      }
    });
  }

  // Initialize cart buttons state
  function initializeCart() {
    const cart = read('cart');
    document.querySelectorAll('.js-addcart').forEach(btn => {
      const id = btn.dataset.id;
      if (id && cart.includes(id)) {
        btn.textContent = 'In Cart';
        btn.disabled = true;
      }
    });
  }

  // Filter functionality
  function initializeFilters() {
    const filterContainer = document.querySelector('.filters-container');
    if (!filterContainer || !window.filterData) return;

    filterContainer.innerHTML = `
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin: 20px 0;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="color: var(--muted); font-size: 14px;">Город:</label>
          <select class="filter-select" id="cityFilter">
            ${window.filterData.cities.map(city => 
              `<option value="${city}">${city}</option>`
            ).join('')}
          </select>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="color: var(--muted); font-size: 14px;">Стиль:</label>
          <select class="filter-select" id="styleFilter">
            ${window.filterData.styles.map(style => 
              `<option value="${style}">${style}</option>`
            ).join('')}
          </select>
        </div>
        <button class="btn ghost" id="resetFilters">Сбросить фильтры</button>
      </div>
    `;

    // Add event listeners
    const cityFilter = document.getElementById('cityFilter');
    const styleFilter = document.getElementById('styleFilter');
    const resetBtn = document.getElementById('resetFilters');

    if (cityFilter) cityFilter.addEventListener('change', applyFilters);
    if (styleFilter) styleFilter.addEventListener('change', applyFilters);
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);
  }

  function applyFilters() {
    const cityFilter = document.getElementById('cityFilter');
    const styleFilter = document.getElementById('styleFilter');
    
    if (!cityFilter || !styleFilter || !window.artworks) return;

    const selectedCity = cityFilter.value;
    const selectedStyle = styleFilter.value;

    const filteredArtworks = window.artworks.filter(art => {
      const cityMatch = selectedCity === 'Все' || art.city === selectedCity;
      const styleMatch = selectedStyle === 'Все' || art.style === selectedStyle;
      return cityMatch && styleMatch;
    });

    renderFilteredArtworks(filteredArtworks);
  }

  function renderFilteredArtworks(filteredArtworks) {
    const grid = document.querySelector('.grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (filteredArtworks.length === 0) {
      grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1;">
          <div class="thumb" style="height: 200px; display: flex; align-items: center; justify-content: center; color: var(--muted);">
            Ничего не найдено по выбранным фильтрам
          </div>
        </div>
      `;
      return;
    }

    filteredArtworks.forEach(art => {
      const card = document.createElement('div');
      card.className = 'card js-art';
      card.dataset.title = art.title;
      card.dataset.img = art.image;
      
      card.innerHTML = `
        <div class="thumb" style="background-image: url('${art.image}'); background-size: cover; background-position: center;">
          ${art.title}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-weight:700">${art.title}</div>
          <div>
            <button class="btn js-fav" data-id="${art.id}">❤</button>
            <button class="btn js-addcart" data-id="${art.id}">Add to cart</button>
          </div>
        </div>
        <div style="color:var(--muted); font-size:14px; margin-top:8px;">
          Художник: ${art.artist} • Город: ${art.city}<br>
          Стиль: ${art.style} • ${art.price}
        </div>
      `;
      
      grid.appendChild(card);
    });

    // Re-initialize buttons for new elements
    initializeFavorites();
    initializeCart();
  }

  function resetFilters() {
    const cityFilter = document.getElementById('cityFilter');
    const styleFilter = document.getElementById('styleFilter');
    
    if (cityFilter) cityFilter.value = 'Все';
    if (styleFilter) styleFilter.value = 'Все';
    
    applyFilters();
  }

  // Render artworks from data.js
  function renderArtworks() {
    const grid = document.querySelector('.grid');
    // Проверяем, есть ли grid на странице и не загружены ли уже artworks
    if (!grid || window.artworksLoaded || !window.artworks) return;
    
    // Initialize filters if container exists
    const filterContainer = document.querySelector('.filters-container');
    if (filterContainer && window.filterData) {
      initializeFilters();
    }
    
    // Render all artworks initially
    window.artworks.forEach(art => {
      const card = document.createElement('div');
      card.className = 'card js-art';
      card.dataset.title = art.title;
      card.dataset.img = art.image;
      
      card.innerHTML = `
        <div class="thumb" style="background-image: url('${art.image}'); background-size: cover; background-position: center;">
          ${art.title}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-weight:700">${art.title}</div>
          <div>
            <button class="btn js-fav" data-id="${art.id}">❤</button>
            <button class="btn js-addcart" data-id="${art.id}">Add to cart</button>
          </div>
        </div>
        <div style="color:var(--muted); font-size:14px; margin-top:8px;">
          Художник: ${art.artist} • Город: ${art.city}<br>
          Стиль: ${art.style} • ${art.price}
        </div>
      `;
      
      grid.appendChild(card);
    });
    
    window.artworksLoaded = true;
    // Переинициализируем кнопки для новых элементов
    initializeFavorites();
    initializeCart();
  }

  // Artwork preview modal - FIXED CLICK HANDLER
  const modal = document.querySelector('#artModal');
  const modalTitle = modal ? modal.querySelector('.modal-title') : null;
  const modalImg = modal ? modal.querySelector('.modal-img') : null;

  // Fixed: Proper delegated event handling for artwork clicks
  document.addEventListener('click', (e) => {
    // Check if clicked element or its parent has js-art class
    const artCard = e.target.closest('.js-art');
    if (artCard) {
      e.preventDefault();
      const title = artCard.dataset.title || 'Artwork';
      const img = artCard.dataset.img || '';
      showModal(title, img);
      return;
    }

    // Favorite functionality
    const fav = e.target.closest('.js-fav');
    if(fav){
      e.preventDefault();
      const id = fav.dataset.id;
      if (!id) return;
      
      let items = read('favorites');
      if(items.includes(id)) {
        items = items.filter(x => x !== id);
        fav.classList.remove('active');
        fav.textContent = '❤';
      } else {
        items.push(id);
        fav.classList.add('active');
        fav.textContent = '♥';
      }
      write('favorites', items);
      return;
    }

    // Cart functionality with duplicate prevention
    const cart = e.target.closest('.js-addcart');
    if(cart){
      e.preventDefault();
      const id = cart.dataset.id;
      if (!id) return;
      
      let items = read('cart');
      if (!items.includes(id)) {
        items.push(id);
        write('cart', items);
        cart.textContent = 'Added';
        cart.disabled = true;
        setTimeout(() => {
          cart.textContent = 'In Cart';
        }, 1000);
      } else {
        cart.textContent = 'Already in cart';
        setTimeout(() => {
          cart.textContent = 'In Cart';
          cart.disabled = true;
        }, 1000);
      }
      return;
    }
  });

  // Modal functions
  window.showModal = (title, img = '') => {
    if(!modal || !modalTitle || !modalImg) {
      console.error('Modal elements not found');
      return;
    }
    
    // Set accessibility attributes
    modal.setAttribute('aria-hidden', 'false');
    modalTitle.textContent = title;
    modalTitle.id = 'modalTitle';
    
    // Show loading state
    modalImg.classList.add('loading');
    modalImg.style.backgroundImage = 'none';
    modalImg.textContent = '';
    
    if(img) {
      const image = new Image();
      image.onload = () => {
        modalImg.style.backgroundImage = `url(${img})`;
        modalImg.classList.remove('loading');
      };
      image.onerror = () => {
        modalImg.style.backgroundImage = 'none';
        modalImg.classList.remove('loading');
        modalImg.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--muted);">Image not available</div>';
      };
      image.src = img;
    } else {
      modalImg.classList.remove('loading');
      modalImg.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--muted);">No image</div>';
    }
    
    modal.classList.add('open');
    
    // Focus on close button for accessibility
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
      closeBtn.focus();
    }
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  // Close modal functionality
  function closeModal() {
    if(modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if(modal){
    modal.querySelectorAll('.close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
      });
    });

    modal.addEventListener('click', (e) => { 
      if(e.target === modal) {
        closeModal();
      }
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });
  }

  // Render lists for favorites and cart pages
  function renderList(rootSelector, key, emptyMessage) {
    const root = document.querySelector(rootSelector);
    if(!root) return;
    
    const data = read(key);
    if(!data.length){
      root.innerHTML = `
        <div class="card" style="grid-column: 1 / -1;">
          <div class="thumb" style="height: 200px; display: flex; align-items: center; justify-content: center;">
            ${emptyMessage}
          </div>
        </div>`;
      return;
    }
    
    root.innerHTML = '';
    data.forEach(id => {
      const el = document.createElement('div');
      el.className = 'card';
      el.innerHTML = `
        <div class="thumb">Item ${id}</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-weight:700">Item ${id}</div>
          <div>
            <button class="btn js-fav" data-id="${id}">❤</button>
            <button class="btn js-addcart" data-id="${id}">Add to cart</button>
          </div>
        </div>`;
      root.appendChild(el);
    });
    
    // Re-initialize buttons for the new elements
    initializeFavorites();
    initializeCart();
  }

  // Initialize all interactive elements
  initializeFavorites();
  initializeCart();
  
  // Render artworks if data exists
  renderArtworks();
  
  // Render lists on specific pages
  renderList('#favList', 'favorites', 'Нет избранных');
  renderList('#cartList', 'cart', 'Корзина пуста');

  console.log('GraffLib JS loaded successfully'); // Debug log

});