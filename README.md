# Nexus ONG — Entrega Final (Experiência Prática IV)

Este repositório contém o site da Nexus ONG, preparado para a entrega final da disciplina.

Resumo das mudanças principais nesta entrega
- CSS totalmente refatorado para suportar temas (claro / escuro) e modo de alto contraste.
- Utilitários de acessibilidade adicionados: skip-link, foco visível (:focus-visible), suporte a prefers-reduced-motion, e componentes com ARIA.
- JavaScript de acessibilidade adicionado (`js/accessibility.js`) para alternância de tema, trap de foco em modais e fechamento por ESC.
- Página Projetos e Início com interações (busca, tags, favoritar, modais), SPA por hash (`js/main.js` + `js/spa.js`).
- Arquivo CSS minificado criado em `css/style.min.css` para uso em produção.

Objetivo desta documentação

Fornecer instruções claras para:
- executar o projeto localmente;
- validar requisitos de acessibilidade (WCAG 2.1 AA);
- preparar artefatos para produção (minificação e otimização de imagens);
- seguir uma estratégia de versionamento/branching (GitFlow) e práticas de commits semânticos.

1) Executar localmente

Requisitos mínimos: Node.js (opcional para scripts de build), ou qualquer servidor estático (Python, Live Server, etc.).

Opções rápidas (Windows - cmd):

```cmd
REM Servir uma versão estática com Python (se instalado)
python -m http.server 8000

REM Abra no navegador: http://localhost:8000
```

O site utiliza módulos ES (scripts com type="module"), portanto deve ser servido por HTTP (não abrir o arquivo diretamente via file://).

2) Acessibilidade — lista de verificação (WCAG 2.1 AA)

- Navegação por teclado: Garantir que toda interação seja possível via teclado (Tab, Shift+Tab, Enter, Space). O projeto adiciona foco visível (`:focus-visible`) e handlers para Enter/Space onde necessário.
- Estrutura semântica: cabeçalho (`header`), navegação (`nav`), conteúdo principal (`main`), rodapé (`footer`) estão presentes.
- Contraste: cores foram selecionadas para boa legibilidade; execute uma varredura com Lighthouse ou axe para confirmar contraste mínimo 4.5:1 em áreas dinâmicas.
- Leitores de tela: controle de modais com `role="dialog"` e `aria-modal="true"`. Quando um modal abre, a aplicação marca `aria-hidden` nos elementos principais para evitar leitura concorrente.
- Alto contraste: botão no header ativa modo de alto contraste (`.high-contrast`) para tornar o site acessível sem alterar layout.

Recomendações para validação final:
- Rode o Lighthouse no Chrome (Accessibility) e consulte itens pontuais.
- Rode axe DevTools para checagens automatizadas de contraste e labels.

3) Otimização para produção

- CSS/JS minificados: já existe `css/style.min.css`. Para gerar programaticamente, sugiro usar PostCSS + cssnano ou ferramentas equivalentes.
- Compressão de imagens: converta imagens para WebP/AVIF e gere múltiplos tamanhos (responsive) — use ferramentas como `sharp` ou serviços externos.
- Gzip/Brotli: configure seu servidor/hosting (ex.: GitHub Pages, Netlify, Vercel) para servir compressão.

Exemplo de script local (opcional)

package.json (exemplo) com scripts:

```json
{
	"scripts": {
		"build:css": "postcss css/style.css -o css/style.min.css --env production"
	}
}
```

4) Versionamento e entrega (Git/GitHub)

Recomenda-se seguir GitFlow para essa entrega:
- branch `main` (produção), `develop` (integração), feature branches `feature/<nome>`, release branches `release/<versao>`, hotfix `hotfix/<versao>`.

Commits semânticos sugeridos: use mensagens no formato `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.

Releases:
- Ao finalizar uma release, crie uma tag semântica: `v1.0.0` e gere um Release no GitHub com notas (o arquivo CHANGELOG pode ser mantido manualmente ou via ferramentas como conventional-changelog).

Observação: eu atualizei arquivos locais conforme as exigências de front-end e acessibilidade, porém não alterei o histórico Git remoto (commits/PRs/release) — isso precisa ser feito por você no repositório público (p.ex.: criar branches, abrir PRs, marcar milestones).

5) Arquivos modificados / pontos de atenção

- `css/style.css` e `css/style.min.css` — estilos refatorados e minificados.
- `index.html` — adicionei skip-link, controles de tema e carregamento de `js/accessibility.js`.
- `js/accessibility.js` — novo módulo para temas e acessibilidade (trap de foco em modais, ESC para fechar).
- `js/menu.js` — melhorias ARIA/teclado.
- `js/spa.js` — mantém a lógica de templates e modais (os modais agora serão observados pelo `accessibility.js` para trap de foco).

6) Checklist final de entrega (o que você deve confirmar antes de enviar)

- [ ] Repositório público (GitHub) e link público fornecido ao avaliador.
- [ ] Branching conforme GitFlow (ex.: `develop` -> `release/vX.Y.Z` -> `main`).
- [ ] Histórico de commits organizado e semântico (re-escrever com rebase somente se necessário e autorizado pela equipe).
- [ ] Pull Requests com descrição e issues vinculadas.
- [ ] README atualizado (este arquivo) presente na raiz do repositório.
- [ ] Relatório/prints de auditoria de acessibilidade (Lighthouse/axe) anexados à entrega.
- [ ] Assets de produção otimizados (imagens comprimidas) e CSS/JS minificados.

7) Próximos passos que posso automatizar aqui (diga se quer que eu faça):

- Gerar `package.json` com scripts de build (PostCSS/cssnano) e instruções.
- Adicionar um `CHANGELOG.md` e um template de Release.
- Gerar um relatório básico de acessibilidade via axe-core (requer instalação local de dependências).

Se quiser que eu gere o `package.json` com scripts de build e um `CHANGELOG.md` inicial, responda "Sim, gere o package.json e CHANGELOG" e eu adiciono estes arquivos e as instruções passo a passo.

---
Arquivo gerado automaticamente pelo assistente para auxiliar na entrega. Atualize o conteúdo final com informações pessoais e de contato antes de enviar.
