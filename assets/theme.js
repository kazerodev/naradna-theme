// NARADNA THEME — theme.js

// ---- TOAST ----
function showToast(msg) {
  var toast = document.getElementById('cart-toast');
  if (!toast) return;
  var msgEl = toast.querySelector('.cart-toast__msg');
  if (msgEl && msg) msgEl.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function() { toast.classList.remove('show'); }, 2600);
}

// ---- ADD TO CART (shared) ----
function addToCartHandler(btn, variantId, qty) {
  if (!variantId) return;
  var originalHTML = btn.innerHTML;
  btn.innerHTML = 'Anadiendo...';
  btn.disabled = true;
  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: variantId, quantity: qty || 1 })
  })
    .then(function(r) { return r.json(); })
    .then(function() {
      btn.innerHTML = 'Anadido &#10003;';
      showToast('Anadido al carrito');
      setTimeout(function() { btn.innerHTML = originalHTML; btn.disabled = false; }, 1800);
      if (typeof openCart === 'function') openCart();
    })
    .catch(function() { btn.innerHTML = originalHTML; btn.disabled = false; });
}

// ---- LIGHTBOX ----
var lightbox = null;
function openLightbox(src, alt) {
  if (!lightbox) return;
  var img = lightbox.querySelector('.lightbox__img');
  img.src = src;
  img.alt = alt || '';
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(function() { var img = lightbox.querySelector('.lightbox__img'); if (img) img.src = ''; }, 320);
}

// ---- CART STATE ----
var openCart, closeCart;

document.addEventListener('DOMContentLoaded', function () {

  // ---- AOS ----
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 700, once: true, easing: 'ease-out-quad', offset: 50 });
  }

  // ---- SWIPER — Product Gallery ----
  if (typeof Swiper !== 'undefined') {
    var thumbsEl = document.querySelector('.product-gallery-thumbs');
    var mainEl = document.querySelector('.product-gallery-swiper');
    if (mainEl) {
      var thumbSwiper = null;
      if (thumbsEl) {
        thumbSwiper = new Swiper('.product-gallery-thumbs', {
          spaceBetween: 8,
          slidesPerView: 'auto',
          freeMode: true,
          watchSlidesProgress: true,
        });
      }
      new Swiper('.product-gallery-swiper', {
        spaceBetween: 0,
        loop: false,
        keyboard: { enabled: true },
        a11y: { enabled: true },
        thumbs: thumbSwiper ? { swiper: thumbSwiper } : undefined,
      });
    }
  }

  // ---- LIGHTBOX INIT ----
  lightbox = document.getElementById('lightbox');
  if (lightbox) {
    var lbClose = lightbox.querySelector('.lightbox__close');
    var lbBd = lightbox.querySelector('.lightbox__backdrop');
    lbClose && lbClose.addEventListener('click', closeLightbox);
    lbBd && lbBd.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeLightbox(); });

    // Click on product gallery slide to open lightbox
    var gallerySwiper = document.querySelector('.product-gallery-swiper');
    if (gallerySwiper) {
      gallerySwiper.addEventListener('click', function() {
        var activeSlide = this.querySelector('.swiper-slide-active .product-gallery__slide');
        if (!activeSlide) return;
        var fullSrc = activeSlide.dataset.full;
        var img = activeSlide.querySelector('img');
        if (fullSrc) openLightbox(fullSrc, img ? img.alt : '');
      });
    }
  }

  // ---- MOBILE MENU ----
  var menuBtn = document.querySelector('.header__menu-btn');
  var mobileMenu = document.querySelector('.mobile-menu');
  var mobileOverlay = document.querySelector('.mobile-overlay');
  var menuClose = document.querySelector('.mobile-menu__close');
  function doOpenMenu() { mobileMenu && mobileMenu.classList.add('open'); mobileOverlay && mobileOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function doCloseMenu() { mobileMenu && mobileMenu.classList.remove('open'); mobileOverlay && mobileOverlay.classList.remove('open'); document.body.style.overflow = ''; }
  menuBtn && menuBtn.addEventListener('click', doOpenMenu);
  menuClose && menuClose.addEventListener('click', doCloseMenu);
  mobileOverlay && mobileOverlay.addEventListener('click', doCloseMenu);

  // ---- CART DRAWER ----
  var cartDrawer = document.querySelector('.cart-drawer');
  var cartOverlay = document.querySelector('.cart-overlay');
  var cartClose = document.querySelector('.cart-drawer__close');
  openCart = function() {
    cartDrawer && cartDrawer.classList.add('open');
    cartOverlay && cartOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    fetchCart();
  };
  closeCart = function() {
    cartDrawer && cartDrawer.classList.remove('open');
    cartOverlay && cartOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  };
  document.querySelectorAll('.header__cart-btn').forEach(function(btn) { btn.addEventListener('click', openCart); });
  cartClose && cartClose.addEventListener('click', closeCart);
  cartOverlay && cartOverlay.addEventListener('click', closeCart);

  function fetchCart() {
    fetch('/cart.js').then(function(r) { return r.json(); }).then(renderCartDrawer);
  }
  function renderCartDrawer(cart) {
    var content = document.getElementById('cart-drawer-content');
    if (!content) return;
    updateCartCount(cart.item_count);
    if (cart.item_count === 0) {
      content.innerHTML = '<div class="cart-drawer__empty"><p>Tu carrito esta vacio</p></div>';
      var footer = document.getElementById('cart-drawer-footer');
      if (footer) footer.innerHTML = '';
      return;
    }
    var html = '';
    cart.items.forEach(function(item) {
      html += '<div class="cart-item">' +
        '<img src="' + item.image + '" alt="' + item.product_title + '" class="cart-item__image">' +
        '<div><div class="cart-item__title">' + item.product_title + '</div>' +
        '<div class="cart-item__price">' + formatMoney(item.final_price) + '</div>' +
        '<div class="cart-item__qty">Cantidad: ' + item.quantity + '</div></div>' +
        '<button class="cart-item__remove" aria-label="Eliminar" onclick="removeCartItem(\'' + item.key + '\')">&#10005;</button>' +
        '</div>';
    });
    content.innerHTML = html;
    var footer = document.getElementById('cart-drawer-footer');
    if (footer) {
      footer.innerHTML =
        '<div class="cart-drawer__total"><span>Total</span><span>' + formatMoney(cart.total_price) + '</span></div>' +
        '<div class="cart-drawer__shipping-msg">&#10003; Envio gratis incluido</div>' +
        '<a href="/checkout" class="btn btn--primary btn--full">Comprar ahora</a>' +
        '<a href="/cart" class="btn btn--outline btn--full" style="margin-top:8px">Ver carrito</a>';
    }
  }
  function updateCartCount(count) {
    document.querySelectorAll('.header__cart-count').forEach(function(el) {
      var prev = parseInt(el.textContent) || 0;
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
      if (count > prev) {
        el.classList.remove('bounce');
        void el.offsetWidth;
        el.classList.add('bounce');
        setTimeout(function() { el.classList.remove('bounce'); }, 500);
      }
    });
  }
  function formatMoney(cents) { return (cents / 100).toFixed(2).replace('.', ',') + ' €'; }
  window.removeCartItem = function(key) {
    fetch('/cart/change.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: key, quantity: 0 }) })
      .then(function() { fetchCart(); });
  };
  fetchCart();

  // ---- ADD TO CART ----
  document.querySelectorAll('.add-to-cart-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var form = this.closest('form');
      var variantId = form && form.querySelector('[name="id"]') ? form.querySelector('[name="id"]').value : this.dataset.variantId;
      var qty = form ? parseInt((form.querySelector('[name="quantity"]') || { value: 1 }).value) : 1;
      addToCartHandler(this, variantId, qty);
    });
  });

  // ---- QUICK ADD ----
  document.querySelectorAll('.product-card__btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault(); e.stopPropagation();
      var variantId = this.dataset.variantId;
      if (!variantId) { window.location = this.dataset.url; return; }
      addToCartHandler(this, variantId, 1);
    });
  });

  // ---- STICKY ATC ----
  var mainAtcBtn = document.getElementById('MainAtcBtn');
  var stickyAtc = document.getElementById('sticky-atc');
  if (mainAtcBtn && stickyAtc) {
    var stickyObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        stickyAtc.classList.toggle('visible', !entry.isIntersecting);
        stickyAtc.setAttribute('aria-hidden', String(entry.isIntersecting));
      });
    }, { threshold: 0 });
    stickyObs.observe(mainAtcBtn);
    var stickyBtn = stickyAtc.querySelector('.sticky-atc__btn');
    stickyBtn && stickyBtn.addEventListener('click', function() {
      addToCartHandler(this, this.dataset.variantId, 1);
    });
  }

  // ---- QUANTITY SELECTOR ----
  document.querySelectorAll('.quantity-selector').forEach(function(sel) {
    var input = sel.querySelector('input');
    sel.querySelector('.qty-minus') && sel.querySelector('.qty-minus').addEventListener('click', function() {
      if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
    });
    sel.querySelector('.qty-plus') && sel.querySelector('.qty-plus').addEventListener('click', function() {
      input.value = parseInt(input.value) + 1;
    });
  });

  // ---- COLLECTION FILTERS ----
  document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      var tag = this.dataset.tag;
      document.querySelectorAll('.product-card').forEach(function(card) {
        var wrapper = card.closest('.product-card-wrapper') || card.parentElement;
        if (!tag || tag === 'all') { wrapper.style.removeProperty('display'); }
        else { wrapper.style.display = (card.dataset.tags || '').includes(tag) ? '' : 'none'; }
      });
    });
  });

  // ---- SCROLL PROGRESS ----
  var progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', function() {
      var total = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
    }, { passive: true });
  }

  // ---- BACK TO TOP ----
  var backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      backToTop.classList.toggle('visible', window.scrollY > 480);
    }, { passive: true });
    backToTop.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  // ---- HERO COUNTER (data-count) ----
  document.querySelectorAll('[data-count]').forEach(function(el) {
    var target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    var start = performance.now();
    var dur = 1200;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(ease * target);
      if (p < 1) requestAnimationFrame(tick);
    }
    setTimeout(function() { requestAnimationFrame(tick); }, 700);
  });

  // ---- SHIPPING COUNTDOWN ----
  var countdownEl = document.getElementById('ship-countdown');
  if (countdownEl) {
    function updateCountdown() {
      var now = new Date();
      var cutoff = new Date();
      cutoff.setHours(17, 0, 0, 0);
      if (now >= cutoff) cutoff.setDate(cutoff.getDate() + 1);
      var diff = cutoff - now;
      var h = Math.floor(diff / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      countdownEl.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
    }
    function pad(n) { return String(n).padStart(2, '0'); }
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ---- LIVE VIEWERS (social proof) ----
  var viewersEl = document.getElementById('viewers-count');
  if (viewersEl) {
    function randomViewers() {
      return Math.floor(Math.random() * 9) + 4; // 4-12
    }
    viewersEl.textContent = randomViewers();
    setInterval(function() {
      var el = document.getElementById('viewers-count');
      if (el) el.textContent = randomViewers();
    }, 7000);
  }

  // ---- 3D CARD TILT (desktop only) ----
  var canHover = window.matchMedia('(hover: hover)').matches;
  if (canHover) {
    document.querySelectorAll('.product-card').forEach(function(card) {
      card.addEventListener('mouseenter', function() {
        this.style.transition = 'box-shadow 0.2s ease';
      });
      card.addEventListener('mousemove', function(e) {
        var rect = this.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        var rx = (y - cy) / cy * -5;
        var ry = (x - cx) / cx * 5;
        this.style.transform = 'perspective(700px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-6px) scale(1.01)';
      });
      card.addEventListener('mouseleave', function() {
        this.style.transition = 'transform 0.5s ease, box-shadow 0.4s ease';
        this.style.transform = '';
      });
    });
  }

  // ---- DESCRIPTION EXPAND (mobile) ----
  var desc = document.querySelector('.product-info__description');
  if (desc && window.innerWidth < 768 && desc.scrollHeight > 130) {
    desc.classList.add('is-truncated');
    var expandBtn = document.createElement('button');
    expandBtn.className = 'desc-expand-btn';
    expandBtn.textContent = 'Leer mas +';
    expandBtn.addEventListener('click', function() {
      var isOpen = !desc.classList.contains('is-truncated');
      desc.classList.toggle('is-truncated', isOpen);
      this.textContent = isOpen ? 'Leer mas +' : 'Leer menos -';
    });
    desc.after(expandBtn);
  }

});
