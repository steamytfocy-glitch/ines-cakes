// Turns the .lang-switcher into a dropdown: a trigger showing the current
// language, click to reveal the list. The actual language change is handled by
// each page's own .lang-btn click handler (setLang) - this only manages the
// open/close UI and the trigger label.
(function () {
    var CODES = { en: 'EN', ga: 'GA', ua: 'UA', ru: 'RU' };
    function currentLang() {
        var l = localStorage.getItem('ines-lang');
        return (l === 'ga' || l === 'ua' || l === 'ru') ? l : 'en';
    }
    function init() {
        var sw = document.querySelector('.lang-switcher');
        if (!sw) return;
        var trigger = sw.querySelector('.lang-trigger');
        var label = sw.querySelector('.lang-trigger__label');
        if (!trigger) return;
        if (label) label.textContent = CODES[currentLang()] || 'EN';

        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            var open = sw.classList.toggle('lang-switcher--open');
            trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        sw.querySelectorAll('.lang-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (label) label.textContent = CODES[this.dataset.lang] || (this.dataset.lang || '').toUpperCase();
                sw.classList.remove('lang-switcher--open');
                trigger.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', function (e) {
            if (!sw.contains(e.target)) {
                sw.classList.remove('lang-switcher--open');
                trigger.setAttribute('aria-expanded', 'false');
            }
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                sw.classList.remove('lang-switcher--open');
                trigger.setAttribute('aria-expanded', 'false');
            }
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
