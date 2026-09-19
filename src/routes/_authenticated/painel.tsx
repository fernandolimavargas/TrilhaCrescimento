import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, getStoredUserId } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { stepLabel } from "@/lib/trilha";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Minha presença — Brasa Church Voluntários" },
      {
        name: "description",
        content:
          "Marque sua presença no voluntariado da Brasa Church e acompanhe os passos 3 e 4 da trilha de crescimento.",
      },
      { property: "og:title", content: "Minha prese'''''''''''''''''''''''''''''''''''''''''''nça — Brasa Church Voluntários" },
      {
        property: "og:description",
        content: "Registro de presença dos voluntários da Brasa Church.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PainelPage,
});

function PainelPage() {
  const { user } = useAuth();
  const [teamId, setTeamId] = useState("");
  const [passo, setPasso] = useState("");

  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ["trilha-times"],
    queryFn: () => api.trilha.getTimes(),
  });

  const { data: passos = [], isLoading: isLoadingPassos } = useQuery({
    queryKey: ["trilha-passos"],
    queryFn: () => api.trilha.getPassos(),
  });

  const markMutation = useMutation({
    mutationFn: async ({ idTime, idPasso }: { idTime: number; idPasso: number }) => {
      const idUsuario = getStoredUserId() ?? user?.id;
      if (!idUsuario) throw new Error("Sessão expirada. Entre novamente para continuar.");
      await api.trilha.checkin(idTime, idUsuario, idPasso);
    },
    onSuccess: () => {
      toast.success("Check-in realizado com sucesso. Obrigado por servir!");
      setTeamId("")
      setPasso("");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Erro ao registrar.";
      toast.error(
        message.includes("duplicate") || message.includes("unique")
          ? "Você já registrou presença nesta data."
          : message,
      );
    },
  });

  useEffect(() => {
    const verificarCheckin = async () => {
      const resultado = await api.trilha.jaFezCheckin(user?.id ?? 0);
      if (resultado) {
        toast.error("Você já registrou presença nesta data.");
      }
    };
  }, []);

  return (
    <div className="space-y-5">
      <section className="surface-card ember-shadow relative overflow-hidden p-5">
        <div className="ember-gradient absolute -right-10 -top-10 size-32 rounded-full opacity-30 blur-2xl" />
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Olá, {user?.name?.split(" ")[0] || "voluntário"}
        </p>
        <h1 className="mt-1 font-display text-3xl">Marcar presença</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecione o time em que você está servindo para realizar o check-in.
        </p>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="team">Time</Label>
            <select
              id="team"
              value={teamId}
              onChange={(event) => setTeamId(event.target.value)}
              disabled={isLoadingTeams}
              className="h-12 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{isLoadingTeams ? "Carregando times…" : "Selecione seu time"}</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.nome}
                </option>
              ))}
            </select>

            <Label htmlFor="passo">Passo</Label>
            <select
              id="passo"
              value={passo}
              onChange={(event) => setPasso(event.target.value)}
              className="h-12 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{isLoadingPassos ? "Carregando passos…" : "Selecione qual passo irá servir"}</option>
              {passos.map((passo) => (
                <option key={passo.id} value={passo.id}>
                  {passo.nome}
                </option>
              ))}
            </select>
          </div>

          <Button
            className="h-13 w-full py-3.5 text-base"
            disabled={markMutation.isPending || !teamId}
            onClick={() => markMutation.mutate({
              idTime : Number(teamId), 
              idPasso : Number(passo)
            })}
          >
            {markMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Fazer check-in
          </Button>
        </div>
      </section>

    </div>
  );
}

/* function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-card px-3 py-4 text-center">
      <p className="font-display text-3xl text-primary">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
} */

export function StepBadge({ step }: { step: number | null }) {
  return (
    <Badge
      variant="outline"
      className={
        step === 3
          ? "border-step3/60 text-step3"
          : step === 4
            ? "border-step4/60 text-step4"
            : "border-border text-muted-foreground"
      }
    >
      {stepLabel(step)}
    </Badge>
  );
}
