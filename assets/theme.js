// NARADNA THEME — theme.js

document.addEventListener('DOMContentLoaded', function () {

  // ---- MOBILE MENU ----
  const menuBtn = document.querySelector('.header__menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const menuClose = document.querySelector('.mobile-menu__close');

  function openMenu() {
    mobileMenu && mobileMenu.classList.add('open');
    mobileOverlay && mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobileMenu && mobileMenu.classList.remove('open');
    mobileOverlay && mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  menuBtn && menuBtn.addEventListener('click', openMenu);
  menuClose && menuClose.addEventListener('click', closeMenu);
  mobileOverlay && mobileOverlay.addEventListener('click', closeMenu);

  // ---- CART DRAWER ----
  const cartDrawer = document.querySelector('.cart-drawer');
  const cartOverlay = document.querySelector('.cart-overlay');
  const cartBtns = document.querySelectorAll('.header__cart-btn');
  const cartClose = document.querySelector('.cart-drawer__close');

  function openCart() {
    cartDrawer && cartDrawer.classList.add('open');
    cartOverlay && cartOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    fetchCart();
  }
  function closeCart() {
    cartDrawer && cartDrawer.classList.remove('open');
    cartOverlay && cartOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  }
  cartBtns.forEach(btn => btn.addEventListener('click', openCart));
  cartClose && cartClose.addEventListener('click', closeCart);
  cartOverlay && cartOverlay.addEventListener('click', closeCart);

  // ---- FETCH CART ----
  function fetchCart() {
    fetch('/cart.js')
      .then(r => r.json())
      .then(cart => renderCartDrawer(cart));
  }

  function renderCartDrawer(cart) {
    const content = document.getElementById('cart-drawer-content');
    if (!content) return;
    updateCartCount(cart.item_count);

    if (cart.item_count === 0) {
      content.innerHTML = '<div class="cart-drawer__empty"><p>Tu carrito está vacío</p></div>';
      const footer = document.getElementById('cart-drawer-footer');
      if (footer) footer.innerHTML = '';
      return;
    }

    let html = '';
    cart.items.forEach(item => {
      html += `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.title}" class="cart-item__image">
          <div>
            <div class="cart-item__title">${item.product_title}</div>
            <div class="cart-item__price">${formatMoney(item.final_price)}</div>
            <div class="cart-item__qty">Cantidad: ${item.quantity}</div>
          </div>
          <button class="cart-item__remove" aria-label="Eliminar" onclick="removeCartItem('${item.key}')">&#10005;</button>
        </div>`;
    });
    content.innerHTML = html;

    const footer = document.getElementById('cart-drawer-footer');
    if (footer) {
      footer.innerHTML = `
        <div class="cart-drawer__total">
          <span>Total</span><span>${formatMoney(cart.total_price)}</span>
        </div>
        <div class="cart-drawer__shipping-msg">&#10003; Envío gratis incluido</div>
        <a href="/checkout" class="btn btn--primary btn--full">Comprar ahora</a>
        <a href="/cart" class="btn btn--outline btn--full" style="margin-top:8px">Ver carrito</a>`;
    }
  }

  function updateCartCount(count) {
    document.querySelectorAll('.header__cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  function formatMoney(cents) {
    return (cents / 100).toFixed(2).replace('.', ',') + ' €';
  }

  window.removeCartItem = function(key) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: 0 })
    }).then(() => fetchCart());
  };

  fetchCart();

  // ---- ADD TO CART ----
  function addToCartHandler(btn, variantId, qty) {
    if (!variantId) return;
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Añadiendo...';
    btn.disabled = true;
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: qty || 1 })
    })
      .then(r => r.json())
      .then(() => {
        btn.innerHTML = '¡Añadido! ✓';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.disabled = false;
        }, 1800);
        openCart();
      })
      .catch(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
      });
  }

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const form = this.closest('form');
      const variantId = form ? form.querySelector('[name="id"]')?.value : this.dataset.variantId;
      const qty = form ? parseInt(form.querySelector('[name="quantity"]')?.value || 1) : 1;
      addToCartHandler(this, variantId, qty);
    });
  });

  // Quick add from product card
  document.querySelectorAll('.product-card__btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const variantId = this.dataset.variantId;
      if (!variantId) { window.location = this.dataset.url; return; }
      addToCartHandler(this, variantId, 1);
    });
  });

  // ---- QUANTITY SELECTOR ----
  document.querySelectorAll('.quantity-selector').forEach(selector => {
    const input = selector.querySelector('input');
    selector.querySelector('.qty-minus')?.addEventListener('click', () => {
      if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
    });
    selector.querySelector('.qty-plus')?.addEventListener('click', () => {
      input.value = parseInt(input.value) + 1;
    });
  });

  // ---- PRODUCT IMAGE GALLERY ----
  const thumbs = document.querySelectorAll('.product-gallery__thumb');
  const mainImg = document.getElementById('MainProductImage');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', function () {
      thumbs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      if (mainImg) {
        const newSrc = this.dataset.src;
        if (newSrc) mainImg.src = newSrc;
      }
    });
  });

  // ---- COLLECTION FILTERS ----
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const tag = this.dataset.tag;
      document.querySelectorAll('.product-card').forEach(card => {
        const wrapper = card.closest('.product-card-wrapper') || card.parentElement;
        if (!tag || tag === 'all') {
          wrapper.style.removeProperty('display');
        } else {
          const tags = card.dataset.tags || '';
          wrapper.style.display = tags.includes(tag) ? '' : 'none';
        }
      });
    });
  });

});
