(function () {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var root = document.documentElement;

    /* Thème clair / sombre */
    try { var saved = localStorage.getItem('theme'); if (saved) root.setAttribute('data-theme', saved); } catch (e) {}
    document.querySelector('.theme-btn').addEventListener('click', function () {
        var dark = root.getAttribute('data-theme') === 'dark' ||
            (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        var next = dark ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
    });

    /* Mots qui défilent dans le hero */
    var words = document.querySelectorAll('.rotator span'), w = 0;
    var rot = document.querySelector('.rotator');
    function sizeRot() { var m = 0; words.forEach(function (x) { m = Math.max(m, x.offsetWidth); }); rot.style.width = m + 'px'; }
    sizeRot(); if (document.fonts) document.fonts.ready.then(sizeRot);
    if (!reduce && words.length > 1) {
        setInterval(function () {
            var cur = words[w]; w = (w + 1) % words.length; var nxt = words[w];
            cur.classList.remove('on'); cur.classList.add('off');
            nxt.classList.remove('off'); nxt.classList.add('on');
            setTimeout(function () { cur.classList.remove('off'); }, 520);
        }, 2200);
    }

    /* Copier l'e-mail ou le numéro */
    document.querySelectorAll('[data-copy]').forEach(function (b) {
        b.addEventListener('click', function () {
            var val = b.dataset.copy, note = document.getElementById(b.dataset.note);
            var say = function (msg) { note.textContent = msg; setTimeout(function () { note.textContent = ''; }, 4000); };
            var fallback = function () { say(b.dataset.label + ' : ' + val + ' (sélectionnez et copiez ce texte)'); };
            try {
                navigator.clipboard.writeText(val).then(function () { say(b.dataset.label + ' copié : ' + val); }, fallback);
            } catch (e) { fallback(); }
        });
    });

    /* Compétences : onglets */
    var data = {
        sc: ['Supply Chain & Achats', 'Ce que j\'ai pratiqué chez OCP et étudié en modules achats et sourcing.',
            ['Gestion des stocks', 'Approvisionnement', 'Procure-to-Pay', 'Sourcing', 'Prévision de la demande']],
        q: ['Qualité & Amélioration continue', 'Ce que j\'ai mis en œuvre au service qualité de CIB.',
            ['Contrôle qualité', 'Non-conformités', 'Actions correctives (CAPA)', 'KPI', 'PDCA', 'ISO 9001 (notions)']],
        data: ['Data & Business Intelligence', 'Pour transformer des données en tableaux de bord et en décisions.',
            ['Power BI', 'Power Query', 'DAX', 'Python (pandas)', 'Séries temporelles', 'Machine Learning']],
        erp: ['ERP', 'Du paramétrage à l\'analyse des processus métier.',
            ['SAP (fondamentaux)', 'Odoo Achats', 'Odoo Inventaire', 'Odoo Ventes', 'Analyse des processus']],
        pm: ['Gestion de projet', 'Pour planifier, suivre et rendre compte.',
            ['Planification (Gantt, jalons)', 'Suivi des actions', 'Budgétisation', 'Reporting']],
        soft: ['Outils & Savoir-être', 'Au quotidien.',
            ['Excel avancé', 'PowerPoint', 'Word', 'Rigueur', 'Esprit de synthèse', 'Autonomie', 'Travail en équipe']]
    };
    var panel = document.getElementById('panel'), tabs = document.querySelectorAll('.tab');
    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function show(key, animate) {
        var d = data[key];
        panel.classList.remove('animate'); void panel.offsetWidth;
        panel.innerHTML = '<h3>' + esc(d[0]) + '</h3><p>' + esc(d[1]) + '</p><div class="chips">' +
            d[2].map(function (c, i) { return '<span class="chip" style="animation-delay:' + (i * 50) + 'ms">' + esc(c) + '</span>'; }).join('') + '</div>';
        if (animate) panel.classList.add('animate');
        tabs.forEach(function (t) { t.setAttribute('aria-selected', t.dataset.key === key ? 'true' : 'false'); });
    }
    tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { show(t.dataset.key, true); });
        t.addEventListener('keydown', function (e) {
            var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
            if (d) { e.preventDefault(); var n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); show(n.dataset.key, true); }
        });
    });
    show('sc');

    /* Langues : échelle CECRL */
    document.querySelectorAll('.scale').forEach(function (s) {
        var lvl = +s.dataset.level;
        for (var i = 1; i <= 6; i++) { var b = document.createElement('i'); if (i <= lvl) b.className = 'on'; s.appendChild(b); }
    });

    /* Défilement : barre de progression, nav, ligne de parcours, lien actif */
    var bar = document.querySelector('.progress'), nav = document.querySelector('.nav');
    var flow = document.getElementById('flow'), fill = flow.querySelector('.fill'), stops = flow.querySelectorAll('.stop');
    var links = document.querySelectorAll('.nav-links a');
    var secs = Array.prototype.map.call(links, function (a) { return document.querySelector(a.getAttribute('href')); });
    var contact = document.getElementById('contact');
    function onScroll() {
        var h = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
        nav.classList.toggle('solid', scrollY > 40);

        var r = flow.getBoundingClientRect(), mid = innerHeight * 0.6;
        var p = Math.min(Math.max((mid - r.top) / r.height, 0), 1);
        fill.style.height = (p * (r.height - 16)) + 'px';
        stops.forEach(function (s) { s.classList.toggle('reached', s.getBoundingClientRect().top + 14 < mid); });

        var active = -1;
        secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < innerHeight * 0.35) active = i; });
        links.forEach(function (a, i) { a.classList.toggle('active', i === active); });

        if (contact.getBoundingClientRect().top < innerHeight * 0.8) contact.classList.add('seen');
    }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();
})();
