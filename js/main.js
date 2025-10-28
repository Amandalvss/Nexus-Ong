import { Templates } from "./spa.js";

// SPA Router
function router() {
    // normalize hash -> page name (without #)
    const raw = location.hash || "#inicio";
    const name = raw.startsWith('#') ? raw.slice(1) : raw;
    try {
        Templates.render(name || 'inicio');
    } catch (err) {
        // fallback: render inicio on error
        console.error('Erro ao renderizar template', err);
        Templates.render('inicio');
        location.hash = '#inicio';
    }
    setActiveNav();
}

// highlight active nav link (adds class menu-ativo)
function setActiveNav() {
    const links = document.querySelectorAll('a[data-link]');
    links.forEach(a => {
        const href = a.getAttribute('href') || '';
        // compare only the hash part
        const normalized = href.startsWith('#') ? href : ('#' + href);
        if (normalized === (location.hash || '#inicio')) a.classList.add('menu-ativo');
        else a.classList.remove('menu-ativo');
    });
}

// Menu links (delegated) - supports href with or without leading '#'
document.addEventListener('click', e => {
    // only respond to primary (left) clicks without modifier keys
    if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const link = e.target.closest('a[data-link]');
    if (!link) return;
    let href = (link.getAttribute('href') || '').trim();
    // ignore empty hrefs
    if (!href) {
        e.preventDefault();
        return;
    }
    // if it's an absolute URL or starts with /, let the browser handle it
    const isExternal = /^[a-zA-Z]+:\/\//.test(href) || href.startsWith('/');
    if (isExternal) return;

    e.preventDefault();
    if (!href.startsWith('#')) href = '#' + href;
    if (location.hash === href) {
        // same hash -> refresh template
        router();
    } else {
        location.hash = href;
    }
});

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', () => {
    // ensure nav highlight even if router throws
    try { router(); } catch (_) { setActiveNav(); }
});
