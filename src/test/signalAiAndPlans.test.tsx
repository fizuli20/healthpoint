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
  evaluateSignalQuality,
  generatePpgWaveform,
  runVitalCheckSimulation,
} from "../lib/sensorSignalAi";
import {
  fetchAccessPoints,
  fetchPartnerInquiries,
  fetchVitalReadings,
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

describe("OpenCarePoint Signal AI, B2C/B2G Plans & Quick Triage", () => {
  beforeEach(async () => {
    localStorage.clear();
    resetDemoData();
    saveStoredLanguage("az");
    await i18n.changeLanguage("az");
    document.documentElement.className = "";
  });

  it("classifies clean vs noisy PPG sensor waveforms deterministically via Edge SQI", async () => {
    const goodSamples = generatePpgWaveform("good", 3);
    const poorSamples = generatePpgWaveform("poor", 3);

    const goodEval = evaluateSignalQuality(goodSamples);
    const poorEval = evaluateSignalQuality(poorSamples);

    expect(goodEval.status).toBe("good");
    expect(goodEval.score).toBeGreaterThanOrEqual(70);

    expect(poorEval.status).toBe("poor");
    expect(poorEval.score).toBeLessThan(70);

    const points = await fetchAccessPoints();
    const simPoor = runVitalCheckSimulation("poor", "one_time_full", points[0], 3);
    expect(simPoor.signalStatus).toBe("poor");
    expect(simPoor.heartRateBpm).toBeNull();
    expect(simPoor.aiRecommendationKey).toBe("signalPoorRetry");

    const simGood = runVitalCheckSimulation("good", "one_time_full", points[0], 3);
    expect(simGood.signalStatus).toBe("good");
    expect(simGood.heartRateBpm).toBeGreaterThan(55);
    expect(simGood.bloodPressure).toMatch(/\d+\/\d+ mmHg/);
  });

  it("runs B2C pass check & AI Signal Quality warning + retry inside StationActivateModal and persists good vitals", async () => {
    renderAppAt(["/"]);

    const openModalBtn = await screen.findByRole("button", { name: /Kod \/ QR ilə Başla/i });
    fireEvent.click(openModalBtn);

    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText(/Məntəqə kodu/i), {
      target: { value: "HP-01" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /Məntəqəni Aktiv Et/i }));

    // Switch to One-Time B2C 1.00 AZN pass
    fireEvent.click(within(dialog).getByText(/Birdəfəlik Tam Yoxlanış/i));

    // Trigger weak signal test -> AI prompts retry without saving fake BPM
    fireEvent.click(within(dialog).getByRole("button", { name: /Zəif Siqnal Testi \(AI\)/i }));
    expect(
      await within(dialog).findByText(/Sensor təması zəifdir və ya hərəkət aşkarlandı/i)
    ).toBeInTheDocument();

    // Retry with clean contact -> saves reading to local vitals store
    fireEvent.click(within(dialog).getByRole("button", { name: /Ölçümü Təkrarla/i }));
    expect(
      await within(dialog).findByText(/Optik nəbz göstəricisi Profil tarixçəsinə saxlanıldı/i)
    ).toBeInTheDocument();

    await waitFor(async () => {
      const readings = await fetchVitalReadings();
      expect(readings).toHaveLength(1);
      expect(readings[0].kioskCode).toBe("HP-01");
      expect(readings[0].passType).toBe("one_time_full");
      expect(readings[0].priceAzn).toBe(1);
      expect(readings[0].bloodPressure).not.toBeNull();
    });
  });

  it("renders /plans with B2C/B2G pricing, updates pilot calculator, and records partner inquiry", async () => {
    renderAppAt(["/plans"]);

    expect(await screen.findByText(/B2C Birdəfəlik Tariflər & B2G Şəhər Modeli/i)).toBeInTheDocument();
    expect(screen.getByText("0 AZN")).toBeInTheDocument();
    expect(screen.getByText("1–2 AZN / istifadə")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Qurum və ya Şirkət adı/i), {
      target: { value: "Bakı Metropoliteni" },
    });
    fireEvent.change(screen.getByLabelText(/Əlaqə E-poçtu/i), {
      target: { value: "pilot@metro.az" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Pilot Təklifi Göndər/i }));

    expect(
      await screen.findByText(/Müraciətiniz lokal demo reyestrə qeyd olundu/i)
    ).toBeInTheDocument();

    const inquiries = await fetchPartnerInquiries();
    expect(inquiries).toHaveLength(1);
    expect(inquiries[0].organizationName).toBe("Bakı Metropoliteni");
  });

  it("filters nearby access points via symptom quick-triage chips", async () => {
    renderAppAt(["/nearby"]);

    const aedTriageBtn = await screen.findByRole("button", { name: /Fövqəladə \/ AED/i });
    fireEvent.click(aedTriageBtn);

    await waitFor(() => {
      // Baku Boulevard has AED, Sahil Metro does not
      expect(screen.getByText(/OpenCarePoint — Dənizkənarı Bulvar/i)).toBeInTheDocument();
      expect(screen.queryByText(/OpenCarePoint — Sahil Metrosu/i)).not.toBeInTheDocument();
    });
  });

  it("saves personal ICE medical ID on /profile and shows it with interactive CPR pacer on /emergency", async () => {
    const profileView = renderAppAt(["/profile"]);

    fireEvent.change(await screen.findByLabelText(/Qan qrupu/i), {
      target: { value: "A+" },
    });
    fireEvent.change(screen.getByLabelText(/Allergiyalar/i), {
      target: { value: "Penisilin" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Tibbi Kartı Yadda Saxla/i }));
    expect(await screen.findByText(/Tibbi kart cihazda saxlanıldı/i)).toBeInTheDocument();
    profileView.unmount();

    // Render /emergency and verify Medical ID appears + CPR pacer toggles
    const { unmount } = renderAppAt(["/emergency"]);
    expect(await screen.findByText("A+")).toBeInTheDocument();
    expect(screen.getByText("Penisilin")).toBeInTheDocument();

    const cprBtn = screen.getByRole("button", { name: /110 BPM CPR Ritmini Başlat/i });
    fireEvent.click(cprBtn);
    expect(await screen.findByRole("button", { name: /Ritmi Dayandır/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Ritmi Dayandır/i }));
    unmount();
  });

  it("opens arrival station activation modal directly from /navigation/:id", async () => {
    renderAppAt(["/navigation/hp-baku-boulevard"]);

    const arrivedBtn = await screen.findByRole("button", {
      name: /Məntəqəyə Çatdım — Aktiv Et/i,
    });
    fireEvent.click(arrivedBtn);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/Məntəqə Aktivdir \(Demo Kiosk\)/i)).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: /NFC \/ RingXCare Üzük Qoş/i })
    ).toBeInTheDocument();
  });
});
