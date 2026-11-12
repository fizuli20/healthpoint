import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "../i18n";
import i18n from "../i18n";
import { AppRoutes, createHealthPointQueryClient } from "../App";
import { HealthPointProvider } from "../context/HealthPointContext";
import {
  createAccessPoint,
  deleteAccessPoint,
  fetchAccessPoints,
  fetchMaintenanceReports,
  resetDemoData,
  saveStoredLanguage,
  submitMaintenanceReport,
  updateAccessPoint,
} from "../services/healthpointStore";

function renderAppAt(initialEntries: string[]) {
  const queryClient = createHealthPointQueryClient();
  return render(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(
        HealthPointProvider,
        null,
        React.createElement(MemoryRouter, { initialEntries }, React.createElement(AppRoutes))
      )
    )
  );
}

describe("HealthPoint store & user/admin flows", () => {
  beforeEach(async () => {
    localStorage.clear();
    resetDemoData();
    saveStoredLanguage("en");
    await i18n.changeLanguage("en");
    document.documentElement.className = "";
  });

  it("supports admin CRUD lifecycle and resetDemoData in demo store", async () => {
    const initial = await fetchAccessPoints();
    expect(initial).toHaveLength(15);
    expect(initial.every((p) => p.isDemo)).toBe(true);

    const created = await createAccessPoint({
      name: "Baku Olympic Station Test",
      description: "Test kiosk",
      neighborhood: "Koroglu",
      latitude: 40.422,
      longitude: 49.918,
      address: "Heydar Aliyev Ave",
      operationalStatus: "operational",
      equipment: ["Blood pressure monitor", "AED"],
      wheelchairAccessible: true,
      audioGuided: true,
      open247: true,
      openingHours: "24/7",
      lastVerifiedAt: new Date().toISOString(),
      imageUrl: null,
      isDemo: true,
    });
    expect((await fetchAccessPoints()).some((p) => p.id === created.id)).toBe(true);

    const updated = await updateAccessPoint(created.id, { operationalStatus: "limited" });
    expect(updated.operationalStatus).toBe("limited");

    await deleteAccessPoint(created.id);
    expect((await fetchAccessPoints()).some((p) => p.id === created.id)).toBe(false);
  });

  it("submits maintenance reports with validation and stores them", async () => {
    await expect(
      submitMaintenanceReport({
        accessPointId: "hp-baku-boulevard",
        issueType: "broken_equipment",
        description: "bad",
      })
    ).rejects.toThrow();

    const report = await submitMaintenanceReport({
      accessPointId: "hp-baku-boulevard",
      issueType: "broken_equipment",
      description: "Pulse oximeter cable is loose on screen.",
    });
    const allReports = await fetchMaintenanceReports();
    expect(allReports.some((r) => r.id === report.id && r.status === "open")).toBe(true);
  });

  it("toggles Easy Access Mode and High Contrast DOM classes on /accessibility", async () => {
    renderAppAt(["/accessibility"]);

    const easySwitch = await screen.findByRole("switch", { name: /Easy Access Mode/i });
    expect(easySwitch).toHaveAttribute("aria-checked", "false");

    fireEvent.click(easySwitch);
    await waitFor(() => {
      expect(document.documentElement.classList.contains("hp-easy-access")).toBe(true);
    });

    const contrastSwitch = screen.getByRole("switch", { name: /High Contrast Mode/i });
    fireEvent.click(contrastSwitch);
    await waitFor(() => {
      expect(document.documentElement.classList.contains("hp-high-contrast")).toBe(true);
    });
  });

  it("exposes Emergency SOS tel:103 / tel:112 links without auth and confirms before sharing", async () => {
    renderAppAt(["/emergency"]);

    const call103 = await screen.findByRole("button", { name: /103/i });
    const call112 = screen.getByRole("button", { name: /112/i });
    expect(call103).toHaveAttribute("href", "tel:103");
    expect(call112).toHaveAttribute("href", "tel:112");

    const shareBtn = screen.getByRole("button", { name: /Share My Location/i });
    fireEvent.click(shareBtn);
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText(/Confirm Location Sharing/i)).toBeInTheDocument();
    });
  });

  it("protects /admin routes from anonymous users and grants access after Demo Admin sign-in", async () => {
    renderAppAt(["/admin"]);

    expect(await screen.findByText(/Administrator authorization is required/i)).toBeInTheDocument();

    const signInLink = screen.getByRole("link", { name: /Sign In/i });
    fireEvent.click(signInLink);

    const demoAdminBtn = await screen.findByRole("button", { name: /Enter Demo Admin Session/i });
    fireEvent.click(demoAdminBtn);

    expect(await screen.findByText(/Admin Infrastructure Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Points/i)).toBeInTheDocument();
  });

  it("switches language across en -> az -> ru", async () => {
    renderAppAt(["/settings"]);

    const azBtn = await screen.findByRole("button", { name: /Azərbaycan/i });
    fireEvent.click(azBtn);
    await waitFor(() => {
      expect(i18n.language).toBe("az");
    });

    const ruBtn = screen.getByRole("button", { name: /Русский/i });
    fireEvent.click(ruBtn);
    await waitFor(() => {
      expect(i18n.language).toBe("ru");
    });
  });

  it("answers Assistant prompt deterministically when serverless endpoint returns 404", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 404 })
    );

    renderAppAt(["/assistant"]);

    const promptBtn = await screen.findByRole("button", {
      name: /Find an access point with a blood pressure monitor/i,
    });
    fireEvent.click(promptBtn);

    await waitFor(() => {
      expect(screen.getByText(/Deterministic database search/i)).toBeInTheDocument();
    });

    fetchSpy.mockRestore();
  });

  it("mounts main map home route (/) cleanly with Leaflet MarkerCluster maxZoom configured", async () => {
    renderAppAt(["/"]);

    expect(await screen.findByText(/Nearby Healthcare Access Points/i)).toBeInTheDocument();
    expect(await screen.findByText(/15 points matched/i)).toBeInTheDocument();
  });
});
