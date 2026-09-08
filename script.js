/**
 * PORTFÓLIO CARLOS FELIPE RAMOS LESSA - SCRIPT.JS
 * Deterministic, accessible, lightweight vanilla JavaScript ES6+
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initEmailCopy();
  initProjectFilters();
  initArchitectureModal();
  initMobileMenu();
  initScrollSpy();
  initContactForm();
});

/* --------------------------------------------------------------------------
   1. THEME SWITCHER (Dark/Light with localStorage + System Preference)
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const html = document.documentElement;

  const savedTheme = localStorage.getItem('dev_portfolio_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('dev_portfolio_theme', newTheme);
    });
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('title', theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro');
      themeToggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro');
    }
  }
}

/* --------------------------------------------------------------------------
   2. RECRUITER 1-CLICK EMAIL COPY & TOAST NOTIFICATION
   -------------------------------------------------------------------------- */
function initEmailCopy() {
  const EMAIL_ADDRESS = 'lessatubexd@gmail.com';
  const copyButtons = [
    document.getElementById('quickCopyEmailBtn'),
    document.getElementById('heroCopyEmail'),
    document.getElementById('inlineCopyEmailBtn')
  ].filter(Boolean);

  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      copyToClipboard(EMAIL_ADDRESS, 'E-mail copiado! ' + EMAIL_ADDRESS);
    });
  });
}

function copyToClipboard(text, successMessage) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMessage);
    }).catch(() => {
      fallbackCopy(text, successMessage);
    });
  } else {
    fallbackCopy(text, successMessage);
  }
}

function fallbackCopy(text, successMessage) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successMessage);
  } catch (err) {
    showToast('Pressione Ctrl+C para copiar: ' + text);
  }
  document.body.removeChild(textArea);
}

let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

/* --------------------------------------------------------------------------
   3. PROJECT FILTERING (Instant Smooth Tab Switching)
   -------------------------------------------------------------------------- */
function initProjectFilters() {
  const filterButtons = document.querySelectorAll('.filter-chip');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Update active chip
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Filter projects
      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   4. INTERACTIVE ARCHITECTURE & STAR DEEP DIVE MODAL
   -------------------------------------------------------------------------- */
const PROJECT_DEEP_DIVES = {
  pizzaria: {
    badge: 'Backend & RESTful API Architecture',
    title: 'FastAPI Pizzaria Delivery — Autenticação JWT, SQLAlchemy & Schemas Pydantic',
    diagram: `[ Cliente Web / Mobile / Swagger UI ]
              │
              ▼  (HTTP POST /pedidos/ com Bearer JWT Token)
    ┌────────────────────────────────────────────────────────┐
    │ FastAPI Application Core (main.py + CORS Middleware)   │
    └────────────────────────────────────────────────────────┘
              │
              ▼ (Verificação de Autenticação / dependencies.py)
    ┌────────────────────────────────────────────────────────┐
    │ OAuth2PasswordBearer + Validação de Assinatura JWT     │
    │  - Decodifica Token (HS256) e extrai sub (user_id)     │
    │  - Injeta Sessão de Banco de Dados (yield get_db)      │
    └────────────────────────────────────────────────────────┘
              │
              ▼ (Roteamento Modular / order_routes.py)
    ┌────────────────────────────────────────────────────────┐
    │ Schemas de Validação Pydantic (Entrada & Saída)        │
    │  - ItemPedidoCreate: { item_id, quantidade, notas }    │
    │  - Validação estrita de tipos e sanitização de dados   │
    └────────────────────────────────────────────────────────┘
              │
              ▼ (Transação Atômica com SQLAlchemy ORM)
    ┌────────────────────────────────────────────────────────┐
    │ PostgreSQL / SQLite Database                           │
    │  - Tabela Pedidos (status, valor_total, data_criacao)  │
    │  - Tabela ItensPedido (relacionamento 1:N com Pedido)  │
    │  - Recálculo dinâmico do valor total do pedido         │
    └────────────────────────────────────────────────────────┘
              │
              ▼
    [ Resposta JSON HTTP 201 Created com PedidoResponse ]`,
    tradeoffs: [
      {
        choice: 'FastAPI vs Flask / Django',
        reason: 'O FastAPI oferece alta performance assíncrona nativa com Starlette e Pydantic, reduzindo latência de I/O em endpoints de pedidos e gerando documentação OpenAPI/Swagger 100% automática.'
      },
      {
        choice: 'SQLAlchemy com Injeção de Dependências (yield get_db)',
        reason: 'O padrão de injeção por yield garante que toda sessão de banco de dados seja estritamente fechada ao término do ciclo de requisição/resposta, prevenindo connection leaks no PostgreSQL.'
      },
      {
        choice: 'Autenticação Stateless com JWT (Access & Refresh Tokens)',
        reason: 'Elimina a necessidade de armazenamento de sessões em memória do servidor, permitindo que a API escale horizontalmente mantendo segurança rigorosa com expiração curta de tokens.'
      }
    ],
    qualityChecklist: [
      'Documentação interativa Swagger UI (/docs) e Redoc disponíveis nativamente',
      'Criptografia de senhas com algoritmo bcrypt e salt automático via Passlib',
      'Validação bidirecional de dados com Schemas Pydantic v2',
      'Separação modular de rotas: /auth para segurança e /pedidos para gestão'
    ],
    github: 'https://github.com/CarlosFelipeLessa/fastapi-pizzaria-delivery',
    demo: 'https://github.com/CarlosFelipeLessa/fastapi-pizzaria-delivery#readme'
  },

  banco: {
    badge: 'Desktop Software & POO Architecture',
    title: 'Sistema de Gestão Bancária — POO Avançada & CustomTkinter',
    diagram: `[ Interface Gráfica CustomTkinter (Janela Principal) ]
              │
              ▼  (Eventos de Clique: Depósito, Saque, Extrato)
    ┌────────────────────────────────────────────────────────┐
    │ Camada de Apresentação (Views / Frames Responsivos)    │
    │  - Validação de entrada numérica e feedback visual     │
    │  - Modo Escuro (Dark Mode) nativo                      │
    └────────────────────────────────────────────────────────┘
              │
              ▼
    ┌────────────────────────────────────────────────────────┐
    │ BancoService (Controller de Regras de Negócio)         │
    │  - Autentica credenciais do correntista                │
    │  - Valida regras de saldo, limites de saque diário     │
    └────────────────────────────────────────────────────────┘
              │
              ▼ (Instanciação de Objetos de Domínio)
    ┌────────────────────────────────────────────────────────┐
    │ Entidades de Domínio (Classes POO)                     │
    │  - Cliente (nome, cpf, lista de contas)                │
    │  - Conta (agencia, numero, saldo, historico)           │
    │  - Transacao: Deposito, Saque (Herança & Polimorfismo) │
    └────────────────────────────────────────────────────────┘
              │
              ▼
    ┌────────────────────────────────────────────────────────┐
    │ Storage Manager (Persistência Estruturada em JSON)     │
    │  - Gravação atômica do estado das contas e extratos    │
    │  - Recuperação consistente no ciclo de inicialização   │
    └────────────────────────────────────────────────────────┘`,
    tradeoffs: [
      {
        choice: 'Programação Orientada a Objetos (POO) vs Abordagem Procedural',
        reason: 'A modelagem orientada a objetos isola as regras financeiras em entidades ricas (Conta, Transacao), facilitando testes, manutenibilidade e expansão para novos tipos de conta.'
      },
      {
        choice: 'CustomTkinter vs Tkinter Nativo Padrão',
        reason: 'CustomTkinter fornece suporte nativo a Dark Mode moderno, cantos arredondados e renderização em alta resolução em múltiplos sistemas operacionais sem dependências pesadas de web.'
      },
      {
        choice: 'Persistência em JSON com Estrutura Normalizada',
        reason: 'Dispensa instalações complexas de banco de dados para a aplicação desktop do cliente, permitindo portabilidade imediata e inspeção legível dos registros de extrato.'
      }
    ],
    qualityChecklist: [
      'Modelagem arquitetural validada com diagramas de classes UML completos',
      'Tratamento preventivo de exceções para valores negativos e tipos inválidos',
      'Histórico transacional completo de movimentações para extrato auditável',
      'Código modular estruturado seguindo as convenções do PEP 8'
    ],
    github: 'https://github.com/CarlosFelipeLessa/Sistema-Bancario',
    demo: 'https://github.com/CarlosFelipeLessa/Sistema-Bancario#readme'
  },

  agile: {
    badge: 'Engenharia de Software & Métodos Ágeis',
    title: 'Análise Sistêmica do Framework Scrum — Pôster Científico na UVA',
    diagram: `[ Visão de Negócio & Stakeholders ]
              │
              ▼
    ┌────────────────────────────────────────────────────────┐
    │ Product Backlog (Priorizado com exclusividade pelo PO) │
    └────────────────────────────────────────────────────────┘
              │
              ▼  (Sprint Planning Meeting - Timebox 1 a 4 semanas)
    ┌────────────────────────────────────────────────────────┐
    │ Sprint Backlog (Itens selecionados + Plano da Equipe)  │
    └────────────────────────────────────────────────────────┘
              │
              ▼  (Execução Iterativa com Daily Scrum de 15 min)
    ┌────────────────────────────────────────────────────────┐
    │ Time de Desenvolvimento Multifuncional & Scrum Master  │
    │  - Foco em auto-organização e eliminação de bloqueios  │
    │  - Pilares Empíricos: Transparência, Inspeção, Adaptação│
    └────────────────────────────────────────────────────────┘
              │
              ▼
    ┌────────────────────────────────────────────────────────┐
    │ Sprint Review (Demonstração do Software aos Clientes)  │
    │  & Sprint Retrospective (Inspeção de Processos do Time)│
    └────────────────────────────────────────────────────────┘
              │
              ▼
    [ Incremento Funcional Potencialmente Utilizável (DoD) ]`,
    tradeoffs: [
      {
        choice: 'Ciclo Empírico Iterativo (Scrum) vs Modelo Prescritivo (Cascata/BDUF)',
        reason: 'Em cenários com requisitos dinâmicos, o Scrum reduz incertezas e riscos logo nas primeiras semanas, antecipando o Retorno sobre o Investimento (ROI) em comparação a entregas monolíticas tardias.'
      },
      {
        choice: 'Product Owner Dedicado vs Múltiplos Tomadores de Decisão',
        reason: 'Concentrar a priorização no Product Owner elimina ruídos e conflitos de escopo, garantindo que o time sempre trabalhe no item de maior valor para o negócio.'
      },
      {
        choice: 'Cerimônias com Timebox Estrito vs Reuniões Informais Sem Pauta',
        reason: 'Timeboxes definidos mantêm o ritmo de entrega constante e evitam reuniões improdutivas, assegurando disciplina sem engessar a equipe.'
      }
    ],
    qualityChecklist: [
      'Pôster e artigo científico estruturados rigorosamente conforme ABNT NBR 6023',
      'Articulação teórico-prática com a disciplina Teoria Geral de Sistemas (UVA 2026)',
      'Identificação clara dos principais desafios: resistência cultural e "ágil sem disciplina"',
      'Documento acadêmico em PDF de alta qualidade visual gerado e aprovado'
    ],
    github: 'https://github.com/CarlosFelipeLessa/Metodo-Agil',
    demo: 'https://drive.google.com/file/d/13m1ZPZzojMsZPeSmn1jDH-6YaEm5Z7VZ/view?usp=drivesdk'
  },

  python_poo: {
    badge: 'Python & Algoritmos',
    title: 'Especialização em Python — Mundos 1 a 4 & Arquitetura Orientada a Objetos',
    diagram: `[ Resolução de Problemas & Lógica Computacional ]
              │
              ▼
    ┌────────────────────────────────────────────────────────┐
    │ Mundos 1 & 2: Fundamentos & Estruturas de Controle     │
    │  - Tipos primitivos, operadores, condicionais aninhadas│
    │  - Laços de repetição (for, while com flags de parada) │
    └────────────────────────────────────────────────────────┘
              │
              ▼
    ┌────────────────────────────────────────────────────────┐
    │ Mundo 3: Coleções & Modularização                      │
    │  - Tuplas, Listas compostas, Dicionários complexos     │
    │  - Funções, empacotamento de parâmetros (*args, **kw)  │
    │  - Criação de Módulos e Pacotes reutilizáveis          │
    └────────────────────────────────────────────────────────┘
              │
              ▼
    ┌────────────────────────────────────────────────────────┐
    │ Mundo 4: Programação Orientada a Objetos (POO)         │
    │  - Classes, atributos de instância e de classe         │
    │  - Encapsulamento (getters/setters), Herança múltipla  │
    │  - Polimorfismo e Métodos Mágicos (__init__, __str__)  │
    └────────────────────────────────────────────────────────┘
              │
              ▼
    [ Aplicações Reais: Automações, CLIs com Rich & APIs ]`,
    tradeoffs: [
      {
        choice: 'Modularização em Pacotes vs Scripts Monolíticos Únicos',
        reason: 'Dividir o código em módulos com responsabilidade única permite reuso de funções em diferentes projetos e facilita a manutenção contínua.'
      },
      {
        choice: 'Uso de Type Hints em Python 3 vs Tipagem Dinâmica Implícita',
        reason: 'Anotações de tipo melhoram a legibilidade do código, facilitam refatorações seguras e integram perfeitamente com Pydantic e linters modernos.'
      },
      {
        choice: 'Estilização de Terminais com a Biblioteca Rich vs print() Convencional',
        reason: 'Rich transforma ferramentas de linha de comando em interfaces visuais legíveis com tabelas, painéis e cores sem overhead excessivo.'
      }
    ],
    qualityChecklist: [
      'Mais de 100 desafios práticos resolvidos e catalogados por complexidade',
      'Código aderente aos padrões de estilo e convenções da PEP 8',
      'Tratamento preventivo de exceções com blocos try/except/finally',
      'Repositórios no GitHub com histórico semântico de evolução'
    ],
    github: 'https://github.com/CarlosFelipeLessa/Python_CeV-Mundo1-2-3',
    demo: 'https://github.com/CarlosFelipeLessa/Curso-Python-POO'
  }
};

function initArchitectureModal() {
  const modalOverlay = document.getElementById('deepDiveModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalCloseBtnSec = document.getElementById('modalCloseBtnSecondary');
  const modalBadge = document.getElementById('modalBadge');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalFooterLinks = document.getElementById('modalFooterLinks');

  if (!modalOverlay) return;

  const deepDiveButtons = document.querySelectorAll('.btn-deep-dive');

  deepDiveButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const projectId = btn.getAttribute('data-project-id');
      const projectData = PROJECT_DEEP_DIVES[projectId];
      if (!projectData) return;

      modalBadge.textContent = projectData.badge;
      modalTitle.textContent = projectData.title;

      let tradeoffsHTML = projectData.tradeoffs.map(t => `
        <li class="tradeoff-item">
          <strong>${escapeHTML(t.choice)}</strong>
          <span>${escapeHTML(t.reason)}</span>
        </li>
      `).join('');

      let checklistHTML = projectData.qualityChecklist.map(item => `
        <li style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <svg style="width: 16px; height: 16px; color: var(--accent-green); flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>${escapeHTML(item)}</span>
        </li>
      `).join('');

      modalBody.innerHTML = `
        <div class="modal-section">
          <h4 class="modal-section-title">
            <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            Topologia de Arquitetura & Fluxo
          </h4>
          <pre class="modal-ascii-box"><code>${escapeHTML(projectData.diagram)}</code></pre>
        </div>

        <div class="modal-section">
          <h4 class="modal-section-title">
            <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            Decisões Técnicas & Trade-offs
          </h4>
          <ul class="tradeoff-list">
            ${tradeoffsHTML}
          </ul>
        </div>

        <div class="modal-section">
          <h4 class="modal-section-title">
            <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Padrões de Qualidade Aplicados
          </h4>
          <ul style="list-style: none; padding: 0;">
            ${checklistHTML}
          </ul>
        </div>
      `;

      modalFooterLinks.innerHTML = `
        <a href="${projectData.github}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/></svg>
          <span>Repositório GitHub</span>
        </a>
        <a href="${projectData.demo}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
          <span>Ver Demonstração / Documento</span>
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      `;

      openModal();
    });
  });

  function openModal() {
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalCloseBtn.focus();
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  modalCloseBtn.addEventListener('click', closeModal);
  if (modalCloseBtnSec) modalCloseBtnSec.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

/* --------------------------------------------------------------------------
   5. MOBILE DRAWER NAVIGATION
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const drawer = document.getElementById('mobileMenu');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('open');
    drawer.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', !isOpen);
    drawer.setAttribute('aria-hidden', isOpen);
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
    });
  });
}

/* --------------------------------------------------------------------------
   6. SCROLL SPY (Active Navigation Link on Scroll)
   -------------------------------------------------------------------------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => observer.observe(sec));
}

/* --------------------------------------------------------------------------
   7. CONTACT FORM VALIDATION & INSTANT FEEDBACK
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const nameInput = document.getElementById('formName');
  const emailInput = document.getElementById('formEmail');
  const messageInput = document.getElementById('formMessage');
  const submitBtn = document.getElementById('formSubmitBtn');
  const formStatus = document.getElementById('formStatus');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim()) {
      showFieldError('formName', 'Por favor, informe seu nome ou empresa.');
      isValid = false;
    } else {
      clearFieldError('formName');
    }

    // Validate Email
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      showFieldError('formEmail', 'Por favor, insira um e-mail válido.');
      isValid = false;
    } else {
      clearFieldError('formEmail');
    }

    // Validate Message
    if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
      showFieldError('formMessage', 'A mensagem deve conter pelo menos 10 caracteres.');
      isValid = false;
    } else {
      clearFieldError('formMessage');
    }

    if (!isValid) return;

    // Simulate submission
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Enviando...</span>`;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Enviar Mensagem Direta</span>`;
      form.reset();

      formStatus.className = 'form-status success';
      formStatus.innerHTML = `
        <strong>Mensagem enviada com sucesso!</strong>
        <p style="margin-top: 4px; font-size: 0.8125rem;">Obrigado pelo contato. Retornarei em breve pelo e-mail lessatubexd@gmail.com.</p>
      `;

      showToast('Mensagem enviada com sucesso! Responderei em breve.');
    }, 1000);
  });

  function showFieldError(fieldId, msg) {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId + 'Error');
    if (input) input.classList.add('error');
    if (errorSpan) errorSpan.textContent = msg;
  }

  function clearFieldError(fieldId) {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId + 'Error');
    if (input) input.classList.remove('error');
    if (errorSpan) errorSpan.textContent = '';
  }
}
