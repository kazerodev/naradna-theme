// NARADNA THEME — theme.js v3
(function () {
  'use strict';

  var isMobile = window.matchMedia('(max-width: 767px)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =============================================
     HERO PARALLAX
  ============================================= */
  function initParallax() {
    var heroBg = document.querySelector('.hero__bg');
    if (!heroBg || reduceMotion) return;
    window.addEventListener('scroll', function () {
      heroBg.style.transform = 'translateY(' + (window.scrollY * 0.32) + 'px)';
    }, { passive: true });
  }

  /* =============================================
     REVIEW SECTION: stars + score counter
  ============================================= */
  function initReviewAnimations() {
    var starsEl = document.querySelector('.reviews-overall__stars');
    var scoreEl = document.querySelector('.reviews-overall__score');
    if (!starsEl && !scoreEl) return;

    // Wrap each star in a span for per-star animation
    if (starsEl && !starsEl.querySelector('span')) {
      starsEl.innerHTML = starsEl.textContent.split('').map(function (ch) {
        return '<span>' + ch + '</span>';
      }).join('');
    }

    var targetScore = scoreEl ? parseFloat(scoreEl.textContent) : 0;
    var obs = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();

      // Stars pop in
      if (starsEl) starsEl.classList.add('animate');

      // Score counter
      if (scoreEl && !reduceMotion) {
        var start = performance.now(), dur = 1200;
        function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var ease = 1 - Math.pow(1 - p, 3);
          scoreEl.textContent = (ease * targetScore).toFixed(1) + ' de 5';
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });

    var section = document.querySelector('.reviews-section') || (starsEl && starsEl.closest('section'));
    if (section) obs.observe(section);
  }

  /* =============================================
     NOISE TEXTURE
  ============================================= */
  (function () {
    if (reduceMotion) return;
    try {
      var c = document.createElement('canvas');
      c.width = c.height = 200;
      var ctx = c.getContext('2d');
      var id = ctx.createImageData(200, 200);
      for (var i = 0; i < id.data.length; i += 4) {
        var v = Math.floor(Math.random() * 255);
        id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
        id.data[i + 3] = 18;
      }
      ctx.putImageData(id, 0, 0);
      var noiseEl = document.createElement('div');
      noiseEl.setAttribute('aria-hidden', 'true');
      noiseEl.style.cssText = 'position:fixed;inset:0;z-index:9985;pointer-events:none;background-image:url(' + c.toDataURL() + ');background-size:200px 200px;opacity:0.032;';
      document.body.appendChild(noiseEl);
    } catch (e) {}
  })();

  /* =============================================
     CURSOR ORB (ambient light that follows mouse)
  ============================================= */
  var orbEl = null;
  function initCursorOrb() {
    if (!canHover || reduceMotion) return;
    orbEl = document.createElement('div');
    orbEl.className = 'cursor-orb';
    orbEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(orbEl);
    document.addEventListener('mousemove', function (e) {
      orbEl.style.left = e.clientX + 'px';
      orbEl.style.top = e.clientY + 'px';
    }, { passive: true });
  }

  /* =============================================
     CUSTOM CURSOR
  ============================================= */
  var cursor = { dot: null, ring: null, x: -200, y: -200, rx: -200, ry: -200, raf: null };

  function initCursor() {
    if (!canHover) return;

    cursor.dot = document.createElement('div');
    cursor.dot.className = 'cursor-dot';
    cursor.dot.setAttribute('aria-hidden', 'true');
    cursor.ring = document.createElement('div');
    cursor.ring.className = 'cursor-ring';
    cursor.ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor.dot);
    document.body.appendChild(cursor.ring);

    document.addEventListener('mousemove', function (e) {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
      cursor.dot.style.left = e.clientX + 'px';
      cursor.dot.style.top = e.clientY + 'px';
    }, { passive: true });

    document.addEventListener('mousedown', function () {
      cursor.dot.classList.add('is-clicking');
      cursor.ring.classList.add('is-clicking');
    });
    document.addEventListener('mouseup', function () {
      cursor.dot.classList.remove('is-clicking');
      cursor.ring.classList.remove('is-clicking');
    });

    (function animRing() {
      cursor.rx += (cursor.x - cursor.rx) * 0.1;
      cursor.ry += (cursor.y - cursor.ry) * 0.1;
      if (cursor.ring) {
        cursor.ring.style.left = cursor.rx + 'px';
        cursor.ring.style.top = cursor.ry + 'px';
      }
      requestAnimationFrame(animRing);
    })();

    bindCursorHovers();

    new MutationObserver(function () {
      document.querySelectorAll('[data-cursor-unset]').forEach(function (el) {
        el.removeAttribute('data-cursor-unset');
        addCursorHover(el);
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  function bindCursorHovers() {
    var sel = 'a, button, [role="button"], input, select, label, .product-card, .filter-btn, .footer__payment-badge';
    document.querySelectorAll(sel).forEach(addCursorHover);
  }

  function addCursorHover(el) {
    if (el._cursorBound) return;
    el._cursorBound = true;
    el.addEventListener('mouseenter', function () {
      if (cursor.dot) cursor.dot.classList.add('is-hovering');
      if (cursor.ring) cursor.ring.classList.add('is-hovering');
    });
    el.addEventListener('mouseleave', function () {
      if (cursor.dot) cursor.dot.classList.remove('is-hovering');
      if (cursor.ring) cursor.ring.classList.remove('is-hovering');
    });
  }

  /* =============================================
     MAGNETIC BUTTONS
  ============================================= */
  function initMagnetic() {
    if (!canHover || reduceMotion) return;
    var sel = '.btn--primary, .add-to-cart-btn, .sticky-atc__btn, .header__cart-btn, .newsletter-form button';
    document.querySelectorAll(sel).forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.3;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
        el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }

  /* =============================================
     RIPPLE EFFECT
  ============================================= */
  function initRipple() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('button, .btn, .filter-btn');
      if (!el) return;
      var r = el.getBoundingClientRect();
      var size = Math.max(r.width, r.height) * 2.2;
      var ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (e.clientX - r.left - size / 2) + 'px;top:' + (e.clientY - r.top - size / 2) + 'px;';
      el.style.position = 'relative';
      el.style.overflow = 'hidden';
      el.appendChild(ripple);
      ripple.addEventListener('animationend', function () { ripple.remove(); }, { once: true });
    });
  }

  /* =============================================
     CARD DYNAMIC GLOW + TILT
  ============================================= */
  function initCards() {
    document.querySelectorAll('.product-card').forEach(function (card) {
      if (!card.querySelector('.product-card__glow')) {
        var glow = document.createElement('div');
        glow.className = 'product-card__glow';
        glow.setAttribute('aria-hidden', 'true');
        card.appendChild(glow);
      }
      if (!canHover) return;

      card.addEventListener('mouseenter', function () {
        card._transitionOff = true;
      });

      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = e.clientX - r.left;
        var y = e.clientY - r.top;
        var gxPct = (x / r.width * 100).toFixed(1);
        var gyPct = (y / r.height * 100).toFixed(1);
        card.style.setProperty('--gx', gxPct + '%');
        card.style.setProperty('--gy', gyPct + '%');

        if (!reduceMotion) {
          var cx = r.width / 2, cy = r.height / 2;
          var rx = ((y - cy) / cy) * -6;
          var ry = ((x - cx) / cx) * 6;
          if (card._transitionOff) {
            card.style.transition = 'box-shadow 0.2s ease';
            card._transitionOff = false;
          }
          card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-8px) scale(1.02)';
        }
      });

      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1), box-shadow 0.45s ease';
        card.style.transform = '';
      });
    });
  }

  /* =============================================
     TEXT REVEALS (clip-path / translateY)
  ============================================= */
  function initTextReveal() {
    if (reduceMotion) return;
    var sel = '.section__title, .hero__title, .collection-header__title, .page__title';
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (!el.querySelector('.reveal-inner')) {
          var inner = document.createElement('span');
          inner.className = 'reveal-inner';
          inner.innerHTML = el.innerHTML;
          el.innerHTML = '';
          el.appendChild(inner);
          el.classList.add('reveal-text');
        }
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            el.classList.add('is-visible');
          });
        });
        obs.unobserve(el);
      });
    }, { threshold: 0.25 });

    document.querySelectorAll(sel).forEach(function (el) { obs.observe(el); });
  }

  /* =============================================
     SCROLL REVEAL (data-reveal auto-applied)
  ============================================= */
  function initScrollReveal() {
    if (isMobile) return;
    var selectors = [
      '.review-card', '.trust-item', '.brand-section__text',
      '.section__subtitle', '.footer__top > div', '.newsletter-section .section__subtitle'
    ];
    var els = document.querySelectorAll(selectors.join(','));
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

    els.forEach(function (el, i) {
      if (!el.hasAttribute('data-reveal')) {
        el.setAttribute('data-reveal', '1');
        var delay = i % 4;
        if (delay > 0) el.setAttribute('data-reveal-delay', String(delay));
      }
      obs.observe(el);
    });
  }

  /* =============================================
     BURST PARTICLES (gold explosion on ATC)
  ============================================= */
  function burstParticles(x, y) {
    if (reduceMotion) return;
    var colors = ['#c9a96e', '#e8c87a', '#fffdf8', '#b8935a', '#f0d898'];
    var count = 14;
    for (var i = 0; i < count; i++) {
      var el = document.createElement('div');
      el.className = 'burst-particle';
      var angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      var dist = 45 + Math.random() * 65;
      el.style.cssText = [
        'left:' + x + 'px',
        'top:' + y + 'px',
        'background:' + colors[i % colors.length],
        '--bx:' + (Math.cos(angle) * dist).toFixed(1) + 'px',
        '--by:' + (Math.sin(angle) * dist).toFixed(1) + 'px',
        'width:' + (3 + Math.random() * 5).toFixed(1) + 'px',
        'height:' + (3 + Math.random() * 5).toFixed(1) + 'px',
        'animation-duration:' + (0.55 + Math.random() * 0.3).toFixed(2) + 's'
      ].join(';');
      document.body.appendChild(el);
      el.addEventListener('animationend', function () { this.remove(); }, { once: true });
    }
  }

  /* =============================================
     ANNOUNCEMENT TICKER
  ============================================= */
  function initTicker() {
    var bar = document.querySelector('.announcement-bar');
    if (!bar) return;
    var text = bar.textContent.trim();
    if (!text) return;
    var sep = ' &nbsp;&nbsp;✦&nbsp;&nbsp; ';
    var repeated = text + sep + text + sep + text + sep;
    bar.innerHTML = '<div class="announcement-ticker" aria-label="' + text + '"><span>' + repeated + '</span><span aria-hidden="true">' + repeated + '</span></div>';
  }

  /* =============================================
     HEADER NAV: animated underline
  ============================================= */
  function initNavLinks() {
    document.querySelectorAll('.header__nav a').forEach(function (link) {
      if (window.location.pathname === link.getAttribute('href')) {
        link.classList.add('active');
      }
    });
  }

  /* =============================================
     TOAST
  ============================================= */
  function showToast(msg) {
    var toast = document.getElementById('cart-toast');
    if (!toast) return;
    var msgEl = toast.querySelector('.cart-toast__msg');
    if (msgEl && msg) msgEl.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () { toast.classList.remove('show'); }, 2800);
  }

  /* =============================================
     ADD TO CART (shared)
  ============================================= */
  function addToCartHandler(btn, variantId, qty) {
    if (!variantId) return;
    var originalHTML = btn.innerHTML;
    var r = btn.getBoundingClientRect();
    btn.innerHTML = '<span>Anadiendo</span><span class="btn-dots"><span>.</span><span>.</span><span>.</span></span>';
    btn.disabled = true;

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: qty || 1 })
    })
      .then(function (res) { return res.json(); })
      .then(function () {
        btn.innerHTML = '&#10003; Anadido';
        burstParticles(r.left + r.width / 2, r.top + r.height / 2);
        showToast('Anadido al carrito');
        setTimeout(function () { btn.innerHTML = originalHTML; btn.disabled = false; }, 1800);
        if (typeof openCart === 'function') openCart();
      })
      .catch(function () { btn.innerHTML = originalHTML; btn.disabled = false; });
  }

  /* =============================================
     LIGHTBOX
  ============================================= */
  var lightbox = null;
  function openLightbox(src, alt) {
    if (!lightbox) return;
    var img = lightbox.querySelector('.lightbox__img');
    img.src = src; img.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function () {
      var img = lightbox && lightbox.querySelector('.lightbox__img');
      if (img) img.src = '';
    }, 320);
  }

  /* =============================================
     CART
  ============================================= */
  var openCart, closeCart;

  /* =============================================
     DOM READY
  ============================================= */
  document.addEventListener('DOMContentLoaded', function () {

    initParallax();
    initCursorOrb();
    initCursor();
    initMagnetic();
    initRipple();
    initCards();
    initTextReveal();
    initScrollReveal();
    initTicker();
    initNavLinks();
    initReviewAnimations();

    // ---- AOS ----
    if (typeof AOS !== 'undefined') {
      AOS.init({ duration: 750, once: true, easing: 'ease-out-quart', offset: 40 });
    }

    // ---- SWIPER ----
    if (typeof Swiper !== 'undefined') {
      var thumbsEl = document.querySelector('.product-gallery-thumbs');
      var mainEl = document.querySelector('.product-gallery-swiper');
      if (mainEl) {
        var thumbSwiper = null;
        if (thumbsEl) {
          thumbSwiper = new Swiper('.product-gallery-thumbs', {
            spaceBetween: 8, slidesPerView: 'auto',
            freeMode: true, watchSlidesProgress: true
          });
        }
        new Swiper('.product-gallery-swiper', {
          spaceBetween: 0, loop: false,
          keyboard: { enabled: true },
          a11y: { enabled: true },
          thumbs: thumbSwiper ? { swiper: thumbSwiper } : undefined
        });
      }
    }

    // ---- LIGHTBOX ----
    lightbox = document.getElementById('lightbox');
    if (lightbox) {
      var lbClose = lightbox.querySelector('.lightbox__close');
      var lbBd = lightbox.querySelector('.lightbox__backdrop');
      lbClose && lbClose.addEventListener('click', closeLightbox);
      lbBd && lbBd.addEventListener('click', closeLightbox);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });
      var galSwiper = document.querySelector('.product-gallery-swiper');
      if (galSwiper) {
        galSwiper.addEventListener('click', function () {
          var active = this.querySelector('.swiper-slide-active .product-gallery__slide');
          if (!active) return;
          var src = active.dataset.full;
          var img = active.querySelector('img');
          if (src) openLightbox(src, img ? img.alt : '');
        });
      }
    }

    // ---- MOBILE MENU ----
    var menuBtn = document.querySelector('.header__menu-btn');
    var mobileMenu = document.querySelector('.mobile-menu');
    var mobileOverlay = document.querySelector('.mobile-overlay');
    var menuClose = document.querySelector('.mobile-menu__close');
    function doOpenMenu() {
      mobileMenu && mobileMenu.classList.add('open');
      mobileOverlay && mobileOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function doCloseMenu() {
      mobileMenu && mobileMenu.classList.remove('open');
      mobileOverlay && mobileOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    menuBtn && menuBtn.addEventListener('click', doOpenMenu);
    menuClose && menuClose.addEventListener('click', doCloseMenu);
    mobileOverlay && mobileOverlay.addEventListener('click', doCloseMenu);

    // ---- CART DRAWER ----
    var cartDrawer = document.querySelector('.cart-drawer');
    var cartOverlay = document.querySelector('.cart-overlay');
    var cartClose = document.querySelector('.cart-drawer__close');
    openCart = function () {
      cartDrawer && cartDrawer.classList.add('open');
      cartOverlay && cartOverlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      fetchCart();
    };
    closeCart = function () {
      cartDrawer && cartDrawer.classList.remove('open');
      cartOverlay && cartOverlay.classList.add('hidden');
      document.body.style.overflow = '';
    };
    document.querySelectorAll('.header__cart-btn').forEach(function (btn) {
      btn.addEventListener('click', openCart);
    });
    cartClose && cartClose.addEventListener('click', closeCart);
    cartOverlay && cartOverlay.addEventListener('click', closeCart);

    function fetchCart() {
      fetch('/cart.js').then(function (r) { return r.json(); }).then(renderCartDrawer);
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
      cart.items.forEach(function (item) {
        html += '<div class="cart-item">' +
          '<img src="' + item.image + '" alt="' + item.product_title + '" class="cart-item__image" loading="lazy">' +
          '<div>' +
          '<div class="cart-item__title">' + item.product_title + '</div>' +
          '<div class="cart-item__price">' + formatMoney(item.final_price) + '</div>' +
          '<div class="cart-item__qty">Cantidad: ' + item.quantity + '</div>' +
          '</div>' +
          '<button class="cart-item__remove" aria-label="Eliminar" data-key="' + item.key + '">&#10005;</button>' +
          '</div>';
      });
      content.innerHTML = html;
      content.querySelectorAll('.cart-item__remove').forEach(function (btn) {
        btn.addEventListener('click', function () { removeCartItem(this.dataset.key); });
      });
      var foot = document.getElementById('cart-drawer-footer');
      if (foot) {
        foot.innerHTML =
          '<div class="cart-drawer__total"><span>Total</span><span>' + formatMoney(cart.total_price) + '</span></div>' +
          '<div class="cart-drawer__shipping-msg">&#10003; Envio gratis incluido</div>' +
          '<a href="/checkout" class="btn btn--primary btn--full">Comprar ahora</a>' +
          '<a href="/cart" class="btn btn--outline btn--full" style="margin-top:8px">Ver carrito</a>';
      }
    }
    function updateCartCount(count) {
      document.querySelectorAll('.header__cart-count').forEach(function (el) {
        var prev = parseInt(el.textContent) || 0;
        el.textContent = count;
        el.style.display = count > 0 ? 'flex' : 'none';
        if (count > prev) {
          el.classList.remove('bounce'); void el.offsetWidth; el.classList.add('bounce');
          setTimeout(function () { el.classList.remove('bounce'); }, 500);
        }
      });
    }
    function formatMoney(cents) { return (cents / 100).toFixed(2).replace('.', ',') + ' €'; }
    function removeCartItem(key) {
      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: 0 })
      }).then(function () { fetchCart(); });
    }
    fetchCart();

    // ---- ADD TO CART ----
    document.querySelectorAll('.add-to-cart-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var form = this.closest('form');
        var id = form && form.querySelector('[name="id"]') ? form.querySelector('[name="id"]').value : this.dataset.variantId;
        var qty = form ? parseInt((form.querySelector('[name="quantity"]') || {}).value || 1) : 1;
        addToCartHandler(this, id, qty);
      });
    });

    // ---- QUICK ADD ----
    document.querySelectorAll('.product-card__btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var id = this.dataset.variantId;
        if (!id) { window.location.href = this.dataset.url; return; }
        addToCartHandler(this, id, 1);
      });
    });

    // ---- STICKY ATC ----
    var mainAtcBtn = document.getElementById('MainAtcBtn');
    var stickyAtc = document.getElementById('sticky-atc');
    if (mainAtcBtn && stickyAtc) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          stickyAtc.classList.toggle('visible', !entry.isIntersecting);
          stickyAtc.setAttribute('aria-hidden', String(entry.isIntersecting));
        });
      }, { threshold: 0 }).observe(mainAtcBtn);
      var stickyBtn = stickyAtc.querySelector('.sticky-atc__btn');
      stickyBtn && stickyBtn.addEventListener('click', function () {
        addToCartHandler(this, this.dataset.variantId, 1);
      });
    }

    // ---- QUANTITY ----
    document.querySelectorAll('.quantity-selector').forEach(function (sel) {
      var input = sel.querySelector('input');
      if (!input) return;
      sel.querySelector('.qty-minus') && sel.querySelector('.qty-minus').addEventListener('click', function () {
        if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
      });
      sel.querySelector('.qty-plus') && sel.querySelector('.qty-plus').addEventListener('click', function () {
        input.value = parseInt(input.value) + 1;
      });
    });

    // ---- COLLECTION FILTERS ----
    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        var tag = this.dataset.tag;
        document.querySelectorAll('.product-card').forEach(function (card) {
          var w = card.closest('.product-card-wrapper') || card.parentElement;
          w.style.display = (!tag || tag === 'all' || (card.dataset.tags || '').includes(tag)) ? '' : 'none';
        });
      });
    });

    // ---- SCROLL PROGRESS ----
    var progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
      window.addEventListener('scroll', function () {
        var total = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
      }, { passive: true });
    }

    // ---- BACK TO TOP ----
    var backToTop = document.getElementById('back-to-top');
    if (backToTop) {
      window.addEventListener('scroll', function () {
        backToTop.classList.toggle('visible', window.scrollY > 480);
      }, { passive: true });
      backToTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    // ---- HERO COUNTER ----
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseInt(el.dataset.count, 10);
      if (isNaN(target)) return;
      var start = performance.now(), dur = 1400;
      function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(tick);
      }
      setTimeout(function () { requestAnimationFrame(tick); }, 700);
    });

    // ---- SHIPPING COUNTDOWN ----
    // Múltiples cortes al día → el timer nunca muestra menos de ~15 min
    var countEl = document.getElementById('ship-countdown');
    if (countEl) {
      var CUTOFF_HOURS = [9, 13, 17, 21]; // 4 cortes diarios
      var MIN_MINUTES = 15; // si quedan menos, salta al siguiente corte

      function pad(n) { return String(n).padStart(2, '0'); }

      function getNextCutoff() {
        var now = new Date();
        for (var i = 0; i < CUTOFF_HOURS.length; i++) {
          var c = new Date();
          c.setHours(CUTOFF_HOURS[i], 0, 0, 0);
          if ((c - now) > MIN_MINUTES * 60 * 1000) return c;
        }
        // Todos pasados → primer corte del día siguiente
        var next = new Date();
        next.setDate(next.getDate() + 1);
        next.setHours(CUTOFF_HOURS[0], 0, 0, 0);
        return next;
      }

      function tickCountdown() {
        var d = getNextCutoff() - new Date();
        if (d < 0) d = 0;
        var h = Math.floor(d / 3600000);
        var m = Math.floor((d % 3600000) / 60000);
        var s = Math.floor((d % 60000) / 1000);
        countEl.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
      }
      tickCountdown(); setInterval(tickCountdown, 1000);
    }

    // ---- LIVE VIEWERS ----
    var viewEl = document.getElementById('viewers-count');
    if (viewEl) {
      viewEl.textContent = Math.floor(Math.random() * 9) + 4;
      setInterval(function () {
        var el = document.getElementById('viewers-count');
        if (el) el.textContent = Math.floor(Math.random() * 9) + 4;
      }, 7000);
    }

    // ---- DESCRIPTION EXPAND ----
    var desc = document.querySelector('.product-info__description');
    if (desc && window.innerWidth < 768 && desc.scrollHeight > 130) {
      desc.classList.add('is-truncated');
      var expandBtn = document.createElement('button');
      expandBtn.className = 'desc-expand-btn';
      expandBtn.textContent = 'Leer mas +';
      expandBtn.addEventListener('click', function () {
        var open = !desc.classList.contains('is-truncated');
        desc.classList.toggle('is-truncated', open);
        this.textContent = open ? 'Leer mas +' : 'Leer menos -';
      });
      desc.after(expandBtn);
    }

    // ---- BIND CURSOR TO DYNAMIC CONTENT ----
    if (canHover) {
      new MutationObserver(function () { bindCursorHovers(); })
        .observe(document.body, { childList: true, subtree: true });
    }

    // ---- ACCORDION ----
    document.querySelectorAll('.accordion-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var item = this.closest('.accordion-item');
        var body = item.querySelector('.accordion-body');
        var isOpen = item.classList.contains('open');
        // cierra todos
        document.querySelectorAll('.accordion-item.open').forEach(function(el) {
          el.classList.remove('open');
          el.querySelector('.accordion-body').style.display = 'none';
          el.querySelector('.accordion-btn').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('open');
          body.style.display = 'block';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

  }); // end DOMContentLoaded

})();
