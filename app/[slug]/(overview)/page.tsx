"use client";
import {
  DashboardContent,
  ContentSection,
} from "@/components/dashboard-content";
import {
  WelcomeCard,
  QuickActionsCard,
  RecentCallsCard,
  SystemAlertsCard,
  QuickAccessCard,
} from "@/components/overview-card";

export default function DashboardOverview() {
  return (
    <DashboardContent>
      <ContentSection>
        <div className="grid grid-cols-1 gap-6">
          {/* Welcome and quick actions section */}
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <WelcomeCard />
            <QuickActionsCard />
          </div>

          {/* Recent Activity and System Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentCallsCard />
            <SystemAlertsCard />
          </div>

          {/* Quick Access Modules */}
          <QuickAccessCard />
        </div>
      </ContentSection>
    </DashboardContent>
  );
}
