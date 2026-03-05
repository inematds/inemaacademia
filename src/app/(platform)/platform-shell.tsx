"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  Trophy,
  Settings,
  Menu,
  Flame,
  Zap,
  ChevronRight,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { signOutAction } from "@/app/(auth)/actions";

type UserData = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
};

type StatsData = {
  totalXp: number;
  currentStreak: number;
  level: number;
};

const navItems = [
  { href: "/materias", label: "Materias", icon: BookOpen },
  { href: "/aluno", label: "Painel", icon: LayoutDashboard },
  { href: "/aluno/progresso", label: "Progresso", icon: GraduationCap },
  { href: "/aluno/badges", label: "Conquistas", icon: Trophy },
];

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Array<{ label: string; href: string }> = [];

  const labelMap: Record<string, string> = {
    materias: "Materias",
    licao: "Licao",
    admin: "Admin",
    aluno: "Painel",
    cursos: "Cursos",
    perfil: "Perfil",
    progresso: "Progresso",
    conquistas: "Conquistas",
  };

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    crumbs.push({
      label: labelMap[segment] || decodeURIComponent(segment),
      href: currentPath,
    });
  }

  return crumbs;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PlatformShell({
  user,
  stats,
  children,
}: {
  user: UserData;
  stats: StatsData;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const breadcrumbs = getBreadcrumbs(pathname);

  const sidebarContent = (
    <nav aria-label="Menu principal" className="flex flex-col gap-1 p-4">
      <Link
        href="/materias"
        className="mb-6 flex items-center gap-3 px-2"
        onClick={() => setSidebarOpen(false)}
      >
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-sm">
          IN
        </div>
        <span className="text-lg font-bold tracking-tight">INEMA Academia</span>
      </Link>

      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        );
      })}

      {user.role === "admin" && (
        <>
          <div className="my-3 h-px bg-border" />
          <Link
            href="/admin"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
              pathname.startsWith("/admin")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Shield className="size-5" />
            Administracao
          </Link>
        </>
      )}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Pular para o conteudo principal
      </a>

      {/* Desktop sidebar */}
      <aside aria-label="Barra lateral de navegacao" className="hidden w-64 shrink-0 border-r bg-card lg:block">
        <div className="flex h-full flex-col overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:px-6">
          {/* Mobile menu */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu de navegacao</SheetTitle>
              </SheetHeader>
              {sidebarContent}
            </SheetContent>
          </Sheet>

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="size-3" />}
                {i === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-foreground">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {/* Streak */}
            <div className="flex items-center gap-1.5 text-sm" aria-label={`Sequencia de ${stats.currentStreak} dias`}>
              <Flame className="size-4 text-orange-500" aria-hidden="true" />
              <span className="font-medium">{stats.currentStreak}</span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1.5 text-sm" aria-label={`${stats.totalXp} pontos de experiencia`}>
              <Zap className="size-4 text-yellow-500" aria-hidden="true" />
              <span className="font-medium">{stats.totalXp} XP</span>
            </div>

            {/* Level badge */}
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Nv. {stats.level}
            </Badge>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Menu do usuario">
                  <Avatar className="size-8">
                    <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
                    <AvatarFallback className="text-xs">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/perfil" className="cursor-pointer">
                    <User className="mr-2 size-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/aluno" className="cursor-pointer">
                    <Settings className="mr-2 size-4" />
                    Configuracoes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action={signOutAction}>
                    <button type="submit" className="flex w-full items-center">
                      <LogOut className="mr-2 size-4" />
                      Sair
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 overflow-y-auto p-4 lg:p-6" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}
