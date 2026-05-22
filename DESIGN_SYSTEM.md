# Conecta Agrofamily — Design System

> Extraído dos mockups premium (`agrofamily-premium-assets`). Base visual do MVP.
> Tom: moderno, orgânico, profissional, acessível. Verde como cor-mãe.

## 🎨 Cores

### Verde (marca / primária)
| Token | Hex | Uso |
|---|---|---|
| `green-50` | `#E8F5E9` | fundo de badges, tints |
| `green-100` | `#C8E6C9` | hovers suaves |
| `green-600` | `#2D8D52` | hover de elementos verdes |
| `green-700` | `#1F7A3D` | **PRIMÁRIA** — CTA, item ativo, links |
| `green-800` | `#15602F` | gradientes, ênfase |
| `green-900` | `#0F5B28` | texto sobre claro, gradiente escuro |
| `green-950` | `#1B4D2E` | rodapé escuro |

### Acento
| Token | Hex | Uso |
|---|---|---|
| `gold` | `#D4A574` | anel do logo, detalhes premium (uso pontual) |
| `lime` | `#7CB342` | folhas claras, destaques orgânicos |

### Semânticas
| Token | Hex | Uso |
|---|---|---|
| `success` | `#22863A` | positivo, "saudável", variação ↑ |
| `warning` | `#F59E0B` | alertas, atenção |
| `danger` | `#D32F2F` | erro, badge de notificação |
| `info` | `#1890FF` | informação, dados |

### Neutros
| Token | Hex | Uso |
|---|---|---|
| `bg` (página) | `#F9FAFB` | fundo geral |
| `surface` (card) | `#FFFFFF` | cards, painéis |
| `sidebar-bg` | `#F5F5F5` | fundo da sidebar |
| `border` | `#E5E7EB` | bordas, divisores |
| `text` | `#1F2937` | texto principal |
| `muted` | `#6B7280` | texto secundário |
| `placeholder` | `#9CA3AF` | placeholders |

### Paleta de gráficos (Recharts)
```
['#1F7A3D', '#F5A623', '#52C41A', '#1890FF', '#FDD835', '#8B6F47']
   verde      laranja    verde-mé   azul       ouro       marrom
```

## 🔤 Tipografia
- Fonte: **Poppins** (sans-serif moderna, arredondada) — pesos 400/500/600/700.
- Título de seção: 24px / 700 · Card title: 16px / 600 · Valor KPI destaque: 28–48px / 700
- Body: 14px / 400 · Helper/label: 12px / 400 · Botão: 14–16px / 600

## 📐 Forma
- **Raio**: cards `12px` (rounded-xl) · botões/inputs `8px` (rounded-lg) · badges/pills full · avatar círculo
- **Sombra card**: `0 2px 8px rgba(0,0,0,0.08)` · hover `0 4px 12px rgba(0,0,0,0.12)`
- **Espaçamento**: escala 4px. Padding card 16–20px · gap 12–16px · seções 24px

## 🧩 Componentes (anatomia)

**Botão primário** — h `48px`, padding `12px 24px`, radius `8px`, bg `green-700`, texto branco 600, ícone à esquerda (ex: folha), sombra sutil; hover `green-800`.

**Botão secundário/outline** — branco, borda `border`, texto `#374151` 500, radius `8px` (ex: "Entrar com Google").

**Botão compacto** ("+ Nova cultura") — menor (h ~38px), radius `8px`, bg `green-700`, ícone `+`.

**Input** — h `48px` (busca `40px`), bg branco, borda `border`, radius `8px`, ícone à esquerda em `muted`, foco com borda `green-700` + ring `green-700/10`.

**KPI Card** — fundo branco, radius 12px, sombra leve. Estrutura: ícone em container arredondado (40–48px, tint da cor) → título (`muted`) → valor grande (700) → badge de variação (`green-50` bg + `success` texto, ex "↑ 12,4%"). Variante com mini-gráfico (linha/donut) embaixo.

**Badge/Status** — pill, fundo tint da cor (ex `green-50`), texto cor escura. Ex: "Saudável" verde.

**CTA link** — `green-700`, 13px 500, com "→" no fim.

## 🗂️ Layout (desktop → responsivo)
- **Sidebar** ~270px, fundo `sidebar-bg`, logo no topo, item ativo = pílula verde sólida (`green-700`) texto branco; inativos em `muted`. No mobile vira drawer/menu.
- **Topbar** branca ~64px: saudação ("Olá, João! 👋") + chips de KPI + clima + sino de notificação.
- **Conteúdo**: grid de cards sobre fundo `bg`. Painel direito opcional (widgets).
- **Login**: split-screen — formulário à esquerda (branco), ilustração/gradiente verde à direita.
- **Decorativos**: ondas verdes no topo (gradiente `green-800`→`lime`) e rodapé escuro (`green-950`).
