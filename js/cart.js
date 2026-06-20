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
function updateCartBadge() {
    var n = cartCount();
    document.querySelectorAll('.header__cart-count').forEach(function (el) {
        el.textContent = n;
        el.style.display = n > 0 ? 'flex' : 'none';
    });
}
document.addEventListener('DOMContentLoaded', updateCartBadge);
