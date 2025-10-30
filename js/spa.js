/**
 * SPA Templates - Nexus ONG
 * Version: 1.0.0
 * WCAG 2.1 AA Compliant
 * GitFlow Ready
 * Production Optimized
 */

import { initForm } from "./form.js";

// Security: HTML escaping
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Accessibility: Screen reader announcements
function announceToScreenReader(message, priority = 'polite') {
    let liveRegion = document.getElementById('a11y-live-region');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'a11y-live-region';
        liveRegion.className = 'sr-only';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = message;
    setTimeout(() => liveRegion.textContent = '', 3000);
}

// WCAG 2.1 AA: Focus management
function manageFocus(root) {
    setTimeout(() => {
        const focusable = root.querySelector('h1, h2, [role="heading"], button, a, input');
        if (focusable) {
            focusable.setAttribute('tabindex', '-1');
            focusable.focus();
            setTimeout(() => focusable.removeAttribute('tabindex'), 1000);
        }
    }, 100);
}

// WCAG 2.1 AA: Semantic structure
function enhanceSemantics(root) {
    // Ensure proper heading structure
    if (!root.querySelector('h1, h2, [role="heading"]')) {
        const heading = document.createElement('h1');
        heading.className = 'sr-only';
        heading.textContent = 'Conteúdo principal';
        root.prepend(heading);
    }
    
    // Enhance images
    root.querySelectorAll('img:not([alt])').forEach(img => {
        img.setAttribute('alt', 'Imagem decorativa');
    });
}

// Production: Error handling
function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    announceToScreenReader('Erro inesperado ocorreu', 'assertive');
}

// SPA Templates Manager
export const Templates = (() => {
    const templates = {};

    function register(name, templateHTML, afterRender) {
        templates[name] = { templateHTML, afterRender };
    }

    function render(name) {
        const root = document.getElementById("spa-root");
        if (!root) return;

        try {
            // Clear and render
            root.innerHTML = "";
            if (!templates[name]) throw new Error(`Template ${name} not found`);
            
            root.innerHTML = templates[name].templateHTML;

            // WCAG 2.1 AA: Enhance accessibility
            enhanceSemantics(root);
            root.setAttribute('role', 'main');

            // Execute afterRender callback
            if (typeof templates[name].afterRender === "function") {
                templates[name].afterRender(root);
            }

            // Initialize form if present
            if (root.querySelector("#form-cadastro")) {
                initForm();
            }

            // WCAG 2.1 AA: Focus management
            manageFocus(root);

            // Announce navigation
            announceToScreenReader(`Página ${name} carregada`);

        } catch (error) {
            handleError(error, `render(${name})`);
            root.innerHTML = `<div role="alert" class="error">Erro ao carregar página</div>`;
        }
    }

    return { register, render };
})();

// =================== HOME PAGE ===================
Templates.register("inicio",
`<section class="hero" aria-labelledby="hero-title">
    <div class="hero-text">
        <h1 id="hero-title">Bem-vindo à Nexus ONG!</h1>
        <p class="hero-sub">Transformando vidas <span id="typed" aria-hidden="true">💖</span></p>
        <p class="hero-lead">Comunidade de voluntários criando grandes mudanças através de pequenas ações.</p>
        <div class="botoes">
            <a class="botao" href="#projetos" data-link aria-label="Ver projetos">Ver Projetos</a>
            <a class="botao botao-secundario" href="#cadastro" data-link aria-label="Cadastrar como voluntário">Quero Ajudar</a>
        </div>
        <div class="hero-stats" aria-label="Estatísticas">
            <div class="stat"><strong>+120</strong><span>Voluntários</span></div>
            <div class="stat"><strong>+45</strong><span>Projetos</span></div>
            <div class="stat"><strong>+5K</strong><span>Beneficiados</span></div>
        </div>
    </div>
    <img src="img/meuprojeto1.webp" alt="Voluntários em ação" loading="lazy">
</section>
<section class="cute-callout" aria-labelledby="newsletter-title">
    <h3 id="newsletter-title">Participe</h3>
    <p>Receba novidades sobre nossos eventos e campanhas.</p>
    <div class="newsletter">
        <input id="newsletter-email" type="email" placeholder="Seu email" aria-label="Email para newsletter" required>
        <button class="botao" id="newsletter-btn" aria-label="Assinar">Quero receber</button>
    </div>
    <div id="newsletter-msg" aria-live="polite"></div>
</section>`,
function(root) {
    // Animation
    const typedEl = document.getElementById('typed');
    if (typedEl) {
        const emoji = ['💖','🌸','✨','🤝'];
        let idx = 0;
        setInterval(() => {
            typedEl.textContent = emoji[idx++ % emoji.length];
        }, 900);
    }

    // Newsletter with accessibility
    const email = root.querySelector('#newsletter-email');
    const btn = root.querySelector('#newsletter-btn');
    const msg = root.querySelector('#newsletter-msg');
    
    if (btn && email) {
        const handleSubmit = () => {
            const val = email.value.trim();
            if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                announceToScreenReader('Email inválido');
                return;
            }

            try {
                const list = JSON.parse(localStorage.getItem('nexus_news') || '[]');
                if (!list.includes(val)) list.push(val);
                localStorage.setItem('nexus_news', JSON.stringify(list));
                msg.textContent = 'Obrigada! ✨';
                email.value = '';
                announceToScreenReader('Cadastrado na newsletter');
            } catch (error) {
                handleError(error, 'newsletter');
            }
        };

        btn.addEventListener('click', handleSubmit);
        email.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSubmit();
        });
    }
});

// =================== PROJECTS PAGE ===================
Templates.register("projetos",
`<section aria-labelledby="projects-title">
    <h2 id="projects-title">Nossos Projetos</h2>
    <div class="projects-toolbar" role="search" aria-label="Filtrar projetos">
        <input id="projects-search" type="search" placeholder="Pesquisar..." aria-label="Pesquisar projetos">
        <div id="projects-tags" class="projects-tags" role="group" aria-label="Categorias"></div>
    </div>
    <div class="projects-grid" id="projects-gallery" role="list" aria-label="Lista de projetos"></div>
    <p class="small-help">
        <span class="heart-mini" aria-hidden="true">❤</span> 
        <span class="sr-only">Favoritar</span> para salvar
    </p>
</section>`,
function(root) {
    const gallery = root.querySelector("#projects-gallery");
    const search = root.querySelector('#projects-search');
    const tags = root.querySelector('#projects-tags');

    const projects = [
        {
            img: "meuprojeto1.webp",
            tags: ['educação','crianças'],
            title: "Educação para Todos",
            desc: "Apoio escolar e oficinas de reforço para crianças e jovens. Trabalhamos com turmas pequenas, materiais lúdicos e acompanhamento individual, promovendo habilidades para a vida e reduzindo a evasão escolar.",
        },
        {
            img: "meuprojeto2.webp",
            tags: ['saúde','comunidade'],
            title: "Saúde Comunitária",
            desc: "Ações e campanhas de prevenção em comunidades com triagens, oficinas de nutrição e suporte em saúde mental, realizadas em parceria com profissionais voluntários e centros locais.",
        },
        {
            img: "projeto1.webp",
            tags: ['meio ambiente','reflorestamento'],
            title: "Cuidando do Verde",
            desc: "Mutirões de reflorestamento e educação ambiental em escolas e praças. Inclui oficinas práticas, plantio de mudas e ações de sensibilização para famílias e estudantes.",
        },
        {
            img: "projeto2.webp",
            tags: ['inclusão digital','emprego'],
            title: "Conexão e Trabalho",
            desc: "Cursos de informática e empreendedorismo para inserir pessoas no mercado de trabalho, com aulas práticas, mentoria e apoio para montagem de currículo e vagas.",
        }
    ];

    // Initialize
    initTags();
    renderProjects();
    setupEvents();

    function initTags() {
        const allTags = [...new Set(projects.flatMap(p => p.tags))];
        tags.innerHTML = allTags.map(tag => 
            `<button class="tag-btn" data-tag="${tag}" aria-pressed="false">${tag}</button>`
        ).join('');
    }

    function renderProjects(filter = '', activeTag = '') {
        const favs = JSON.parse(localStorage.getItem('nexus_favs') || '[]');
        const filtered = projects.filter(p => {
            const hay = (p.title + ' ' + p.desc + ' ' + (p.tags||[]).join(' ')).toLowerCase();
            const matchText = !filter || hay.includes(filter.toLowerCase());
            const matchTag = !activeTag || p.tags.includes(activeTag);
            return matchText && matchTag;
        });

        gallery.innerHTML = filtered.map((p, i) => {
            const titleId = `project-title-${i}`;
            // ensure description long enough for ~3 lines when clamped
            const desc = (p.desc || '').trim();
            const padded = desc.length < 160 ? desc + ' ' + 'Projeto com ações contínuas que envolvem comunidade e resultados mensuráveis.' : desc;
            const isFav = favs.includes(p.title);
            // render tags as chips
            const tagsHtml = (p.tags||[]).map(t => `<span class="tag-chip">${escapeHtml(t)}</span>`).join(' ');
            return `
            <div class="project-card reveal" role="listitem" tabindex="0" aria-labelledby="${titleId}"
                 data-title="${escapeHtml(p.title)}" 
                 data-desc="${escapeHtml(padded)}"
                 data-img="img/${p.img}" 
                 style="animation-delay:${i*100}ms">
                <div class="card-media">
                    <img src="img/${p.img}" alt="${escapeHtml(p.title)}" loading="lazy">
                    <div class="card-overlay">
                        <button class="card-btn primary" data-action="details" aria-label="Detalhes de ${escapeHtml(p.title)}">Saiba mais</button>
                    </div>
                    <button class="fav-heart" 
                            aria-label="${isFav ? 'Remover favorito' : 'Favoritar'}" 
                            aria-pressed="${isFav}"
                            data-action="favorite"
                            data-project="${escapeHtml(p.title)}">
                        <span class="heart-icon">${isFav ? '❤' : '♡'}</span>
                    </button>
                </div>
                <div class="body">
                    <h3 id="${titleId}">${escapeHtml(p.title)}</h3>
                    <div class="tags">${tagsHtml}</div>
                    <p class="desc">${escapeHtml(padded)}</p>
                    <div class="card-actions">
                        <button class="card-btn" data-action="support" aria-label="Apoiar ${escapeHtml(p.title)}">Apoiar</button>
                    </div>
                </div>
            </div>
        `;
        }).join('');

        // WCAG 2.1 AA: Animation observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        gallery.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    // Accessible modals for details and support
    function openDetailModal(title, desc, img) {
        try {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal" role="dialog" aria-modal="true" aria-label="Detalhes do projeto">
                    <button class="close" aria-label="Fechar">Fechar</button>
                    <div class="modal-body-flex">
                        <img src="${escapeHtml(img)}" alt="Imagem do projeto ${escapeHtml(title)}" loading="lazy">
                        <div>
                            <h3 style="color:var(--accent);">${escapeHtml(title)}</h3>
                            <p>${escapeHtml(desc)}</p>
                            <div style="margin-top:12px"><button class="botao" id="modal-support">Quero Ajudar</button></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            announceToScreenReader(`Aberto detalhe de ${title}`);
            // attach quick actions
            overlay.querySelector('#modal-support')?.addEventListener('click', (e) => {
                const supports = JSON.parse(localStorage.getItem('nexus_supports') || '[]');
                supports.push({ project: title, at: new Date().toISOString() });
                localStorage.setItem('nexus_supports', JSON.stringify(supports));
                e.target.textContent = 'Obrigada!';
                setTimeout(() => overlay.remove(), 1000);
            });
        } catch (error) {
            handleError(error, 'openDetailModal');
        }
    }

    function openSupportModal(title) {
        try {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal" role="dialog" aria-modal="true" aria-label="Apoiar projeto">
                    <button class="close" aria-label="Fechar">Fechar</button>
                    <div>
                        <h3 style="color:var(--accent);">Apoiar: ${escapeHtml(title)}</h3>
                        <p>Obrigado por considerar apoiar este projeto. Clique em "Quero Ajudar" para registrar seu interesse e receber instruções.</p>
                        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
                            <button class="botao" id="btn-apoio">Quero Ajudar</button>
                            <button class="btn-danger close">Cancelar</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            announceToScreenReader(`Modal de apoio aberto para ${title}`);
            const apoioBtn = overlay.querySelector('#btn-apoio');
            apoioBtn?.addEventListener('click', () => {
                const supports = JSON.parse(localStorage.getItem('nexus_supports') || '[]');
                supports.push({ project: title, at: new Date().toISOString() });
                localStorage.setItem('nexus_supports', JSON.stringify(supports));
                apoioBtn.textContent = 'Obrigado!';
                setTimeout(() => overlay.remove(), 900);
            });
        } catch (error) {
            handleError(error, 'openSupportModal');
        }
    }

    function setupEvents() {
        // activeTag tracked for filtering
        let activeTag = '';
        // Event delegation
        gallery.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const action = btn.getAttribute('data-action');
            const project = btn.getAttribute('data-project') || 
                          btn.closest('.project-card')?.dataset.title;

            if (!project) return;

            if (action === 'favorite') {
                const favs = JSON.parse(localStorage.getItem('nexus_favs') || '[]');
                const isFav = favs.includes(project);

                if (isFav) {
                    favs.splice(favs.indexOf(project), 1);
                    btn.setAttribute('aria-label', 'Favoritar');
                    btn.setAttribute('aria-pressed', 'false');
                    btn.querySelector('.heart-icon') && (btn.querySelector('.heart-icon').textContent = '♡');
                    // subtle pop animation reverse
                    btn.classList.add('popped');
                    setTimeout(() => btn.classList.remove('popped'), 350);
                    announceToScreenReader('Removido dos favoritos');
                } else {
                    favs.push(project);
                    btn.setAttribute('aria-label', 'Remover favorito');
                    btn.setAttribute('aria-pressed', 'true');
                    btn.querySelector('.heart-icon') && (btn.querySelector('.heart-icon').textContent = '❤');
                    // pop animation
                    btn.classList.add('popped');
                    setTimeout(() => btn.classList.remove('popped'), 600);
                    announceToScreenReader('Adicionado aos favoritos');
                }

                localStorage.setItem('nexus_favs', JSON.stringify(favs));
                return;
            }

            if (action === 'details') {
                const card = btn.closest('.project-card');
                const title = card?.dataset.title;
                const desc = card?.dataset.desc;
                const img = card?.dataset.img;
                if (title) openDetailModal(title, desc, img);
                return;
            }

            if (action === 'support') {
                const card = btn.closest('.project-card');
                const title = card?.dataset.title;
                if (title) openSupportModal(title);
                return;
            }
        });

        // WCAG 2.1 AA: Keyboard navigation
        gallery.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const focused = document.activeElement;
                const card = focused && focused.classList && focused.classList.contains('project-card') ? focused : focused.closest && focused.closest('.project-card');
                if (card) {
                    e.preventDefault();
                    // open details when Enter/Space on card
                    openDetailModal(card.dataset.title, card.dataset.desc, card.dataset.img);
                }
            }
        });

        // Search with debounce
        let searchTimeout;
        search?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                renderProjects(e.target.value, activeTag);
            }, 300);
        });

        // Tag filtering
        tags.addEventListener('click', (e) => {
            const tagBtn = e.target.closest('.tag-btn');
            if (!tagBtn) return;

            const tag = tagBtn.getAttribute('data-tag');
            activeTag = activeTag === tag ? '' : tag;
            
            tags.querySelectorAll('.tag-btn').forEach(btn => {
                const pressed = btn.getAttribute('data-tag') === activeTag;
                btn.classList.toggle('active', pressed);
                btn.setAttribute('aria-pressed', pressed.toString());
            });

            renderProjects(search?.value || '', activeTag);
        });
    }
});

// =================== REGISTRATION PAGE ===================
Templates.register("cadastro",
`<section aria-labelledby="cadastro-title">
    <h2 id="cadastro-title" class="section-title">Cadastro de Voluntário</h2>
    <form id="form-cadastro" class="accessible-form" novalidate>
        <div class="form-group">
            <label class="form-label" for="nome">Nome completo</label>
            <input class="form-input" id="nome" name="nome" type="text" required aria-required="true" aria-describedby="help-nome">
            <div id="help-nome" class="form-help">Digite seu nome completo como aparece em documentos.</div>
        </div>
        <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input class="form-input" id="email" name="email" type="email" required aria-required="true" aria-describedby="help-email">
            <div id="help-email" class="form-help">Usaremos para contato; endereço válido é necessário.</div>
        </div>
        <div class="form-group">
            <label class="form-label" for="telefone">Telefone</label>
            <input class="form-input" id="telefone" name="telefone" type="tel" required aria-required="true" aria-describedby="help-telefone">
            <div id="help-telefone" class="form-help">Inclua código de área. Ex: (21) 99999-9999.</div>
        </div>
        <div class="form-group">
            <label class="form-label" for="cpf">CPF</label>
            <input class="form-input" id="cpf" name="cpf" type="text" placeholder="000.000.000-00" required aria-required="true" aria-describedby="help-cpf">
            <div id="help-cpf" class="form-help">Formato: 000.000.000-00.</div>
        </div>
        <div class="form-group full">
            <label class="form-label" for="endereco">Endereço</label>
            <input class="form-input" id="endereco" name="endereco" type="text" placeholder="Rua, número, complemento" aria-describedby="help-endereco">
            <div id="help-endereco" class="form-help">Opcional, mas útil para ações locais.</div>
        </div>
        <div class="form-group">
            <label class="form-label" for="cidade">Cidade</label>
            <input class="form-input" id="cidade" name="cidade" type="text" placeholder="Cidade" required aria-required="true">
        </div>
        <div class="form-group">
            <label class="form-label" for="disponibilidade">Disponibilidade</label>
            <select class="form-select" id="disponibilidade" name="disponibilidade" aria-describedby="help-disponibilidade">
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
                <option value="fimsemana">Fins de semana</option>
            </select>
            <div id="help-disponibilidade" class="form-help">Quando você costuma poder participar?</div>
        </div>
        <div class="form-group full">
            <label class="form-label" for="observacoes">Habilidades / Observações</label>
            <textarea class="form-textarea" id="observacoes" name="observacoes" rows="4" placeholder="Como você quer ajudar (ex: alfabetização, eventos, cozinha)"></textarea>
        </div>
        <div class="form-group">
            <label class="form-label" for="senha">Senha</label>
            <input class="form-input" id="senha" name="senha" type="password" required aria-required="true" minlength="6">
            <div class="form-help">Escolha uma senha segura (mínimo 6 caracteres).</div>
        </div>
        <div class="form-group">
            <label class="form-label" for="senha_confirm">Confirmar Senha</label>
            <input class="form-input" id="senha_confirm" name="senha_confirm" type="password" required aria-required="true" minlength="6">
        </div>
        <div class="form-group full">
            <button type="submit" class="button primary">Enviar</button>
        </div>
    </form>
    <div id="form-mensagem" aria-live="polite"></div>

    <h3 class="section-title">Registros salvos</h3>
    <div id="registros-list" class="reg-list">Carregando...</div>
</section>`,
function(root) {
    // Render saved registros and enable deletion
    const listContainer = root.querySelector('#registros-list');

    function renderRegistros() {
        try {
            const regs = JSON.parse(localStorage.getItem('nexus_registros') || '[]');
            if (!listContainer) return;
            if (!regs.length) { listContainer.innerHTML = '<p>Nenhum registro encontrado.</p>'; return; }
            listContainer.innerHTML = regs.map((r, idx) => `
                <div class="reg-item" data-idx="${idx}">
                    <div class="meta">
                        <strong>${escapeHtml(r.nome || '')}</strong><br>
                        <small>${escapeHtml(r.email || '')} • ${escapeHtml(r.telefone || '')}</small>
                    </div>
                    <div class="actions">
                        <button class="button secondary" data-action="delete" data-idx="${idx}" aria-label="Excluir registro ${escapeHtml(r.nome || '')}">Excluir</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Erro ao renderizar registros', error);
            listContainer.innerHTML = '<p>Erro ao carregar registros.</p>';
        }
    }

    renderRegistros();

    listContainer && listContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="delete"]');
        if (!btn) return;
        const idx = Number(btn.getAttribute('data-idx'));
        const regs = JSON.parse(localStorage.getItem('nexus_registros') || '[]');
        if (idx >= 0 && idx < regs.length) {
            regs.splice(idx, 1);
            localStorage.setItem('nexus_registros', JSON.stringify(regs));
            renderRegistros();
        }
    });

    // initForm will be called by render() after this afterRender executes
});