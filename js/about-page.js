// About page: loads the food-safety certificates and the footer social links.

function certFront(c) { return (typeof c === 'string') ? c : (c && c.front); }
function certBack(c) { return (typeof c === 'string') ? null : (c && c.back); }

function openCertLightbox(cert) {
    var front = certFront(cert);
    var back = certBack(cert);
    var showingBack = false;

    var lb = document.createElement('div');
    lb.className = 'cert-lightbox';
    var inner = document.createElement('div');
    inner.className = 'cert-lightbox__inner';

    var img = document.createElement('img');
    img.src = front;
    img.alt = 'Certificate';
    inner.appendChild(img);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'cert-lightbox__close';
    closeBtn.innerHTML = '&times;';
    inner.appendChild(closeBtn);

    if (back) {
        var flipBtn = document.createElement('button');
        flipBtn.className = 'cert-lightbox__flip';
        flipBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> <span>Flip</span>';
        flipBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showingBack = !showingBack;
            img.classList.add('cert-flipping');
            setTimeout(function() {
                img.src = showingBack ? back : front;
                img.classList.remove('cert-flipping');
            }, 150);
        });
        inner.appendChild(flipBtn);
        img.style.cursor = 'pointer';
        img.addEventListener('click', function(e) { e.stopPropagation(); flipBtn.click(); });
    }

    closeBtn.addEventListener('click', function() { lb.remove(); });
    lb.addEventListener('click', function() { lb.remove(); });
    inner.addEventListener('click', function(e) { e.stopPropagation(); });

    lb.appendChild(inner);
    document.body.appendChild(lb);
}

function loadCertificates() {
    var section = document.getElementById('certificates');
    var grid = document.getElementById('certificatesGrid');
    if (!grid) return;
    fbGet('certificates', function(certs) {
        if (!certs || !certs.length) { section.style.display = 'none'; return; }
        section.style.display = '';
        var html = '';
        for (var i = 0; i < certs.length; i++) {
            var twoSides = certBack(certs[i]) ? '<span class="certificates__badge">Front &amp; back</span>' : '';
            html += '<div class="certificates__item" data-cert="' + i + '"><img loading="lazy" decoding="async" src="' + certFront(certs[i]) + '" alt="Certificate">' + twoSides + '</div>';
        }
        grid.innerHTML = html;
        grid.querySelectorAll('.certificates__item').forEach(function(item, idx) {
            item.addEventListener('click', function() { openCertLightbox(certs[idx]); });
        });
    });
}

function loadFooterSocials() {
    fbGet('content', function(content) {
        var ig = document.getElementById('socialInsta');
        var fb = document.getElementById('socialFacebook');
        if (ig) { if (content && content.contactInsta) { ig.href = content.contactInsta; ig.style.display = ''; } else { ig.style.display = 'none'; } }
        if (fb) { if (content && content.contactFacebook) { fb.href = content.contactFacebook; fb.style.display = ''; } else { fb.style.display = 'none'; } }
    });
}

loadCertificates();
loadFooterSocials();
