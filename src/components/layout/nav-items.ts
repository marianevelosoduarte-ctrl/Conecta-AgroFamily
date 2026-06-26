import {
  LayoutDashboard,
  Sprout,
  Receipt,
  ShoppingCart,
  BarChart3,
  Calculator,
  CloudSun,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Visível apenas para administradores. */
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/inicio", label: "Início", icon: LayoutDashboard },
  { href: "/producao", label: "Produção", icon: Sprout },
  { href: "/despesas", label: "Despesas", icon: Receipt },
  { href: "/vendas", label: "Vendas", icon: ShoppingCart },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/simulador", label: "Simulador de Lucro", icon: Calculator },
  { href: "/clima", label: "Clima", icon: CloudSun },
  { href: "/usuarios", label: "Usuários", icon: Users, adminOnly: true },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];
