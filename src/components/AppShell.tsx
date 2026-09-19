import { Link, useNavigate } from "@tanstack/react-router";
import { CalendarCheck, Flame, LogOut, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isAdmin, isLeader, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canSeeTeam = isAdmin || isLeader;

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
        <Link to="/painel" className="flex items-center gap-2">
          <span className="ember-gradient flex size-9 items-center justify-center rounded-xl">
            <Flame className="size-5 text-primary-foreground" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg">BRASA CHURCH</span>
            <span className="block text-[11px] uppercase tracking-widest text-muted-foreground">
              Voluntários
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {user?.name?.split(" ")[0]}
          </span>
          <Button variant="ghost" size="icon" aria-label="Sair" onClick={handleSignOut}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 pt-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-lg border-t border-border bg-background/95 px-4 py-2 backdrop-blur">
        <div className="flex items-stretch gap-2">
          <NavItem to="/painel" label="Presença" icon={<CalendarCheck className="size-5" />} />
          {canSeeTeam ? (
            <NavItem to="/equipe" label="Equipe" icon={<Users className="size-5" />} />
          ) : null}
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, label, icon }: { to: string; label: string; icon: ReactNode }) {
  return (
    <Link
      to={to}
      className="flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
      activeProps={{ className: "text-primary bg-accent/60" }}
    >
      {icon}
      {label}
    </Link>
  );
}
