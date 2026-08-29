"use client";

import { RequireAuth } from "@/components/providers/require-auth";
import { AppShell } from "@/components/layout/app-shell"
import { RepoDashboard } from "@/components/dashboard/repo-dashboard";

const Dashboard = () => {

  
  return (
  <RequireAuth>
    <AppShell>
      <RepoDashboard />
    </AppShell>
  </RequireAuth>

  )
}

export default Dashboard
