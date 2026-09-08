/**
 * DEVPORTFOLIO PRO MAX - SCRIPT.JS
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
  const EMAIL_ADDRESS = 'carlos.henrique@eng.dev';
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
  paystream: {
    badge: 'Backend & FinTech Architecture',
    title: 'PayStream — Arquitetura de Liquidação & Idempotência',
    diagram: `[ Cliente API / Webhook Gateway ]
              │
              ▼  (HTTP POST /v1/payments + Idempotency-Key Header)
    ┌────────────────────────────────────────────────────────┐
    │  API Gateway & Distributed Lock (Redis Redlock TTL 30s) │
    └────────────────────────────────────────────────────────┘
              │ (Verifica Duplicidade em Cache)
              ├─────────────────────────────┐
              ▼ (Chave Nova)                ▼ (Chave Existente)
    ┌───────────────────────────┐  ┌─────────────────────────┐
    │ Transação ACID PostgreSQL │  │ Retorna Resposta Salva  │
    │  - Grava Registro Pedido  │  │ HTTP 200 (Sem Re-exec)  │
    │  - Grava Tabela Outbox    │  └─────────────────────────┘
    └───────────────────────────┘
              │
              ▼ (Debezium CDC / Outbox Relay Worker)
    ┌────────────────────────────────────────────────────────┐
    │ RabbitMQ Exchange (Direct + Dead Letter Queue + TTL)   │
    └────────────────────────────────────────────────────────┘
              │
              ▼ (Workers de Liquidação com Retries Exponenciais)
    [ Gateway de Pagamento Externo (Stripe / Adyen / Pix) ]`,
    tradeoffs: [
      {
        choice: 'Outbox Pattern com PostgreSQL vs Publicação Direta no RabbitMQ',
        reason: 'A publicação direta em brokers de mensageria sofre de risco de consistência eventual caso a transação do banco sofra rollback após o envio da mensagem. O Transactional Outbox garante atomicidade estrita de 100%.'
      },
      {
        choice: 'Redis Distributed Lock vs Locks Pessimistas de Banco (FOR UPDATE)',
        reason: 'O lock em memória no Redis desacopla a verificação de concorrência dos recursos de CPU e pool de conexões do PostgreSQL, aguentando picos de 10.000 requisições simultâneas sem degradar o banco.'
      },
      {
        choice: 'Dead Letter Exchanges (DLX) com Políticas de Retry Inteligente',
        reason: 'Erros transientes (ex: 504 Gateway Timeout do adquirente) sofrem retry exponencial com jitter de até 5 tentativas antes de irem para a fila de inspeção manual, garantindo autorrecuperação sem intervenção humana.'
      }
    ],
    qualityChecklist: [
      'Cobertura de testes unitários e de integração em 94% com Jest e Supertest',
      'Testes de Caos com injeção de latência simulada e queda de nós RabbitMQ',
      'Auditoria de segurança contra race conditions e ataques de replay de transações',
      'Métricas Prometheus expostas: payment_latency_seconds_bucket e payment_errors_total'
    ],
    github: 'https://github.com/carloshenrique-dev/paystream-engine',
    demo: 'https://paystream-demo.carloshenrique.dev'
  },

  cloudmetrics: {
    badge: 'Full Stack & Observability SaaS',
    title: 'CloudMetrics — Telemetria em Tempo Real com ClickHouse',
    diagram: `[ Agentes de Telemetria nos Servidores (DaemonSet) ]
              │ (gRPC Stream / Batches de 500ms)
              ▼
    ┌────────────────────────────────────────────────────────┐
    │ Ingestão Go / Fiber (Pool de Workers Concorrentes)     │
    └────────────────────────────────────────────────────────┘
              │
              ▼ (Bulk Insert em Lotes Colunares)
    ┌────────────────────────────────────────────────────────┐
    │ ClickHouse Cluster (Tabelas MergeTree Particionadas)   │
    └────────────────────────────────────────────────────────┘
              │
              ▲ (WebSockets Bidirecionais com Filtro por Tenant)
    ┌────────────────────────────────────────────────────────┐
    │ Next.js 14 Frontend (Streaming de Séries Temporais)     │
    │  - Canvas 2D / WebGL para Gráficos a 60 FPS            │
    │  - Virtualização de Listas de Nós e Alertas             │
    └────────────────────────────────────────────────────────┘`,
    tradeoffs: [
      {
        choice: 'ClickHouse Colunar vs PostgreSQL / TimescaleDB',
        reason: 'ClickHouse oferece compressão colunar de até 5:1 e velocidade de agregação de bilhões de linhas por segundo, reduzindo os custos de infraestrutura de armazenamento em mais de 65% em comparação com bancos relacionais.'
      },
      {
        choice: 'WebSockets Multiplexados vs Polling HTTP / SSE',
        reason: 'WebSockets permitiram que um único canal persistente trafegasse métricas de múltiplos servidores com compressão binária, eliminando o overhead de headers HTTP frequentes.'
      },
      {
        choice: 'Renderização via Canvas 2D vs SVG com D3.js',
        reason: 'Quando se plota mais de 50.000 pontos em tempo real, nós no DOM (SVG) travam o navegador do usuário. Canvas executa direto na GPU mantendo 60 frames por segundo estáveis.'
      }
    ],
    qualityChecklist: [
      'Lighthouse Score: 98 Performance / 100 SEO / 100 Acessibilidade',
      'Suporte a Dark Mode OLED nativo com contraste auditado para salas de controle (NOC)',
      'Testes end-to-end de streaming com Playwright cobrindo reconexão automática'
    ],
    github: 'https://github.com/carloshenrique-dev/cloudmetrics-platform',
    demo: 'https://cloudmetrics.carloshenrique.dev'
  },

  devstore: {
    badge: 'Full Stack Serverless E-commerce',
    title: 'DevStore — Checkout Transparente Serverless & Multi-Tenant',
    diagram: `[ Comprador no Carrinho (Next.js / React) ]
              │
              ▼ (POST /checkout/session)
    ┌────────────────────────────────────────────────────────┐
    │ AWS CloudFront CDN + API Gateway com WAF Rate-Limiting │
    └────────────────────────────────────────────────────────┘
              │
              ▼ (Invoca Função Lambda em Python/Node.js)
    ┌────────────────────────────────────────────────────────┐
    │ AWS Lambda (Checkout Session Controller)               │
    │  - Valida Estoque em Cache Dinâmico Redis              │
    │  - Gera Intenção de Pagamento Segura via Stripe API   │
    └────────────────────────────────────────────────────────┘
              │
              ▼ (Grava Pedido no DynamoDB Single-Table Design)
    ┌────────────────────────────────────────────────────────┐
    │ Amazon DynamoDB (Auto-Scaling On-Demand)               │
    └────────────────────────────────────────────────────────┘
              │
              ▼ (Webhook Stripe recebido com Assinatura Criptográfica)
    [ Fila SQS -> Lambda de Faturamento -> Notificação SNS ]`,
    tradeoffs: [
      {
        choice: 'AWS Lambda Serverless vs Containers ECS/Fargate',
        reason: 'Para o pico extremo de tráfego de Black Friday (que dura poucas horas), Serverless escala de 0 a milhares de instâncias em segundos sem custo ocioso nos meses regulares.'
      },
      {
        choice: 'DynamoDB Single-Table Design vs Banco Relacional',
        reason: 'Modelagem orientada a padrões de acesso (Customer, Order, LineItems na mesma tabela) garante latências de leitura e gravação previsíveis abaixo de 8ms, independente do volume de dados.'
      },
      {
        choice: 'Micro-Frontend de Checkout Desacoplado',
        reason: 'Garante que mesmo que o catálogo ou ferramentas de marketing sofram lentidão, o pipeline de conversão financeira permaneça 100% isolado e ultra-rápido.'
      }
    ],
    qualityChecklist: [
      'Compliance PCI-DSS (Nenhum dado sensível de cartão trafega pelos servidores)',
      'Testes de carga com Artillery simulando 5.000 checkouts por minuto',
      'Infraestrutura como Código 100% reproduzível via Terraform'
    ],
    github: 'https://github.com/carloshenrique-dev/devstore-checkout-core',
    demo: 'https://devstore.carloshenrique.dev'
  },

  scalerflow: {
    badge: 'Distributed Systems & Cloud Computing',
    title: 'ScalerFlow — Motor de Processamento Assíncrono com Kubernetes',
    diagram: `[ APIs Transacionais & Sistemas Internos ]
              │
              ▼ (Enfileira Jobs Pesados com Prioridade)
    ┌────────────────────────────────────────────────────────┐
    │ Redis Streams (Grupos de Consumidores por Prioridade) │
    └────────────────────────────────────────────────────────┘
              │
              ▼ (Métrica de Profundidade da Fila exportada para KEDA)
    ┌────────────────────────────────────────────────────────┐
    │ Kubernetes Event-driven Autoscaling (KEDA)             │
    │  - Se Fila > 500 jobs: Escala de 3 para 20 Pods        │
    └────────────────────────────────────────────────────────┘
              │
              ▼ (Pool de Workers em Go com Concorrência Otimizada)
    ┌────────────────────────────────────────────────────────┐
    │ Pods de Workers (Geração de PDFs, Relatórios CSV, OCR) │
    └────────────────────────────────────────────────────────┘
              │
              ▼ (Upload Direto do Artefato Final)
    [ Amazon S3 Bucket + URL Assinada Enviada ao Usuário ]`,
    tradeoffs: [
      {
        choice: 'Go Workers com Goroutines vs Python Celery',
        reason: 'Go consome 85% menos memória RAM por processo de worker e suporta milhares de operações I/O concorrentes sem a necessidade de pools pesados de fork de processos.'
      },
      {
        choice: 'KEDA baseado em Profundidade de Fila vs HPA padrão por CPU',
        reason: 'Tarefas de batch podem estar com a fila cheia de trabalho pendente enquanto o uso de CPU ainda é baixo no início. O escalonamento preditivo por tamanho de fila evita atrasos de SLA.'
      },
      {
        choice: 'Upload direto para S3 com Presigned URLs',
        reason: 'Elimina o tráfego de arquivos gigabytes pela memória da API, liberando banda de rede para operações críticas do usuário.'
      }
    ],
    qualityChecklist: [
      'Graceful Shutdown em pods do Kubernetes (aguarda finalização do job corrente)',
      'Alertas no Slack via Prometheus Alertmanager para falhas repetidas',
      'Isolamento total de dependências com Docker multi-stage builds ultraleves'
    ],
    github: 'https://github.com/carloshenrique-dev/scalerflow-workers',
    demo: 'https://scalerflow.carloshenrique.dev'
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
            Topologia de Arquitetura & Fluxo de Dados
          </h4>
          <pre class="modal-ascii-box"><code>${escapeHTML(projectData.diagram)}</code></pre>
        </div>

        <div class="modal-section">
          <h4 class="modal-section-title">
            <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            Decisões Técnicas & Trade-offs (Engineering Rationale)
          </h4>
          <ul class="tradeoff-list">
            ${tradeoffsHTML}
          </ul>
        </div>

        <div class="modal-section">
          <h4 class="modal-section-title">
            <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Padrões de Qualidade & Resiliência Aplicados
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
          <span>Live Demo</span>
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      showFieldError('formEmail', 'Por favor, insira um e-mail corporativo válido.');
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
        <p style="margin-top: 4px; font-size: 0.8125rem;">Obrigado pelo contato. Retornarei em menos de 24 horas no e-mail informado.</p>
      `;

      showToast('Mensagem enviada com sucesso! Responderei em breve.');
    }, 1200);
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
