// app/(dashboardLayout)/admin/dashboard/page.tsx
import { AdminDashboardClient } from "@/components/modules/AdminDashboard/AdminDashboardClient";
import { getAdminDashboard, getAdminCharts } from "@/service/dashboard/dashboard.service";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [dash, charts] = await Promise.all([
    getAdminDashboard(),
    getAdminCharts(14),
  ]);

  return (
    <AdminDashboardClient
      data={dash.success ? dash.data : null}
      charts={charts.success ? charts.data : null}
      error={!dash.success ? dash.message : null}
    />
  );
}