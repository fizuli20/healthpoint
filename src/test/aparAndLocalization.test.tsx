import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import "../i18n";
import i18n from "../i18n";
import { AppRoutes, createHealthPointQueryClient } from "../App";
import { HealthPointProvider } from "../context/HealthPointContext";
import {
  getKioskCode,
  localizeAccessPoint,
  localizeEquipmentLabel,
  localizeStatusLabel,
} from "../lib/localizePoint";
import {
  fetchAccessPoints,
  resetDemoData,
  saveStoredLanguage,
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

describe("HealthPoint Azerbaijani default localization & Apar-style kiosk UX", () => {
  beforeEach(async () => {
    localStorage.clear();
    resetDemoData();
    saveStoredLanguage("az");
    await i18n.changeLanguage("az");
    document.documentElement.className = "";
  });

  it("localizes Baku access points, statuses, equipment, and kiosk codes cleanly", async () => {
    const points = await fetchAccessPoints();
    const boulevard = points.find((p) => p.id === "hp-baku-boulevard")!;
    expect(getKioskCode(boulevard.id)).toBe("HP-01");

    const azPoint = localizeAccessPoint(boulevard, "az");
    expect(azPoint.name).toBe("OpenCarePoint — Dənizkənarı Bulvar");
    expect(azPoint.neighborhood).toBe("Səbail / Bulvar");

    const ruPoint = localizeAccessPoint(boulevard, "ru");
    expect(ruPoint.name).toBe("OpenCarePoint — Приморский бульвар");

    expect(localizeStatusLabel("operational", "az")).toBe("İşləkdir");
    expect(localizeEquipmentLabel("Blood pressure monitor", "az")).toBe("Qan təzyiqi cihazı");
  });

  it("renders main map route (/map) in Azerbaijani by default with Apar QR button & APK pill", async () => {
    renderAppAt(["/map"]);

    expect(await screen.findByText(/Yaxın Sağlamlıq Məntəqələri/i)).toBeInTheDocument();
    expect(await screen.findByText(/OpenCarePoint — Dənizkənarı Bulvar/i)).toBeInTheDocument();
    expect(screen.getAllByText("HP-01").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Kod \/ QR ilə Başla/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /APK Yüklə/i })).toHaveAttribute(
      "href",
      "/downloads/OpenCarePoint.apk"
    );
  });

  it("activates HP-01 via Apar kiosk code modal, shows honest demo notice, and increments usageCount", async () => {
    const beforePoints = await fetchAccessPoints();
    const initialUsage =
      beforePoints.find((p) => p.id === "hp-baku-boulevard")?.usageCount ?? 0;

    renderAppAt(["/map"]);

    const openModalBtn = await screen.findByRole("button", { name: /Kod \/ QR ilə Başla/i });
    fireEvent.click(openModalBtn);

    const dialog = await screen.findByRole("dialog");
    const codeInput = within(dialog).getByLabelText(/Məntəqə kodu/i);
    fireEvent.change(codeInput, { target: { value: "HP-01" } });

    const submitBtn = within(dialog).getByRole("button", { name: /Məntəqəni Aktiv Et/i });
    fireEvent.click(submitBtn);

    expect(await within(dialog).findByText(/Demo Kiosk Simulyatoru/i)).toBeInTheDocument();
    expect(
      within(dialog).getByText(/Oturaq vəziyyətdə sağ və ya sol qolunuzu/i)
    ).toBeInTheDocument();

    await waitFor(async () => {
      const afterPoints = await fetchAccessPoints();
      const updated = afterPoints.find((p) => p.id === "hp-baku-boulevard");
      expect(updated?.usageCount).toBe(initialUsage + 1);
    });
  });

  it("blocks activating unavailable kiosk code HP-08 with an Azerbaijani warning", async () => {
    renderAppAt(["/map"]);

    const openModalBtn = await screen.findByRole("button", { name: /Kod \/ QR ilə Başla/i });
    fireEvent.click(openModalBtn);

    const dialog = await screen.findByRole("dialog");
    const codeInput = within(dialog).getByLabelText(/Məntəqə kodu/i);
    fireEvent.change(codeInput, { target: { value: "HP-08" } });

    const submitBtn = within(dialog).getByRole("button", { name: /Məntəqəni Aktiv Et/i });
    fireEvent.click(submitBtn);

    expect(
      await within(dialog).findByText(/Bu məntəqə texniki xidmətə görə hazırda əlçatmazdır/i)
    ).toBeInTheDocument();
  });
});
