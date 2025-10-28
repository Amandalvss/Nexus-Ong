import { initForm } from "./form.js";

// Escape HTML
function escapeHtml(str){
    return String(str)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#039;');
}

// Gerenciador de templates SPA
export const Templates = (() => {
    const templates = {};

    function register(name, templateHTML, afterRender) {
        templates[name] = { templateHTML, afterRender };
    }

    function render(name) {
        const root = document.getElementById("spa-root");
        if (!root) return;
        root.innerHTML = "";

        if (!templates[name]) return;
        root.innerHTML = templates[name].templateHTML;

        if (typeof templates[name].afterRender === "function") {
            templates[name].afterRender(root);
        }

        if (root.querySelector("#form-cadastro")) initForm();
    }

    return { register, render };
})();

// =================== INÍCIO ===================
Templates.register("inicio",
`<section class="hero">
    <div class="hero-text">
        <h1>Bem-vindo à Nexus ONG!</h1>
        <p class="hero-sub">Transformando vidas com carinho e dedicação <span id="typed">💖</span></p>
        <p class="hero-lead">Somos uma comunidade de voluntários, profissionais e parceiros que acreditam que pequenas ações geram grandes mudanças. Aqui você encontra projetos em educação, saúde, meio ambiente e inclusão digital — e sempre há espaço para quem quer ajudar.</p>
        <div class="botoes">
          <a class="botao" href="#projetos" data-link>Ver Projetos</a>
          <a class="botao botao-secundario" href="#cadastro" data-link>Quero Ajudar</a>
        </div>
        <div class="hero-stats">
            <div class="stat"><strong>+120</strong><span>Voluntários</span></div>
            <div class="stat"><strong>+45</strong><span>Projetos apoiados</span></div>
            <div class="stat"><strong>+5K</strong><span>Beneficiados</span></div>
        </div>
    </div>
    <img src="img/meuprojeto1.webp" alt="Hero" loading="lazy">
</section>
<section class="cute-callout">
  <h3>Participe com amor</h3>
  <p>Assine nossa lista de novidades para receber convites para eventos, mutirões e campanhas — prometemos mensagens curtas e cheias de carinho.</p>
  <div class="newsletter">
    <input id="newsletter-email" type="email" placeholder="Seu email para receber novidades" aria-label="Email para novidades">
    <button class="botao" id="newsletter-btn">Quero receber</button>
  </div>
  <p class="newsletter-msg" aria-live="polite"></p>
</section>`,
 (root) => {
    // typing effect
    const typedEl = document.getElementById('typed');
    if (typedEl) {
        const emoji = ['💖','🌸','✨','🤝'];
        let idx = 0;
        setInterval(() => {
            typedEl.textContent = emoji[idx % emoji.length];
            idx++;
        }, 900);
    }

    // newsletter
    const emailInput = root.querySelector('#newsletter-email');
    const btn = root.querySelector('#newsletter-btn');
    const msg = root.querySelector('.newsletter-msg');
    if (btn && emailInput) {
        btn.addEventListener('click', () => {
            const val = (emailInput.value || '').trim();
            if (!val || !/.+@.+\..+/.test(val)) {
                msg.textContent = 'Digite um email válido, por favor 💌';
                return;
            }
            const list = JSON.parse(localStorage.getItem('nexus_news') || '[]');
            if (!list.includes(val)) list.push(val);
            localStorage.setItem('nexus_news', JSON.stringify(list));
            msg.textContent = 'Obrigada! Você está na nossa listinha ✨';
            emailInput.value = '';
            setTimeout(() => msg.textContent = '', 3200);
        });
    }
});

// =================== PROJETOS ===================
Templates.register("projetos",
`<section>
    <h2>Nossos Projetos</h2>
    <div class="projects-toolbar">
        <input id="projects-search" type="search" placeholder="Pesquisar projetos (ex: educação, saúde)" aria-label="Pesquisar projetos">
        <div id="projects-tags" class="projects-tags" aria-hidden="false"></div>
    </div>
    <div class="projects-grid" id="projects-gallery"></div>
    <p class="small-help">Clique em <span class="heart-mini">❤</span> para favoritar. Seus favoritos ficam salvos no seu navegador.</p>
</section>`,
 (root) => {
    const gallery = root.querySelector("#projects-gallery");
    const searchInput = root.querySelector('#projects-search');
    const tagsContainer = root.querySelector('#projects-tags');

    const projects = [
        { img: "meuprojeto1.webp", tags:['educação','crianças'], title: "Educação para Todos", desc: "Apoio escolar e oficinas de reforço para crianças e jovens. Trabalhamos com turmas pequenas, materiais lúdicos e acompanhamento individual. Nosso objetivo é reduzir a evasão e fortalecer o aprendizado.", phrase: "Educar é plantar futuro." },
        { img: "meuprojeto2.webp", tags:['saúde','comunidade'], title: "Saúde Comunitária", desc: "Ações e campanhas de prevenção em comunidades com triagens, oficinas de nutrição e suporte em saúde mental. Atuamos com profissionais parceiros e voluntários locais.", phrase: "Cuidar é um ato de amor." },
        { img: "projeto1.webp", tags:['meio ambiente','reflorestamento'], title: "Meio Ambiente", desc: "Projetos de reflorestamento e educação ambiental em escolas e praças. Realizamos mutirões, oficinas práticas de reciclagem e ações para sensibilizar famílias.", phrase: "Preservar é garantir amanhã." },
        { img: "projeto2.webp", tags:['inclusão digital','emprego'], title: "Inclusão Digital", desc: "Cursos de informática e empreendedorismo para inserir mais pessoas no mercado de trabalho. Fornecemos treinamentos práticos com foco em empregabilidade.", phrase: "Conectar transforma vidas." }
    ];

    // build tag list
    const allTags = [...new Set(projects.flatMap(p => p.tags))];
    tagsContainer.innerHTML = allTags.map(t => `<button class="tag-btn" data-tag="${t}">${t}</button>`).join('');

    function renderList(filterText='', activeTag='') {
        const favs = JSON.parse(localStorage.getItem('nexus_favs') || '[]');
        const list = projects.filter(p => {
            const text = (p.title + ' ' + p.desc + ' ' + (p.tags||[]).join(' ')).toLowerCase();
            const keepText = !filterText || text.includes(filterText.toLowerCase());
            const keepTag = !activeTag || (p.tags || []).includes(activeTag);
            return keepText && keepTag;
        });
        gallery.innerHTML = list.map((p, i) => `
            <div class="project-card reveal" data-title="${escapeHtml(p.title)}" data-desc="${escapeHtml(p.desc)}" data-img="img/${p.img}" data-tags="${(p.tags||[]).join(',')}" style="animation-delay:${i*110}ms">
                <div class="card-media">
                    <img src="img/${p.img}" alt="${escapeHtml(p.title)}" loading="lazy">
                    <button class="fav-heart" title="Favoritar" aria-label="Favoritar projeto">${favs.includes(p.title) ? '❤' : '♡'}</button>
                </div>
                <div class="body">
                    <h4>${escapeHtml(p.title)}</h4>
                    <p class="desc">${escapeHtml(p.desc)}</p>
                    <div class="card-actions">
                        <button class="card-btn" data-action="saibamais">Saiba mais</button>
                        <button class="card-btn card-btn-secondary" data-action="apoiar">Apoiar</button>
                    </div>
                </div>
            </div>
        `).join('');

        // reattach reveal observer
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(en => {
                if (en.isIntersecting) {
                    en.target.classList.add('show');
                    obs.unobserve(en.target);
                }
            });
        }, { threshold: 0.12 });
        gallery.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    }

    renderList();

    // click handlers (delegate)
    gallery.addEventListener('click', (e) => {
        const fav = e.target.closest('.fav-heart');
        if (fav) {
            const card = fav.closest('.project-card');
            const title = card && card.dataset.title;
            if (!title) return;
            const favs = JSON.parse(localStorage.getItem('nexus_favs') || '[]');
            const idx = favs.indexOf(title);
            if (idx === -1) favs.push(title); else favs.splice(idx,1);
            localStorage.setItem('nexus_favs', JSON.stringify(favs));
            fav.textContent = favs.includes(title) ? '❤' : '♡';
            fav.classList.add('pop');
            setTimeout(()=>fav.classList.remove('pop'), 300);
            return;
        }

        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        const card = btn.closest('.project-card');
        if (!card) return;
        const title = card.dataset.title;
        const desc = card.dataset.desc;
        const img = card.dataset.img;

        if (action === 'saibamais') {
            openDetailModal(title, desc, img);
            return;
        }

        if (action === 'apoiar') {
            openSupportModal(title);
            return;
        }
    });

    // search
    let activeTag = '';
    if (searchInput) {
        let t;
        searchInput.addEventListener('input', (ev) => {
            clearTimeout(t);
            t = setTimeout(() => renderList(searchInput.value, activeTag), 220);
        });
    }

    // tag filtering
    tagsContainer.addEventListener('click', (ev) => {
        const btn = ev.target.closest('.tag-btn');
        if (!btn) return;
        const tag = btn.getAttribute('data-tag');
        if (activeTag === tag) { activeTag = ''; btn.classList.remove('active'); }
        else {
            activeTag = tag;
            tagsContainer.querySelectorAll('.tag-btn').forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
        }
        renderList(searchInput ? searchInput.value : '', activeTag);
    });

    function openDetailModal(title, desc, img) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal" role="dialog" aria-modal="true">
                <button class="close" aria-label="Fechar">Fechar</button>
                <div class="modal-body-flex">
                    <img src="${img}" alt="${escapeHtml(title)}" loading="lazy">
                    <div>
                        <h3 style="color:#ff5fae;">${escapeHtml(title)}</h3>
                        <p>${escapeHtml(desc)}</p>
                        <div style="margin-top:12px"><button class="botao" id="modal-support">Quero Ajudar</button></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (ev) => {
            if (ev.target === overlay || ev.target.classList.contains('close')) overlay.remove();
        });
        const sup = overlay.querySelector('#modal-support');
        sup && sup.addEventListener('click', () => {
            const supports = JSON.parse(localStorage.getItem('nexus_supports') || '[]');
            supports.push({ project: title, at: new Date().toISOString() });
            localStorage.setItem('nexus_supports', JSON.stringify(supports));
            sup.textContent = 'Obrigada! 💜';
            setTimeout(()=>overlay.remove(), 1200);
        });
    }

    function openSupportModal(title) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal" role="dialog" aria-modal="true">
                <button class="close" aria-label="Fechar">Fechar</button>
                <div>
                    <h3 style="color:#ff5fae;">Apoiar: ${escapeHtml(title)}</h3>
                    <p>Quer apoiar este projeto? Obrigado! Clique em "Quero Ajudar" para receber instruções por email.</p>
                    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
                        <button class="botao" id="btn-apoio">Quero Ajudar</button>
                        <button class="btn-danger close">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (ev) => {
            if (ev.target === overlay || ev.target.classList.contains('close')) overlay.remove();
        });
        const apoioBtn = overlay.querySelector('#btn-apoio');
        apoioBtn && apoioBtn.addEventListener('click', () => {
            const supports = JSON.parse(localStorage.getItem('nexus_supports') || '[]');
            supports.push({ project: title, at: new Date().toISOString() });
            localStorage.setItem('nexus_supports', JSON.stringify(supports));
            apoioBtn.textContent = 'Obrigado!';
            setTimeout(() => overlay.remove(), 1200);
        });
    }
    // (registros list moved to cadastro afterRender)
});

// =================== CADASTRO ===================
Templates.register("cadastro",
`<section>
    <h2>Cadastro</h2>
    <form id="form-cadastro" class="formulario">
        <div class="row"><label>Nome<input name="nome" type="text" required></label></div>
        <div class="row"><label>Email<input name="email" type="email" required></label></div>
        <div class="row"><label>Telefone<input name="telefone" type="tel" required></label></div>
        <div class="row"><label>CPF<input name="cpf" type="text" placeholder="000.000.000-00" required></label></div>
        <div class="row"><label>Endereço<input name="endereco" type="text" placeholder="Rua, número, complemento"></label></div>
        <div class="row"><label>Cidade<input name="cidade" type="text" placeholder="Cidade"></label></div>
        <div class="row"><label>Disponibilidade<select name="disponibilidade"><option value="manha">Manhã</option><option value="tarde">Tarde</option><option value="noite">Noite</option><option value="fimsemana">Fins de semana</option></select></label></div>
        <div class="row"><label>Habilidades / Observações<textarea name="observacoes" rows="3" placeholder="Escreva como quer ajudar (ex: alfabetização, eventos, cozinha)"></textarea></label></div>
        <div class="row"><label>Senha<input name="senha" type="password" required></label></div>
        <div class="row"><label>Confirmar Senha<input name="senha_confirm" type="password" required></label></div>
        <div class="row"><button type="submit" class="botao">Enviar</button></div>
    </form>
    <div id="form-mensagem"></div>
    <h3>Registros salvos</h3>
    <div id="registros-list" class="reg-list">Carregando...</div>
</section>`, (root) => {
    // render lista de registros e habilita exclusão
    const listContainer = root.querySelector('#registros-list');
    function renderRegistros() {
        const regs = JSON.parse(localStorage.getItem('nexus_registros') || '[]');
        if (!listContainer) return;
        if (!regs.length) { listContainer.innerHTML = '<p>Nenhum registro encontrado.</p>'; return; }
        listContainer.innerHTML = regs.map((r, idx) => `
            <div class="reg-item" data-idx="${idx}">
                <div class="meta">
                    <strong>${escapeHtml(r.nome||'')}</strong><br>
                    <small>${escapeHtml(r.email||'')} • ${escapeHtml(r.telefone||'')}</small>
                </div>
                <div class="actions">
                    <button class="btn-danger" data-action="delete" data-idx="${idx}">Excluir</button>
                </div>
            </div>
        `).join('');
    }
    renderRegistros();
    listContainer && listContainer.addEventListener('click', (e) => {
        const btn = e.target.closest && e.target.closest('[data-action="delete"]');
        if (!btn) return;
        const idx = Number(btn.getAttribute('data-idx'));
        const regs = JSON.parse(localStorage.getItem('nexus_registros') || '[]');
        if (idx >= 0 && idx < regs.length) {
            regs.splice(idx, 1);
            localStorage.setItem('nexus_registros', JSON.stringify(regs));
            renderRegistros();
        }
    });
});
