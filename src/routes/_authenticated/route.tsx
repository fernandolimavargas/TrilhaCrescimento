import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { api, getAccessToken } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (!getAccessToken()) throw redirect({ to: "/auth" });
    try {
      const context = await api.auth.getMe();
      return { user: context };
    } catch {
      throw redirect({ to: "/auth" });
    }
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
