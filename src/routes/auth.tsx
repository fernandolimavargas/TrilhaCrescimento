import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Flame, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Presença de Voluntários | Brasa Church" },
      {
        name: "description",
        content:
          "Acesse sua conta para registrar presença no voluntariado da Brasa Church e acompanhar a trilha de crescimento.",
      },
      { property: "og:title", content: "Entrar — Presença de Voluntários | Brasa Church" },
      {
        property: "og:description",
        content: "Acesse sua conta de voluntário da Brasa Church.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { session, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!loading && session) navigate({ to: "/painel", replace: true });
  }, [loading, session, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
      setBusy(true);
    try {
      if (mode === "signup") {
        await api.auth.signUp({ fullName, email, password });
        setMode("signin");
        toast.success("Cadastro criado! Agora entre com seu e-mail e senha.");
      } else {
        await api.auth.signIn(email, password);
        await refreshProfile();
        navigate({ to: "/painel", replace: true });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível continuar.";
      toast.error(traduzErro(message));
    } finally {
      setBusy(false);
    }
  }

  const handleGoogleCredential = useCallback(
    ({ credential }: GoogleCredentialResponse) => {
      if (!credential) {
        toast.error("Não foi possível obter a credencial do Google.");
        return;
      }

      setBusy(true);
      void (async () => {
        try {
          await api.auth.signInWithGoogle(credential);
          await refreshProfile();
          navigate({ to: "/painel", replace: true });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Não foi possível autenticar com Google.";
          toast.error(traduzErro(message));
        } finally {
          setBusy(false);
        }
      })();
    },
    [navigate, refreshProfile],
  );

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;

    let retryId: number | undefined;
    let cancelled = false;

    const renderGoogleButton = () => {
      const google = window.google?.accounts?.id;
      const container = googleButtonRef.current;

      if (!google || !container) {
        retryId = window.setTimeout(renderGoogleButton, 100);
        return;
      }

      if (cancelled) return;

      google.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      });
      container.replaceChildren();
      google.renderButton(container, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: Math.min(400, Math.floor(container.getBoundingClientRect().width)),
        locale: "pt-BR",
      });
    };

    renderGoogleButton();

    return () => {
      cancelled = true;
      if (retryId !== undefined) window.clearTimeout(retryId);
    };
  }, [googleClientId, handleGoogleCredential]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-10">
      <Link to="/" className="mb-8 flex items-center gap-3">
        <span className="ember-gradient ember-shadow flex size-11 items-center justify-center rounded-2xl">
          <Flame className="size-6 text-primary-foreground" />
        </span>
        <span>
          <span className="block font-display text-2xl leading-none">BRASA CHURCH</span>
          <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Presença de voluntários
          </span>
        </span>
      </Link>

      <div className="surface-card p-5">
        <h1 className="font-display text-3xl">
          {mode === "signin" ? "Bem-vindo de volta" : "Criar minha conta"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Entre para marcar sua presença no voluntariado."
            : "Cadastre-se para registrar suas escalas."}
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  required
                />
              </div>
            </>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <Button type="submit" className="h-12 w-full text-base" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          ou
          <span className="h-px flex-1 bg-border" />
        </div>

        {googleClientId ? (
          <div ref={googleButtonRef} className="flex min-h-11 w-full justify-center" />
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            A entrada com Google ainda não foi configurada.
          </p>
        )}

        <button
          type="button"
          className="mt-5 w-full text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
          }}
        >
          {mode === "signin" ? "Não tenho conta — quero me cadastrar" : "Já tenho conta — entrar"}
        </button>
      </div>
    </div>
  );
}

function traduzErro(message: string): string {
  if (message.includes("Invalid login credentials")) return "E-mail ou senha inválidos.";
  if (message.includes("already registered")) return "Este e-mail já está cadastrado.";
  if (message.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  return message;
}
