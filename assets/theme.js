// NARADNA THEME — theme.js

// ---- TOAST ----
function showToast(msg) {
  var toast = document.getElementById('cart-toast');
  if (!toast) return;
  var msgEl = toast.querySelector('.cart-toast__msg');
  if (msgEl && msg) msgEl.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function() { toast.classList.remove('show'); }, 2400);
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

// ---- CART STATE ----
var openCart, closeCart;

document.addEventListener('DOMContentLoaded', function () {

  // ---- AOS ----
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 680, once: true, easing: 'ease-out-quad', offset: 50 });
  }

  // ---- SCROLL PROGRESS BAR ----
  var progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', function() {
      var scrolled = window.scrollY;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
    }, { passive: true });
  }

  // ---- BACK TO TOP ----
  var backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      backToTop.classList.toggle('visible', window.scrollY > 480);
    }, { passive: true });
    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
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
        on: {
          slideChange: function () {
            // sync pagination visibility
          }
        }
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
        void el.offsetWidth; // reflow
        el.classList.add('bounce');
        setTimeout(function() { el.classList.remove('bounce'); }, 500);
      }
    });
  }

  function formatMoney(cents) {
    return (cents / 100).toFixed(2).replace('.', ',') + ' €';
  }

  window.removeCartItem = function(key) {
    fetch('/cart/change.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: key, quantity: 0 }) })
      .then(function() { fetchCart(); });
  };

  fetchCart();

  // ---- ADD TO CART — Main form ----
  document.querySelectorAll('.add-to-cart-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var form = this.closest('form');
      var variantId = form ? form.querySelector('[name="id"]') && form.querySelector('[name="id"]').value : this.dataset.variantId;
      var qty = form ? parseInt((form.querySelector('[name="quantity"]') || { value: 1 }).value) : 1;
      addToCartHandler(this, variantId, qty);
    });
  });

  // ---- QUICK ADD — Product cards ----
  document.querySelectorAll('.product-card__btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault(); e.stopPropagation();
      var variantId = this.dataset.variantId;
      if (!variantId) { window.location = this.dataset.url; return; }
      addToCartHandler(this, variantId, 1);
    });
  });

  // ---- STICKY ATC — Product page ----
  var mainAtcBtn = document.getElementById('MainAtcBtn');
  var stickyAtc = document.getElementById('sticky-atc');
  if (mainAtcBtn && stickyAtc) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        stickyAtc.classList.toggle('visible', !entry.isIntersecting);
        stickyAtc.setAttribute('aria-hidden', String(entry.isIntersecting));
      });
    }, { threshold: 0 });
    observer.observe(mainAtcBtn);

    var stickyBtn = stickyAtc.querySelector('.sticky-atc__btn');
    stickyBtn && stickyBtn.addEventListener('click', function() {
      addToCartHandler(this, this.dataset.variantId, 1);
    });
  }

  // ---- QUANTITY SELECTOR ----
  document.querySelectorAll('.quantity-selector').forEach(function(selector) {
    var input = selector.querySelector('input');
    selector.querySelector('.qty-minus') && selector.querySelector('.qty-minus').addEventListener('click', function() {
      if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
    });
    selector.querySelector('.qty-plus') && selector.querySelector('.qty-plus').addEventListener('click', function() {
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
        if (!tag || tag === 'all') {
          wrapper.style.removeProperty('display');
        } else {
          wrapper.style.display = (card.dataset.tags || '').includes(tag) ? '' : 'none';
        }
      });
    });
  });

});
