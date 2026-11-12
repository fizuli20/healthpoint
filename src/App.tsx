import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { HealthPointProvider } from "./context/HealthPointContext";
import { isNativeApp } from "./lib/platform";
import { AccessibilityPage } from "./pages/AccessibilityPage";
import { AssistantPage } from "./pages/AssistantPage";
import { EmergencyPage } from "./pages/EmergencyPage";
import { HomePage } from "./pages/HomePage";
import { JudgeDemoPage } from "./pages/JudgeDemoPage";
import { KioskPage } from "./pages/KioskPage";
import { LoginPage } from "./pages/LoginPage";
import { MapPage } from "./pages/MapPage";
import { NavigationPage } from "./pages/NavigationPage";
import { NearbyPage } from "./pages/NearbyPage";
import { PartnersPage } from "./pages/PartnersPage";
import { PlansPage } from "./pages/PlansPage";
import { PointDetailPage } from "./pages/PointDetailPage";
import { ProductVideoPage } from "./pages/ProductVideoPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SavedPage } from "./pages/SavedPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TechnologyPage } from "./pages/TechnologyPage";
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
  const isNative = isNativeApp();

  return (
    <Routes>
      {/* Standalone Kiosk Experience (Landscape Touchscreen, NO ordinary website shell) */}
      <Route path="/kiosk" element={<KioskPage />} />
      <Route path="/kiosk/:stationId" element={<KioskPage />} />

      {/* Root Landing vs Native App Direct Entry */}
      <Route
        path="/"
        element={isNative ? <Navigate to="/map" replace /> : <HomePage />}
      />

      {/* Standard Application Routes Wrapped in AppShell */}
      <Route
        path="/map"
        element={
          <AppShell>
            <MapPage />
          </AppShell>
        }
      />
      <Route
        path="/nearby"
        element={
          <AppShell>
            <NearbyPage />
          </AppShell>
        }
      />
      <Route
        path="/points/:id"
        element={
          <AppShell>
            <PointDetailPage />
          </AppShell>
        }
      />
      <Route
        path="/navigation/:id"
        element={
          <AppShell>
            <NavigationPage />
          </AppShell>
        }
      />
      <Route
        path="/demo"
        element={
          <AppShell>
            <JudgeDemoPage />
          </AppShell>
        }
      />
      <Route
        path="/technology"
        element={
          <AppShell>
            <TechnologyPage />
          </AppShell>
        }
      />
      <Route
        path="/partners"
        element={
          <AppShell>
            <PartnersPage />
          </AppShell>
        }
      />
      <Route
        path="/assistant"
        element={
          <AppShell>
            <AssistantPage />
          </AppShell>
        }
      />
      <Route
        path="/plans"
        element={
          <AppShell>
            <PlansPage />
          </AppShell>
        }
      />
      <Route
        path="/video"
        element={
          <AppShell>
            <ProductVideoPage />
          </AppShell>
        }
      />
      <Route
        path="/saved"
        element={
          <AppShell>
            <SavedPage />
          </AppShell>
        }
      />
      <Route
        path="/profile"
        element={
          <AppShell>
            <ProfilePage />
          </AppShell>
        }
      />
      <Route
        path="/settings"
        element={
          <AppShell>
            <SettingsPage />
          </AppShell>
        }
      />
      <Route
        path="/emergency"
        element={
          <AppShell>
            <EmergencyPage />
          </AppShell>
        }
      />
      <Route
        path="/accessibility"
        element={
          <AppShell>
            <AccessibilityPage />
          </AppShell>
        }
      />
      <Route
        path="/login"
        element={
          <AppShell>
            <LoginPage />
          </AppShell>
        }
      />

      {/* Municipal Operator Hub: OpenCare City */}
      <Route
        path="/admin"
        element={
          <AppShell>
            <AdminLayout />
          </AppShell>
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="points" element={<AdminPointsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
