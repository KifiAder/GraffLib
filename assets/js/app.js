/* assets/js/app.js
   Улучшенная интерактивность:
   - улучшенное мобильное меню с анимацией
   - модальное окно с доступностью
   - избранное и корзина с проверкой дубликатов
   - инициализация состояния кнопок
   - система фильтрации работ
*/
document.addEventListener('DOMContentLoaded', ()=>{

  // Preloader hide on full load (with small delay so он виден чуть дольше)
  window.addEventListener('load', () => {
    const preloader = document.querySelector('#sitePreloader');
    if(preloader){
      const MIN_SHOW_TIME = 1500; // мс — можно менять под себя
      setTimeout(() => {
        preloader.classList.add('preloader-hidden');
        // полное удаление из DOM после анимации
        setTimeout(() => {
          preloader.remove();
        }, 500);
      }, MIN_SHOW_TIME);
    }
  });

  // Mobile nav toggle with improved functionality + auto-injected button for all страниц
  const header = document.querySelector('.header');
  let menuBtn = document.querySelector('#menuBtn');
  const nav = document.querySelector('.nav');

  if (!menuBtn && header) {
    menuBtn = document.createElement('button');
    menuBtn.id = 'menuBtn';
    menuBtn.type = 'button';
    menuBtn.className = 'menu-toggle';
    menuBtn.setAttribute('aria-label', 'Открыть меню');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.innerHTML = '<p>☰</p>';

    const navNode = header.querySelector('.nav');
    if (navNode && navNode.parentNode) {
      header.insertBefore(menuBtn, navNode);
    } else {
      header.appendChild(menuBtn);
    }
  }

  if(menuBtn && nav){
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = nav.classList.toggle('show');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
        nav.classList.remove('show');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        nav.classList.remove('show');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Ensure profile link exists in nav
  (function ensureProfileLink(){
    const navEl = document.querySelector('.nav');
    if(!navEl) return;
    const hasProfile = Array.from(navEl.querySelectorAll('a')).some(a => (a.getAttribute('href')||'') === 'profile.html');
    if(!hasProfile){
      const link = document.createElement('a');
      link.href = 'profile.html';
      link.textContent = 'Профиль';
      navEl.appendChild(link);
    }
  })();

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
      card.dataset.id = art.id;
      
      const imageStyle = art.image ? `background-image: url('${art.image}')` : 'background: #111';
      
      card.innerHTML = `
        <div class="thumb" style="${imageStyle}; background-size: cover; background-position: center;">
          <!-- Название убрано из миниатюры -->
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-weight:700">${art.title}</div>
          <div style="display:flex;gap:6px;flex-wrap:nowrap">
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

  function renderArtworks() {
    const grid = document.querySelector('.grid');
    
    // Расширенная проверка
    if (!grid) {
      console.log('Grid container not found');
      return;
    }
    
    if (window.artworksLoaded) {
      console.log('Artworks already loaded');
      return;
    }
    
    if (!window.artworks) {
      console.log('No artworks data found');
      // Покажем сообщение об отсутствии данных
      grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1;">
          <div class="thumb" style="height: 200px; display: flex; align-items: center; justify-content: center; color: var(--muted);">
            Данные не загружены. Проверьте файл data.js
          </div>
        </div>
      `;
      return;
    }
    
    console.log('Rendering artworks:', window.artworks.length);
    
    // Initialize filters if container exists
    const filterContainer = document.querySelector('.filters-container');
    if (filterContainer) {
      console.log('Initializing filters');
      // Если есть статические фильтры, добавим обработчики
      const cityFilter = document.getElementById('cityFilter');
      const styleFilter = document.getElementById('styleFilter');
      const resetBtn = document.getElementById('resetFilters');
      
      if (cityFilter && styleFilter) {
        console.log('Adding event listeners to static filters');
        cityFilter.addEventListener('change', applyFilters);
        styleFilter.addEventListener('change', applyFilters);
        if (resetBtn) resetBtn.addEventListener('click', resetFilters);
      } else if (window.filterData) {
        // Если нет статических фильтров, создадим динамические
        initializeFilters();
      }
    }
    
    // Render all artworks initially
    window.artworks.forEach(art => {
      const card = document.createElement('div');
      card.className = 'card js-art';
      card.dataset.title = art.title;
      card.dataset.img = art.image;
      card.dataset.id = art.id;
      
      // Используем placeholder если изображение не загружается
      const imageStyle = art.image ? `background-image: url('${art.image}')` : 'background: #111';
      
      card.innerHTML = `
        <div class="thumb" style="${imageStyle}; background-size: cover; background-position: center;">
          <!-- Название убрано из миниатюры -->
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-weight:700">${art.title}</div>
          <div style="display:flex;gap:6px;flex-wrap:nowrap">
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
    
    console.log('Artworks rendered successfully');
  }

  // 3D hero block (Three.js) — граффити‑баллон
  function initHero3D(){
    const container = document.getElementById('hero3d');
    if(!container || !window.THREE) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.16);

    const camera = new THREE.PerspectiveCamera(
      32,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.1, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0); // прозрачный — фон берём из CSS
    container.appendChild(renderer.domElement);

    // Группа баллончика
    const canGroup = new THREE.Group();
    scene.add(canGroup);

    // Корпус баллона
    const bodyGeo = new THREE.CylinderGeometry(0.55, 0.55, 2.4, 32, 1, false);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.7,
      roughness: 0.35
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.4;
    canGroup.add(body);

    // Цветная "наклейка" по центру
    const wrapGeo = new THREE.CylinderGeometry(0.57, 0.57, 1.1, 32, 1, true);
    const wrapMat = new THREE.MeshStandardMaterial({
      color: 0x161629,
      emissive: 0x111111,
      emissiveIntensity: 0.2,
      metalness: 0.6,
      roughness: 0.4,
      side: THREE.DoubleSide
    });
    const wrap = new THREE.Mesh(wrapGeo, wrapMat);
    wrap.position.y = 0.4;
    canGroup.add(wrap);

    // Неоновые полосы на корпусе — как яркий тег
    const neonMatPink = new THREE.MeshStandardMaterial({
      color: 0xff2a8a,
      emissive: 0xff2a8a,
      emissiveIntensity: 2.2,
      metalness: 0.8,
      roughness: 0.25
    });
    const neonMatCyan = new THREE.MeshStandardMaterial({
      color: 0x3bf5ff,
      emissive: 0x3bf5ff,
      emissiveIntensity: 2.0,
      metalness: 0.8,
      roughness: 0.25
    });

    const ringGeo = new THREE.TorusGeometry(0.6, 0.03, 16, 64);
    const ringTop = new THREE.Mesh(ringGeo, neonMatPink);
    ringTop.position.y = 0.95;
    ringTop.rotation.x = Math.PI / 2;
    const ringMid = new THREE.Mesh(ringGeo, neonMatCyan);
    ringMid.position.y = 0.4;
    ringMid.rotation.x = Math.PI / 2;
    const ringBottom = new THREE.Mesh(ringGeo, neonMatPink);
    ringBottom.position.y = -0.15;
    ringBottom.rotation.x = Math.PI / 2;
    canGroup.add(ringTop, ringMid, ringBottom);

    // Верхняя металлическая "шляпка"
    const capGeo = new THREE.CylinderGeometry(0.45, 0.55, 0.35, 32);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xededed,
      metalness: 1,
      roughness: 0.18
    });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 1.65;
    canGroup.add(cap);

    // Сопло
    const nozzleGeo = new THREE.CylinderGeometry(0.14, 0.2, 0.22, 24);
    const nozzleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.6,
      roughness: 0.25
    });
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzle.position.set(0.08, 1.9, 0.02);
    nozzle.rotation.z = -0.3;
    canGroup.add(nozzle);

    // Маленькое тёмное отверстие сопла
    const holeGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.05, 16);
    const holeMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.5,
      roughness: 0.5
    });
    const hole = new THREE.Mesh(holeGeo, holeMat);
    hole.rotation.x = Math.PI / 2;
    hole.position.set(0.13, 1.9, 0.12);
    canGroup.add(hole);

    // Лёгкое "облако" краски
    const sprayGeo = new THREE.SphereGeometry(0.35, 24, 24);
    const sprayMat = new THREE.MeshStandardMaterial({
      color: 0xff2a8a,
      emissive: 0xff2a8a,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.35
    });
    const spray = new THREE.Mesh(sprayGeo, sprayMat);
    spray.position.set(0.3, 1.8, 0.6);
    canGroup.add(spray);

    // Лёгкий наклон
    canGroup.rotation.z = -0.12;
    canGroup.position.set(0, -0.05, 0);

    // Свет
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0xff2a8a, 1.6, 10);
    keyLight.position.set(2.2, 2.2, 3.2);
    const rimLight = new THREE.PointLight(0x3bf5ff, 1.5, 10);
    rimLight.position.set(-2.0, 0.4, 3.8);
    const bottomLight = new THREE.PointLight(0xffffff, 0.4, 8);
    bottomLight.position.set(0, -2.4, 2.0);
    scene.add(keyLight, rimLight, bottomLight);

    // Анимация
    let lastTime = 0;
    function animate(time){
      const dt = (time - lastTime) / 1000 || 0;
      lastTime = time;

      const t = time * 0.001;
      canGroup.rotation.y += 0.55 * dt;
      canGroup.position.y = -0.1 + Math.sin(t * 1.4) * 0.08;
      spray.scale.setScalar(1 + Math.sin(t * 3.0) * 0.07);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    // Ресайз
    window.addEventListener('resize', () => {
      if(!container) return;
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  // Artwork preview modal - FIXED CLICK HANDLER
  const modal = document.querySelector('#artModal');
  const modalTitle = modal ? modal.querySelector('.modal-title') : null;
  const modalImg = modal ? modal.querySelector('.modal-img') : null;

  // Fixed: Proper delegated event handling for artwork clicks
  document.addEventListener('click', (e) => {
    // Сначала обрабатываем избранное и корзину,
    // чтобы клик по кнопкам НЕ открывал большое изображение

    // Favorite functionality
    const fav = e.target.closest('.js-fav');
    if(fav){
      e.preventDefault();
      e.stopPropagation();
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
      e.stopPropagation();
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

    // Remove from cart (cart page)
    const removeBtn = e.target.closest('.js-remove-cart');
    if (removeBtn) {
      e.preventDefault();
      e.stopPropagation();
      const id = removeBtn.dataset.id;
      if (!id) return;

      let items = read('cart');
      items = items.filter(x => x !== id);
      write('cart', items);

      // Перерисуем корзину, если мы на её странице
      renderList('#cartList', 'cart', 'Корзина пуста');
      return;
    }

    // Только если клик был не по кнопкам — открываем детальную страницу работы
    const artCard = e.target.closest('.js-art');
    if (artCard) {
      e.preventDefault();
      const id = artCard.dataset.id;
      if (id) {
        const url = `work-detail.html?id=${encodeURIComponent(id)}`;
        window.location.href = url;
      } else {
        const title = artCard.dataset.title || 'Artwork';
        const img = artCard.dataset.img || '';
        showModal(title, img);
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
      const art = (window.artworks || []).find(a => a.id === id);
      const el = document.createElement('div');
      el.className = 'card js-art';
      el.dataset.id = id;
      el.dataset.title = art ? art.title : `Работа ${id}`;
      el.dataset.img = art ? art.image : '';

      const actionsHtml = key === 'cart'
        ? `
            <button class="btn js-addcart" data-id="${id}">Add to cart</button>
            <button class="btn js-remove-cart" data-id="${id}">Удалить</button>
          `
        : `
            <button class="btn js-fav" data-id="${id}">❤</button>
            <button class="btn js-addcart" data-id="${id}">Add to cart</button>
          `;

      const actionsWrapperStyle = key === 'cart'
        ? 'display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end'
        : 'display:flex;gap:6px;flex-wrap:nowrap';

      if (art) {
        el.innerHTML = `
          <div class="thumb" style="background-image:url('${art.image}');background-size:cover;background-position:center;"></div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-weight:700">${art.title}</div>
            <div style="${actionsWrapperStyle}">
              ${actionsHtml}
            </div>
          </div>
          <div style="color:var(--muted); font-size:14px; margin-top:8px;">
            Художник: ${art.artist} • Город: ${art.city}<br>
            Стиль: ${art.style} • ${art.price}
          </div>
        `;
      } else {
        el.innerHTML = `
          <div class="thumb">Работа ${id}</div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-weight:700">Работа ${id}</div>
            <div style="${actionsWrapperStyle}">
              ${actionsHtml}
            </div>
          </div>
        `;
      }

      root.appendChild(el);
    });
    
    // Re-initialize buttons for the new elements
    initializeFavorites();
    initializeCart();
  }

  // Registrations (events) helpers
  function saveRegistration(reg){
    const list = read('registrations');
    list.push(reg);
    write('registrations', list);
  }

  function renderRegistrations(){
    const root = document.querySelector('#regList');
    if(!root) return;
    const regs = read('registrations');
    if(!regs.length){
      root.innerHTML = `
        <div class="card" style="grid-column:1 / -1;">
          <div class="thumb" style="height:140px;display:flex;align-items:center;justify-content:center;color:var(--muted);">
            Нет записей на события
          </div>
        </div>
      `;
      return;
    }
    root.innerHTML = '';
    const eventPages = {
      'jam-moscow': 'event-jam-moscow.html',
      'exhibit': 'event-exhibit.html',
      'workshop': 'event-workshop.html',
      'festival': 'event-festival.html'
    };
    regs.slice().reverse().forEach(reg => {
      const link = eventPages[reg.eventId] || 'events.html';
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
          <div style="font-weight:700">${reg.eventTitle || 'Событие'}</div>
          <span class="badge">${reg.eventDate || ''}</span>
        </div>
        <div style="color:var(--muted); margin-top:8px; font-size:14px;">
          Имя: ${reg.name || '—'}<br>
          Email: ${reg.email || '—'}
        </div>
        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
          <a class="btn ghost" href="${link}">Перейти к событию</a>
        </div>
      `;
      root.appendChild(card);
    });
  }

  // Initialize all interactive elements
  initializeFavorites();
  initializeCart();

  // Init 3D hero if контейнер есть
  initHero3D();
  
  // Render artworks if мы на странице c сеткой работ
  renderArtworks();
  
  // Render lists on specific pages
  renderList('#favList', 'favorites', 'Нет избранных');
  renderList('#cartList', 'cart', 'Корзина пуста');
  renderRegistrations();

  // Attach event registration handlers
  document.querySelectorAll('.js-event-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (form.querySelector('input[name=\"name\"]')?.value || '').trim();
      const email = (form.querySelector('input[name=\"email\"]')?.value || '').trim();
      if(!name || !email) return;
      saveRegistration({
        eventId: form.dataset.eventId || 'event',
        eventTitle: form.dataset.eventTitle || 'Событие',
        eventDate: form.dataset.eventDate || '',
        name,
        email,
        ts: Date.now()
      });
      form.reset();
      const status = form.querySelector('.form-status');
      if(status){
        status.textContent = 'Вы записаны на событие';
        status.style.color = '#9ae6b4';
      }
      renderRegistrations();
    });
  });

  // Детальная страница работы
  (function renderWorkDetailPage(){
    const detailRoot = document.querySelector('#workDetail');
    if(!detailRoot || !window.artworks) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const art = window.artworks.find(a => a.id === id);

    const titleEl = document.querySelector('#workTitle');
    const metaEl = document.querySelector('#workMeta');

    if(!art){
      if (titleEl) titleEl.textContent = 'Работа не найдена';
      if (metaEl) metaEl.textContent = 'Проверьте ссылку или откройте каталог работ.';
      detailRoot.innerHTML = `
        <div class="card">
          <div class="thumb">
            Данных по этой работе нет. Откройте раздел «Работы», чтобы выбрать другую.
          </div>
        </div>
      `;
      return;
    }

    if (titleEl) titleEl.textContent = art.title;
    if (metaEl) metaEl.textContent = `${art.artist} • ${art.city} • ${art.style} • ${art.price}`;

    const descriptionByStyle = {
      'Мурал': 'Крупный мурал, который собирает внимание целого двора или улицы. Такие работы часто становятся неформальными ориентирами района.',
      'Шрифты': 'Шрифтовая работа, где основная роль у букв и форм. Леттеринг, который превращает текст в полноценный визуальный образ.',
      'Персонажи': 'Работа с персонажами и героями. Взгляд, пластика и эмоция здесь так же важны, как и цвет.',
      '3D': 'Объёмное граффити с иллюзией глубины. При правильном ракурсе работа «выходит» из стены.',
      'Абстракция': 'Абстрактное граффити, которое работает через ритм, форму и цвет, а не через сюжет.',
      'Реализм': 'Реалистичные детали и светотень, которые делают работу похожей на фотографию.'
    };

    const styleDesc = descriptionByStyle[art.style] || 'Эта работа отражает почерк автора и атмосферу города, в котором она появилась.';

    detailRoot.innerHTML = `
      <div style="display:grid;grid-template-columns:minmax(0,360px) minmax(0,1fr);gap:20px;align-items:flex-start;">
        <div>
          <div style="width:100%;max-width:420px;border-radius:12px;overflow:hidden;background:#111;">
            <img src="${art.image}" alt="${art.title}" style="width:100%;height:auto;display:block;object-fit:cover;">
          </div>
        </div>
        <div>
          <p style="color:var(--muted);margin-top:0;">
            ${styleDesc}
          </p>
          <p style="color:var(--muted);margin-top:10px;">
            Локация: ${art.city}. Стиль: ${art.style}. Примерная стоимость работы в каталоге: ${art.price}.
          </p>
          <p style="color:var(--muted);margin-top:10px;font-size:13px;">
            Добавьте работу в избранное, чтобы не потерять, или в корзину, если хотите заказать принт или мерч с этим изображением.
          </p>

          <div style="margin-top:16px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
            <button class="btn js-fav" data-id="${art.id}">❤</button>
            <button class="btn js-addcart" data-id="${art.id}">Add to cart</button>
            <button class="btn ghost" onclick="location.href='works.html'">Назад к каталогу</button>
          </div>
        </div>
      </div>
    `;

    // Инициализируем состояние кнопок для этой страницы
    initializeFavorites();
    initializeCart();
  })();

  console.log('GraffLib JS loaded successfully'); // Debug log

});