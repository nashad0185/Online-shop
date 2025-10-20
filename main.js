// main.js — replace your old file with this (or paste at end in a <script> tag)
document.addEventListener("DOMContentLoaded", () => {
  /* ====== NAVBAR (mobile toggle + close on link click) ====== */
  const toggleButton = document.querySelector('.toggle-button');
  const navbar = document.querySelector('.navbar');
  const navbarLinksWrap = document.querySelector('.navbar-links');
  const navLinks = document.querySelectorAll('.navbar-links a[href^="#"]');

  if (toggleButton && navbar) {
    toggleButton.addEventListener("click", () => {
      navbar.classList.toggle("active");
      // also toggle links panel if you want explicit class:
      navbarLinksWrap.classList.toggle("active");
    });
  }

  // close mobile menu when a nav link (internal anchor) is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // smooth scroll handled below; close menu
      navbar.classList.remove('active');
      navbarLinksWrap.classList.remove('active');
    });
  });

  /* ====== SMOOTH SCROLL FOR INTERNAL LINKS (including hero button) ====== */
  // hero button (use class .hero-btn) - fallback if exists
  const heroBtn = document.querySelector('.hero-btn');
  const productsSection = document.getElementById('product-page'); // matches your HTML id
  if (heroBtn && productsSection) {
    heroBtn.addEventListener('click', () => {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // for all navbar internal links (#...)
  document.querySelectorAll('.navbar-links a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ====== CART STORAGE, ADD, COUNT, NOTIFICATION ====== */
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartCounter = document.getElementById('cart-count');
  const cartIcon = document.getElementById('cart-icon');

  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount() {
    if (cartCounter) cartCounter.textContent = cart.length;
  }

  function showNotification(msg) {
    const alertBox = document.createElement('div');
    alertBox.textContent = msg;
    alertBox.style.position = 'fixed';
    alertBox.style.bottom = '18px';
    alertBox.style.right = '18px';
    alertBox.style.background = '#c69b8f';
    alertBox.style.color = 'white';
    alertBox.style.padding = '10px 14px';
    alertBox.style.borderRadius = '8px';
    alertBox.style.zIndex = '99999';
    alertBox.style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
    document.body.appendChild(alertBox);
    setTimeout(() => {
      alertBox.style.transition = 'opacity 300ms';
      alertBox.style.opacity = '0';
      setTimeout(() => alertBox.remove(), 350);
    }, 1200);
  }

  // delegated listener for add-to-cart buttons
  document.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('.add-to-cart')) {
      const btn = e.target.closest('.add-to-cart');
      const productEl = btn.closest('.product');
      if (!productEl) return;
      const titleEl = productEl.querySelector('h3');
      const priceEl = productEl.querySelector('p');
      const imgEl = productEl.querySelector('img');

      const item = {
        title: titleEl ? titleEl.textContent.trim() : 'Product',
        price: priceEl ? priceEl.textContent.trim() : '$0.00',
        image: imgEl ? imgEl.src : ''
      };

      cart.push(item);
      saveCart();
      showNotification(`${item.title} added to cart`);
    }
  });

  updateCartCount();

  /* ====== CART MODAL (open, close, render, remove, clear) ====== */
  const cartModal = document.getElementById('cart-modal');
  const closeCartBtn = document.querySelector('.close-cart');
  const cartItemsContainer = document.getElementById('cart-items');
  const totalDisplay = document.getElementById('total-price');
  const clearCartBtn = document.getElementById('clear-cart');

  // open modal when cart icon clicked
  if (cartIcon && cartModal) {
    cartIcon.addEventListener('click', () => {
      renderCartModal();
      cartModal.style.display = 'flex';
      // prevent background scroll
      document.body.style.overflow = 'hidden';
    });
  }

  // close modal
  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => {
      cartModal.style.display = 'none';
      document.body.style.overflow = '';
    });
  }

  // click outside modal content to close
  window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
      cartModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });

  function calculateTotal() {
    return cart.reduce((sum, it) => sum + parseFloat(String(it.price).replace('$', '')) , 0);
  }

  function renderCartModal() {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty">Your cart is empty.</p>';
      if (totalDisplay) totalDisplay.textContent = '0.00';
      return;
    }

    cart.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${item.image}" alt="${item.title}">
        <div class="info">
          <h4>${item.title}</h4>
          <p>${item.price}</p>
        </div>
        <button class="remove-btn" data-index="${idx}" aria-label="Remove item">
          <i class="fa fa-trash"></i>
        </button>
      `;
      cartItemsContainer.appendChild(div);
    });

    if (totalDisplay) totalDisplay.textContent = calculateTotal().toFixed(2);

    // attach remove listeners
    cartItemsContainer.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = Number(btn.dataset.index);
        if (!Number.isNaN(index)) {
          cart.splice(index, 1);
          saveCart();
          renderCartModal();
        }
      });
    });

    // clear all
    if (clearCartBtn) {
      clearCartBtn.onclick = () => {
        if (confirm('Are you sure you want to clear your cart?')) {
          cart = [];
          saveCart();
          renderCartModal();
        }
      };
    }
  }

  /* ====== TESTIMONIALS CAROUSEL (responsive arrows + resize) ====== */
  
  

  const track = document.querySelector(".carousel-track");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const cards = document.querySelectorAll(".carousel-track .card");

  if (!track || !prevBtn || !nextBtn || cards.length === 0) return;

  let index = 0;

  function moveCarousel() {
    const cardWidth = cards[0].offsetWidth + 20; // gap must match CSS
    track.style.transform = `translateX(-${index * cardWidth}px)`;
  }

  nextBtn.addEventListener("click", () => {
    index++;
    if(index >= cards.length) index = 0;
    moveCarousel();
  });

  prevBtn.addEventListener("click", () => {
    index--;
    if(index < 0) index = cards.length -1;
    moveCarousel();
  });

  window.addEventListener("resize", moveCarousel);

  // Optional autoplay
  // setInterval(() => {
  //   index++;
  //   if(index >= cards.length) index=0;
  //   moveCarousel();
  // }, 2000);

});
