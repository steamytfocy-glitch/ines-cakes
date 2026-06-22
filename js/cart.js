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
