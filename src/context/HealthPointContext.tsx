import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { BAKU_DEFAULT_CENTER } from "../data/bakuDemoPoints";
import { DEFAULT_FILTER } from "../lib/filters";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  DEFAULT_ACCESSIBILITY,
  loadLocalUserProfile,
  loadStoredAccessibility,
  loadStoredLanguage,
  saveLocalProfilePatch,
  saveStoredAccessibility,
  saveStoredLanguage,
  setDemoAuthSession,
} from "../services/healthpointStore";
import type {
  AccessPointFilter,
  AccessibilityPreferences,
  Coordinates,
  LanguageCode,
  UserProfile,
} from "../types/healthpoint";

interface HealthPointContextValue {
  userLocation: Coordinates | null;
  effectiveOrigin: Coordinates;
  locationPermission: "prompt" | "granted" | "denied" | "manual";
  requestLocation: () => Promise<Coordinates>;
  setManualLocation: (coords: Coordinates) => void;
  filter: AccessPointFilter;
  setFilter: React.Dispatch<React.SetStateAction<AccessPointFilter>>;
  resetFilters: () => void;
  accessibility: AccessibilityPreferences;
  updateAccessibility: (patch: Partial<AccessibilityPreferences>) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  user: UserProfile | null;
  authLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  signInDemo: (asAdmin: boolean) => void;
  signOut: () => Promise<void>;
  updateUserProfile: (patch: Partial<UserProfile>) => Promise<void>;
  selectedPointId: string | null;
  setSelectedPointId: (id: string | null) => void;
}

const HealthPointContext = createContext<HealthPointContextValue | null>(null);

function applyAccessibilityToDom(prefs: AccessibilityPreferences): void {
  const root = document.documentElement;
  root.classList.toggle("hp-easy-access", prefs.easyAccessMode);
  root.classList.toggle("hp-font-large", prefs.fontSize === "large");
  root.classList.toggle("hp-font-xlarge", prefs.fontSize === "xlarge");
  root.classList.toggle("hp-high-contrast", prefs.highContrast);
  root.classList.toggle("hp-reduced-motion", prefs.reducedMotion);
}

const PAGE_TITLES: Record<LanguageCode, string> = {
  az: "OpenCarePoint — Həyatın baş verdiyi hər yerdə sağlamlıq dəstəyi",
  en: "OpenCarePoint — Healthcare access, wherever life happens",
  ru: "OpenCarePoint — Доступ к медицине там, где идёт жизнь",
};

export function HealthPointProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationPermission, setLocationPermission] = useState<
    "prompt" | "granted" | "denied" | "manual"
  >("prompt");

  const [filter, setFilter] = useState<AccessPointFilter>(DEFAULT_FILTER);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  const [accessibility, setAccessibility] = useState<AccessibilityPreferences>(() =>
    typeof window !== "undefined" ? loadStoredAccessibility() : DEFAULT_ACCESSIBILITY
  );

  const [language, setLanguageState] = useState<LanguageCode>(() =>
    typeof window !== "undefined" ? loadStoredLanguage() : "az"
  );

  const [user, setUser] = useState<UserProfile | null>(() =>
    typeof window !== "undefined" && !isSupabaseConfigured() ? loadLocalUserProfile() : null
  );
  const [authLoading, setAuthLoading] = useState<boolean>(() => isSupabaseConfigured());

  useEffect(() => {
    applyAccessibilityToDom(accessibility);
    saveStoredAccessibility(accessibility);
  }, [accessibility]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = PAGE_TITLES[language] ?? PAGE_TITLES.az;
    void i18n.changeLanguage(language);
    saveStoredLanguage(language);
  }, [language, i18n]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    const loadSupabaseUser = async (uid: string, email?: string) => {
      const [{ data: profile }, { data: roleRow }] = await Promise.all([
        supabase!.from("profiles").select("*").eq("id", uid).maybeSingle(),
        supabase!.from("admin_roles").select("role").eq("user_id", uid).maybeSingle(),
      ]);
      if (!mounted) return;
      const resolvedLang = (profile?.preferred_language as LanguageCode) || loadStoredLanguage();
      const resolvedAccess =
        (profile?.accessibility_preferences as AccessibilityPreferences) ||
        loadStoredAccessibility();

      setLanguageState(resolvedLang);
      setAccessibility(resolvedAccess);
      setUser({
        id: uid,
        email,
        fullName: String(profile?.full_name ?? email ?? ""),
        preferredLanguage: resolvedLang,
        accessibilityPreferences: resolvedAccess,
        notificationsEnabled: Boolean(profile?.notifications_enabled ?? true),
        shareLocationHistory: Boolean(profile?.share_location_history ?? false),
        isAdmin: Boolean(roleRow && (roleRow.role === "admin" || roleRow.role === "operator")),
        isDemoAuth: false,
      });
      setAuthLoading(false);
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session?.user) {
        void loadSupabaseUser(data.session.user.id, data.session.user.email);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        void loadSupabaseUser(session.user.id, session.user.email);
      } else {
        setUser(null);
        setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const requestLocation = useCallback((): Promise<Coordinates> => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocationPermission("denied");
      return Promise.resolve(userLocation ?? BAKU_DEFAULT_CENTER);
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserLocation(coords);
          setLocationPermission("granted");
          resolve(coords);
        },
        () => {
          setLocationPermission("denied");
          resolve(userLocation ?? BAKU_DEFAULT_CENTER);
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 30_000 }
      );
    });
  }, [userLocation]);

  const setManualLocation = useCallback((coords: Coordinates) => {
    setUserLocation(coords);
    setLocationPermission("manual");
  }, []);

  const resetFilters = useCallback(() => {
    setFilter(DEFAULT_FILTER);
  }, []);

  const updateAccessibility = useCallback((patch: Partial<AccessibilityPreferences>) => {
    setAccessibility((prev) => ({ ...prev, ...patch }));
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      return;
    }
    const isAdmin = email.toLowerCase().includes("admin");
    setDemoAuthSession({
      loggedIn: true,
      isAdmin,
      email,
      fullName: isAdmin ? "Demo Admin" : email.split("@")[0] || "Demo User",
    });
    setUser(loadLocalUserProfile());
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string, fullName: string) => {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw new Error(error.message);
        return;
      }
      setDemoAuthSession({
        loggedIn: true,
        isAdmin: false,
        email,
        fullName: fullName || "Demo İstifadəçi",
      });
      setUser(loadLocalUserProfile());
    },
    []
  );

  const signInDemo = useCallback((asAdmin: boolean) => {
    setDemoAuthSession({
      loggedIn: true,
      isAdmin: asAdmin,
      email: asAdmin ? "admin@opencarepoint.demo" : "vetendas@opencarepoint.demo",
      fullName: asAdmin ? "Bakı Əməliyyat Admini (Demo)" : "Leyla Əliyeva (Demo)",
    });
    setUser(loadLocalUserProfile());
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    setDemoAuthSession(null);
    setUser(null);
  }, []);

  const updateUserProfile = useCallback(
    async (patch: Partial<UserProfile>) => {
      if (isSupabaseConfigured() && supabase && user && !user.isDemoAuth) {
        await supabase
          .from("profiles")
          .update({
            full_name: patch.fullName ?? user.fullName,
            preferred_language: patch.preferredLanguage ?? language,
            accessibility_preferences: patch.accessibilityPreferences ?? accessibility,
            notifications_enabled: patch.notificationsEnabled ?? user.notificationsEnabled,
            share_location_history: patch.shareLocationHistory ?? user.shareLocationHistory,
          })
          .eq("id", user.id);
      } else {
        saveLocalProfilePatch(patch);
      }
      setUser((prev) => (prev ? { ...prev, ...patch } : prev));
    },
    [user, language, accessibility]
  );

  const effectiveOrigin = userLocation ?? BAKU_DEFAULT_CENTER;

  const value = useMemo<HealthPointContextValue>(
    () => ({
      userLocation,
      effectiveOrigin,
      locationPermission,
      requestLocation,
      setManualLocation,
      filter,
      setFilter,
      resetFilters,
      accessibility,
      updateAccessibility,
      language,
      setLanguage,
      user,
      authLoading,
      signInWithEmail,
      signUpWithEmail,
      signInDemo,
      signOut,
      updateUserProfile,
      selectedPointId,
      setSelectedPointId,
    }),
    [
      userLocation,
      effectiveOrigin,
      locationPermission,
      requestLocation,
      setManualLocation,
      filter,
      resetFilters,
      accessibility,
      updateAccessibility,
      language,
      setLanguage,
      user,
      authLoading,
      signInWithEmail,
      signUpWithEmail,
      signInDemo,
      signOut,
      updateUserProfile,
      selectedPointId,
    ]
  );

  return <HealthPointContext.Provider value={value}>{children}</HealthPointContext.Provider>;
}

export function useHealthPoint(): HealthPointContextValue {
  const ctx = useContext(HealthPointContext);
  if (!ctx) {
    throw new Error("useHealthPoint must be used within HealthPointProvider");
  }
  return ctx;
}
