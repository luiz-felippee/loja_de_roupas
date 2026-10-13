# Implementação de Responsividade Completa (Mobile & Desktop)

Plano de modernização responsiva para a Henrique Multimarcas, cobrindo Loja Virtual, Catálogo, Fluxo de Checkout Pix, Painel da Loja (Admin) e o Gráfico Recharts de Faturamento, com foco em ergonomia móvel e cards compactos.

### User Review & Critical Decisions

> [!IMPORTANT]
> Decisões confirmadas com o usuário durante a etapa de alinhamento:
> - **Escopo de Responsividade**: Toda a aplicação (Loja Virtual, Checkout, Rastreamento e Painel Administrativo).
> - **Adaptação para Celulares**: Utilização de cards compactos e rolagem touch suave para gráficos e tabelas de catálogo/pedidos, priorizando velocidade de operação com o polegar.

- **Navegação Mobile Dedicada**: Implementação de uma barra de abas inferior fixa (Bottom Navigation Bar) no celular para troca instantânea entre Catálogo, Pedidos, Carrinho e Painel da Loja sem esticar o polegar.
- **Gráfico Recharts no Mobile**: Ajuste de margens, altura fluida (`h-64` em telas pequenas e `h-80` em desktop) e tooltip responsivo compatível com gestos de toque.
- **Tabela de Estoque e Produtos**: Em telas menores que 768px, conversão automática da tabela para cards móveis táteis com botões rápidos de incremento/decremento de estoque (+ / -).

---

### 1. Overview & Core Concept

- **O que faz**: Transforma a interface web existente em uma experiência mobile-first fluida e adaptável, que se ajusta perfeitamente de telas de smartphones (375px - 430px) até monitores desktop widescreen (1440px+).
- **Público-alvo**: Clientes comprando pelo smartphone via WhatsApp/Pix e funcionários/dono gerenciando pedidos e faturamento diretamente pelo celular no balcão ou na rua.
- **Valor central**: Eliminação de quebras de layout, barras de rolagem desnecessárias e elementos difíceis de clicar, proporcionando agilidade operacional em qualquer dispositivo.

---

### 2. User Experience & Visual Design

- **Ergonomia do Polegar (Thumb Zone)**:
  - Botões de ação principais (Finalizar Pedido, Avançar Etapa, Copiar Pix, Adicionar ao Carrinho) com altura mínima de 44px–48px.
  - Barra de navegação inferior flutuante com blur translúcido (`backdrop-blur-md bg-[#0f1117]/90`) para acesso rápido aos fluxos essenciais.
- **Grids de Produtos e Catálogo**:
  - Em smartphones: grid de 2 colunas compactas com tags de tamanho e preço nítidos (estilo e-commerce de vestuário moderno), expandindo para 3 colunas em tablets e 4 colunas em desktops.
  - Filtros de categorias e tamanhos em carrossel horizontal contínuo com toque suave e sem scrollbar invasiva.
- **Painel Administrativo & Gráfico Recharts**:
  - Cards de KPI em grid 2x2 no mobile com tipografia balanceada (`text-lg font-black tabular-nums`).
  - Gráfico de faturamento com eixos compactos (`XAxis` abreviado e `YAxis` legível) e suporte a toque para ativação de tooltip.
  - Fila de Pedidos com cartões de status em largura total no mobile e botões de avanço de etapa estendidos para toque rápido.
  - Catálogo de produtos com alternância responsiva: lista de cards compactos no celular e tabela detalhada no computador.
- **Checkout & Modal Pix**:
  - Formulário de endereço e telefone com inputs em coluna única no mobile e campos numéricos otimizados para teclado virtual.
  - QR Code Pix redimensionado para caber sem rolagem excessiva, com botão de "Copiar Código Pix" em destaque.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Dual View para Tabela de Produtos (Cards no Mobile vs. Tabela no Desktop)**
  - *Abordagem escolhida*: Exibir cards individuais com miniatura, stepper de estoque (+ / -) e botões de edição em celulares, mantendo a tabela completa em telas maiores.
  - *Por que*: Tabelas com 6 colunas ficam ilegíveis ou exigem rolagem horizontal desconfortável em telas de 375px. Cards compactos oferecem ergonomia superior para estoquistas e vendedores no celular.
  - *Alternativas consideradas*: Forçar rolagem horizontal simples na tabela inteira (rejeitado por causar atrito ao ajustar estoque).

- **Decisão 2: Barra de Navegação Inferior (Bottom Tab Bar) apenas em Telas Menores**
  - *Abordagem escolhida*: Exibir uma barra inferior fixa com ícones e contadores no mobile (`md:hidden`) e manter o Header padrão de 3 zonas no desktop.
  - *Por que*: Segue os padrões nativos do iOS/Android e da referência de Mobile Touch Apps, mantendo a altura agregada abaixo do limite estrito de 15% do viewport.

- **Decisão 3: Recharts ResponsiveContainer com Margens Dinâmicas**
  - *Abordagem escolhida*: Usar `ResponsiveContainer` com altura calibrada (`h-64 sm:h-76`) e margens laterais mínimas (`left: -15, right: 5`) para aproveitar toda a largura útil do smartphone.
  - *Por que*: Evita que o gráfico pareça comprimido ou que rótulos de dias da semana fiquem sobrepostos.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    RESPONSIVE VIEWPORT                      │
│                                                             │
│  [Desktop lg: 1024px+]          [Mobile sm/md: 375px-768px] │
│  ┌─────────────────────────┐    ┌─────────────────────────┐ │
│  │ Sticky Top Header       │    │ Compact Top Brand Bar   │ │
│  │ 4-5 Nav Links + Cart    │    │ (Menu + Cart trigger)   │ │
│  ├─────────────────────────┤    ├─────────────────────────┤ │
│  │ Hero Split Grid         │    │ Hero Banner Compact     │ │
│  │ 4-Column Product Grid   │    │ 2-Column Product Grid   │ │
│  ├─────────────────────────┤    ├─────────────────────────┤ │
│  │ Admin: 4 KPI Cards      │    │ Admin: 2x2 KPI Grid     │ │
│  │ Full Recharts (h-80)    │    │ Recharts Touch (h-64)   │ │
│  │ Order 2-Col Grid        │    │ Order 1-Col Stack       │ │
│  │ Detailed Data Table     │    │ Mobile Inventory Cards  │ │
│  └─────────────────────────┘    ├─────────────────────────┤ │
│                                 │ Fixed Bottom Tab Bar    │ │
│                                 │ (Shop · Track · Bag · Admin)
│                                 └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Mapeamento de Componentes a Atualizar:
1. `src/components/DailyRevenueChart.tsx`:
   - Margens responsivas, altura `h-64 sm:h-76`, flex-wrap ordenado no cabeçalho e cards de KPI 2x2.
2. `src/components/AdminPanel.tsx`:
   - Top action bar com botões empilháveis e toques de 44px.
   - Alternância entre Tabela Desktop e Cards Móveis de Estoque.
   - Ajuste nos cards de pedidos e modal de criação/edição de produtos para tela cheia com scroll suave.
3. `src/components/Header.tsx`:
   - Brand lockup sem quebras de linha em celulares menores (iPhone SE).
4. `src/components/MobileBottomNav.tsx` (Novo Componente):
   - Navegação inferior fixa com indicador de abas ativas e contagem do carrinho em tempo real.
5. `src/components/CheckoutModal.tsx` & `src/components/OrderTrackingView.tsx`:
   - Formulário em fluxo contínuo, QR Code Pix adaptativo e botões de ação fixos no rodapé da modal.
6. `src/App.tsx`:
   - Inclusão do `MobileBottomNav` com espaçamento inferior de segurança (`pb-20 md:pb-0`).

---

### 5. Plano de Verificação e Testes
- Teste de layout nas larguras: 375px (iPhone SE), 390px (iPhone 14), 768px (iPad/Tablet) e 1280px+ (Desktop).
- Verificação de ausência de rolagem horizontal indesejada no `body`/`main`.
- Validação de compilação sem erros via `compile_applet` e `lint_applet`.
