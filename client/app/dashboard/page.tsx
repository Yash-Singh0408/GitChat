"use client";

import { RequireAuth } from "@/components/providers/require-auth";
import { AppShell } from "@/components/layout/app-shell"

const Dashboard = () => {

  
  return (
  <RequireAuth>
    <AppShell>
      <h1>Dashboard</h1>
    </AppShell>
  </RequireAuth>

  )
}

export default Dashboard
