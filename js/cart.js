// Shared shopping-cart helpers (localStorage-based, no payment)
function getCart() {
    try { return JSON.parse(localStorage.getItem('ines-cart')) || []; }
    catch (e) { return []; }
}
function setCart(cart) {
    localStorage.setItem('ines-cart', JSON.stringify(cart));
    updateCartBadge();
}
function addToCart(item) {
    var cart = getCart();
    cart.push(item);
    setCart(cart);
}
function cartCount() {
    return getCart().reduce(function (n, it) { return n + (it.qty || 1); }, 0);
}
function cartTotal() {
    return getCart().reduce(function (t, it) {
        return t + (it.qty || 1) * ((parseFloat(it.price) || 0) + (parseFloat(it.giftPrice) || 0));
    }, 0);
}
var _lastCartCount = null;
function updateCartBadge() {
    var n = cartCount();
    document.querySelectorAll('.header__cart-count').forEach(function (el) {
        el.textContent = n;
        el.style.display = n > 0 ? 'flex' : 'none';
    });
    // Bump the cart icon when an item is added (not on first load)
    if (_lastCartCount !== null && n > _lastCartCount) {
        document.querySelectorAll('.header__cart-count').forEach(function (el) {
            var icon = el.closest('.header__cart');
            if (!icon) return;
            icon.classList.remove('header__cart--bump');
            void icon.offsetWidth; // restart animation
            icon.classList.add('header__cart--bump');
        });
    }
    _lastCartCount = n;
}
document.addEventListener('DOMContentLoaded', updateCartBadge);

// ===== Reusable image lightbox (open / zoom / swipe through a set of images) =====
// images: array of { src, label }. startIndex: which one to open first.
function openImageLightbox(images, startIndex) {
    images = (images || []).filter(function (im) { return im && im.src; });
    if (!images.length) return;
    var idx = startIndex || 0;

    var lb = document.createElement('div');
    lb.className = 'img-lightbox';
    lb.innerHTML =
        '<button type="button" class="img-lightbox__close" aria-label="Close">&times;</button>' +
        '<button type="button" class="img-lightbox__nav img-lightbox__nav--prev" aria-label="Previous">‹</button>' +
        '<div class="img-lightbox__stage"><img alt=""></div>' +
        '<button type="button" class="img-lightbox__nav img-lightbox__nav--next" aria-label="Next">›</button>' +
        '<div class="img-lightbox__cap"></div>';
    document.body.appendChild(lb);
    document.body.style.overflow = 'hidden';

    var stage = lb.querySelector('.img-lightbox__stage');
    var imgEl = lb.querySelector('img');
    var capEl = lb.querySelector('.img-lightbox__cap');
    var prevBtn = lb.querySelector('.img-lightbox__nav--prev');
    var nextBtn = lb.querySelector('.img-lightbox__nav--next');

    function show(i) {
        idx = (i + images.length) % images.length;
        stage.classList.remove('img-lightbox__stage--zoom');
        imgEl.src = images[idx].src;
        capEl.textContent = images[idx].label || '';
        var multi = images.length > 1;
        prevBtn.style.display = multi ? '' : 'none';
        nextBtn.style.display = multi ? '' : 'none';
    }
    function close() {
        lb.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', onKey);
    }
    function onKey(e) {
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') show(idx - 1);
        else if (e.key === 'ArrowRight') show(idx + 1);
    }

    lb.querySelector('.img-lightbox__close').addEventListener('click', close);
    prevBtn.addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
    nextBtn.addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target === capEl) close(); });
    // Click the image to zoom in/out (read the diagram text); scroll to pan when zoomed
    imgEl.addEventListener('click', function (e) { e.stopPropagation(); stage.classList.toggle('img-lightbox__stage--zoom'); });
    document.addEventListener('keydown', onKey);

    // Touch swipe to flip
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
        if (sx === null || stage.classList.contains('img-lightbox__stage--zoom')) { sx = null; return; }
        var dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
        sx = null;
    });

    show(idx);
}
