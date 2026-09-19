import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ShieldCheck, UserCog } from "lucide-react";
import { toast } from "sonner";
import { api, type Attendance, type TeamProfile } from "@/lib/api";
import { useAuth, type AppRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepBadge } from "./painel";
import {
  currentMonthValue,
  formatDateShort,
  formatMonthLabel,
  monthRange,
} from "@/lib/trilha";

export const Route = createFileRoute("/_authenticated/equipe")({
  head: () => ({
    meta: [
      { title: "Equipe e relatórios — Brasa Church Voluntários" },
      {
        name: "description",
        content:
          "Painel de líderes e administradores para acompanhar as presenças dos voluntários da Brasa Church por área e por mês.",
      },
      { property: "og:title", content: "Equipe e relatórios — Brasa Church Voluntários" },
      {
        property: "og:description",
        content: "Acompanhe a presença dos voluntários por área e por mês.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EquipePage,
});

type ProfileRow = TeamProfile;
type AttendanceRow = Attendance & { user_id: string };

function EquipePage() {
  const { isAdmin, isLeader, leaderAreas } = useAuth();
  const [month, setMonth] = useState(currentMonthValue());

  const { data: profiles = [] } = useQuery({
    queryKey: ["team-profiles"],
    queryFn: async () => {
      return api.team.members();
    },
  });

  const { data: attendances = [], isLoading } = useQuery({
    queryKey: ["team-attendances", month],
    queryFn: async () => {
      return api.team.attendances(month) as Promise<AttendanceRow[]>;
    },
  });

  const rows = useMemo(() => {
    return profiles
      .map((p) => {
        const mine = attendances.filter((a) => a.user_id === p.id);
        return {
          profile: p,
          total: mine.length,
          passo3: mine.filter((a) => a.step === 3).length,
          passo4: mine.filter((a) => a.step === 4).length,
          dates: mine,
        };
      })
      .sort((a, b) => b.total - a.total || a.profile.full_name.localeCompare(b.profile.full_name));
  }, [profiles, attendances]);

  if (!isAdmin && !isLeader) {
    return (
      <div className="surface-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Esta área é exclusiva para líderes e administradores.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="surface-card p-5">
        <h1 className="font-display text-3xl">Equipe</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAdmin
            ? "Você vê todos os voluntários da igreja."
            : `Você vê a(s) área(s): ${leaderAreas.join(", ") || "—"}.`}
        </p>
        <div className="mt-4 space-y-1.5">
          <Label htmlFor="month">Mês</Label>
          <Input
            id="month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-12"
          />
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <Stat label="Voluntários" value={rows.filter((r) => r.total > 0).length} />
        <Stat label="Presenças" value={attendances.length} />
        <Stat
          label="Ter/Qui"
          value={attendances.filter((a) => a.step === 3 || a.step === 4).length}
        />
      </section>

      <section className="surface-card p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl">Presenças</h2>
          <span className="text-xs capitalize text-muted-foreground">
            {formatMonthLabel(month)}
          </span>
        </div>

        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Carregando…</p>
        ) : rows.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Nenhum voluntário visível ainda.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {rows.map((row) => (
              <li key={row.profile.id} className="rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{row.profile.full_name || "Sem nome"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.profile.area || "sem área"} · {row.profile.email}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge variant="secondary">{row.total}x</Badge>
                    <Badge variant="outline" className="border-step3/60 text-step3">
                      P3 {row.passo3}
                    </Badge>
                    <Badge variant="outline" className="border-step4/60 text-step4">
                      P4 {row.passo4}
                    </Badge>
                  </div>
                </div>
                {row.dates.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {row.dates.map((d) => (
                      <span
                        key={d.id}
                        className="flex items-center gap-1 rounded-md bg-accent/50 px-2 py-1 text-xs"
                      >
                        {formatDateShort(d.served_on)}
                        <StepBadge step={d.step} />
                      </span>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {isAdmin ? <RoleManager profiles={profiles} /> : null}
    </div>
  );
}

function RoleManager({ profiles }: { profiles: ProfileRow[] }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState("");
  const [role, setRole] = useState<AppRole>("leader");
  const [area, setArea] = useState("");

  const { data: roles = [] } = useQuery({
    queryKey: ["all-roles"],
    queryFn: async () => {
      return api.team.roles() as Promise<{ id: number; user_id: number; role: AppRole; area: string | null }[]>;
    },
  });

  const grant = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error("Escolha um voluntário.");
      await api.team.saveRole({ user_id: selected, role, area: role === "leader" ? area || null : null });
    },
    onSuccess: () => {
      toast.success("Permissão atualizada.");
      void queryClient.invalidateQueries({ queryKey: ["all-roles"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Erro ao salvar."),
  });

  const revoke = useMutation({
    mutationFn: async (id: number) => {
      await api.team.removeRole(id);
    },
    onSuccess: () => {
      toast.success("Permissão removida.");
      void queryClient.invalidateQueries({ queryKey: ["all-roles"] });
    },
  });

  const elevated = roles.filter((r) => r.role !== "volunteer");
  const nameOf = (id: number) => profiles.find((p) => p.id === id)?.full_name || id.toString().slice(0, 8);

  return (
    <section className="surface-card p-5">
      <h2 className="flex items-center gap-2 font-display text-2xl">
        <ShieldCheck className="size-5 text-primary" /> Permissões
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Defina quem é administrador (vê tudo) ou líder de uma área específica.
      </p>

      <div className="mt-4 space-y-3">
        <div className="space-y-1.5">
          <Label>Voluntário</Label>

          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecionar pessoa" />
            </SelectTrigger>

            <SelectContent>
              {profiles
                .filter((p) => p.id !== user?.id)
                .map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.full_name || p.email}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Papel</Label>

          <Select
            value={role}
            onValueChange={(v) => setRole(v as AppRole)}
          >
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="leader">Líder de área</SelectItem>
              <SelectItem value="volunteer">Voluntário</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {role === "leader" ? (
          <div className="space-y-1.5">
            <Label htmlFor="leaderArea">Área liderada</Label>

            <Input
              id="leaderArea"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Ex.: Recepção"
              className="h-12"
            />
          </div>
        ) : null}

        <Button
          className="h-12 w-full"
          onClick={() => grant.mutate()}
          disabled={grant.isPending}
        >
          <UserCog className="size-4" /> Salvar permissão
        </Button>
      </div>

      {elevated.length > 0 ? (
        <ul className="mt-5 divide-y divide-border">
          {elevated.map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-3 py-2.5 text-sm"
            >
              <span className="min-w-0 flex-1 truncate">
                {nameOf(r.user_id)}
              </span>

              <Badge variant="secondary">
                {r.role === "admin"
                  ? "Admin"
                  : `Líder · ${r.area ?? "sem área"}`}
              </Badge>

              {r.user_id === user?.id ? null : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => revoke.mutate(r.id)}
                >
                  Remover
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-card px-3 py-4 text-center">
      <p className="font-display text-3xl text-primary">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
