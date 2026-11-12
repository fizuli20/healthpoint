import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { HealthPointProvider } from "./context/HealthPointContext";
import { AccessibilityPage } from "./pages/AccessibilityPage";
import { AssistantPage } from "./pages/AssistantPage";
import { EmergencyPage } from "./pages/EmergencyPage";
import { LoginPage } from "./pages/LoginPage";
import { MapPage } from "./pages/MapPage";
import { NavigationPage } from "./pages/NavigationPage";
import { NearbyPage } from "./pages/NearbyPage";
import { PlansPage } from "./pages/PlansPage";
import { PointDetailPage } from "./pages/PointDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SavedPage } from "./pages/SavedPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AdminAnalyticsPage } from "./pages/admin/AdminAnalyticsPage";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminOverviewPage } from "./pages/admin/AdminOverviewPage";
import { AdminPointsPage } from "./pages/admin/AdminPointsPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";

export const createHealthPointQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

const defaultQueryClient = createHealthPointQueryClient();

export function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/nearby" element={<NearbyPage />} />
        <Route path="/points/:id" element={<PointDetailPage />} />
        <Route path="/navigation/:id" element={<NavigationPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="points" element={<AdminPointsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export function App() {
  return (
    <QueryClientProvider client={defaultQueryClient}>
      <HealthPointProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </HealthPointProvider>
    </QueryClientProvider>
  );
}

export default App;
