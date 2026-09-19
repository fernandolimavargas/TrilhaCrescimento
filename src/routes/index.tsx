import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { CalendarCheck, Flame, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Presença de Voluntários — Brasa Church" },
      {
        name: "description",
        content:
          "App da Brasa Church para voluntários marcarem presença: terças valem o passo 3 e quintas o passo 4 da trilha de crescimento.",
      },
      { property: "og:title", content: "Presença de Voluntários — Brasa Church" },
      {
        property: "og:description",
        content:
          "Registre sua presença no voluntariado da Brasa Church direto do celular e acompanhe sua trilha.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) navigate({ to: "/painel", replace: true });
  }, [loading, session, navigate]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-between px-5 py-10">
      <div>
        <span className="ember-gradient ember-shadow flex size-14 items-center justify-center rounded-2xl">
          <Flame className="size-7 text-primary-foreground" />
        </span>
        <h1 className="mt-8 font-display text-5xl leading-[0.95]">
          BRASA CHURCH
          <span className="mt-1 block text-primary">PRESENÇA DE VOLUNTÁRIOS</span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Sirva, marque sua presença em segundos e acompanhe sua caminhada na trilha de
          crescimento.
        </p>

        <ul className="mt-8 space-y-3">
          <Feature
            icon={<CalendarCheck className="size-5 text-primary" />}
            title="Terça = Passo 3 · Quinta = Passo 4"
            text="O passo da trilha é preenchido automaticamente pelo dia em que você serviu."
          />
          <Feature
            icon={<ShieldCheck className="size-5 text-primary" />}
            title="Controle para líderes"
            text="Somente líderes de área e administradores visualizam as presenças da equipe."
          />
          <Feature
            icon={<Smartphone className="size-5 text-primary" />}
            title="Funciona como app"
            text="Abra no navegador ou adicione à tela de início do celular."
          />
        </ul>
      </div>

      <div className="mt-10 space-y-3">
        <Button asChild className="h-13 w-full py-3.5 text-base">
          <Link to="/auth">Entrar / criar conta</Link>
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Feito para os voluntários da Brasa Church.
        </p>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <li className="surface-card flex gap-3 p-4">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-sm text-muted-foreground">{text}</span>
      </span>
    </li>
  );
}
