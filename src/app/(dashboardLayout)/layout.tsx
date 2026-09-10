import DashboardNavbar from "@/components/Dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import DashboardBackground from "@/components/modules/DashboardBackground/DashboardBackground";
import React from "react";

const CommonDashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="relative flex-1 overflow-y-auto bg-background">
          <DashboardBackground />
          <div className="relative z-10 w-full p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default CommonDashboardLayout;