import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Mic,
  Navigation,
  PhoneCall,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { useHealthPoint } from "../context/HealthPointContext";
import { useAccessPointsQuery } from "../hooks/useHealthPointData";
import {
  runDeterministicAssistant,
  type AssistantResponsePayload,
} from "../lib/assistantFallback";
import { formatDistance, haversineDistanceMeters } from "../lib/geo";
import type { AssistantMessage } from "../types/healthpoint";

const STORAGE_KEY = "hp_assistant_history_v1";

interface SpeechRecognitionEventLike {
  results?: {
    [index: number]: {
      [index: number]: {
        transcript?: string;
      };
    };
  };
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

export function AssistantPage() {
  const { t } = useTranslation();
  const { language, effectiveOrigin } = useHealthPoint();
  const { data: points = [] } = useAccessPointsQuery();

  const createWelcomeMessage = (): AssistantMessage => ({
    id: "welcome",
    role: "assistant",
    content: t("assistant.welcome"),
    mode: "deterministic",
    provider: null,
    createdAt: new Date().toISOString(),
  });

  const [messages, setMessages] = useState<AssistantMessage[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AssistantMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore invalid stored chat
    }
    return [createWelcomeMessage()];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [activeMode, setActiveMode] = useState<{
    mode: "ai" | "deterministic";
    provider: string | null;
  }>({ mode: "deterministic", provider: null });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore storage quota errors
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const pointsById = useMemo(() => {
    const map = new Map(points.map((p) => [p.id, p]));
    return map;
  }, [points]);

  const suggestedPrompts = useMemo(() => {
    const raw = t("assistant.prompts", { returnObjects: true });
    return Array.isArray(raw) ? (raw as string[]) : [];
  }, [t]);

  const sendQuery = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: AssistantMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setVoiceNote(null);
    setIsLoading(true);

    let result: AssistantResponsePayload;
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmed,
          language,
          userLocation: effectiveOrigin,
          points,
        }),
      });
      if (res.ok) {
        const json = (await res.json()) as AssistantResponsePayload;
        if (json && typeof json.reply === "string") {
          result = json;
        } else {
          result = runDeterministicAssistant(trimmed, language, points, effectiveOrigin);
        }
      } else {
        result = runDeterministicAssistant(trimmed, language, points, effectiveOrigin);
      }
    } catch {
      result = runDeterministicAssistant(trimmed, language, points, effectiveOrigin);
    }

    setActiveMode({ mode: result.mode, provider: result.provider });
    const botMsg: AssistantMessage = {
      id: `a_${Date.now()}`,
      role: "assistant",
      content: result.reply,
      mode: result.mode,
      provider: result.provider,
      matchedIds: result.matchedIds,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendQuery(input);
  };

  const handleVoiceInput = () => {
    setVoiceNote(null);
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechRec = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceNote(t("assistant.voiceUnsupported"));
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = language === "az" ? "az-AZ" : language === "ru" ? "ru-RU" : "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript ?? "";
        if (transcript) {
          setInput(transcript);
        }
        setIsListening(false);
      };
      recognition.onerror = () => {
        setIsListening(false);
        setVoiceNote(t("assistant.voiceUnsupported"));
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceNote(t("assistant.voiceUnsupported"));
    }
  };

  const handleClear = () => {
    const fresh = [createWelcomeMessage()];
    setMessages(fresh);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-6 flex flex-col gap-4">
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-4 sm:p-5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#C8102E] text-white flex items-center justify-center shadow-brand shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#171717]">{t("assistant.title")}</h1>
            <p className="text-xs text-[#737373]">{t("assistant.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF1F2] text-[#8B1028] border border-[#FCE8EC]">
            <Sparkles className="w-3.5 h-3.5" />
            {activeMode.mode === "ai" && activeMode.provider
              ? t("assistant.badgeAi", { provider: activeMode.provider })
              : t("assistant.badgeDeterministic")}
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-[#737373] hover:text-[#C8102E] hover:border-[#FCE8EC] focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t("assistant.clearChat")}
          </button>
        </div>
      </div>

      {/* Emergency shortcut strip */}
      <div className="rounded-2xl bg-[#FFF1F2] border border-[#FCE8EC] px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-[#8B1028] font-medium">{t("emergency.subheading")}</p>
        <div className="flex items-center gap-2">
          <a
            href="tel:103"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C8102E] text-white text-xs font-bold hover:bg-[#8B1028]"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            103
          </a>
          <Link
            to="/emergency"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#C8102E] text-[#C8102E] text-xs font-bold hover:bg-[#FFF1F2]"
          >
            {t("nav.emergency")}
          </Link>
        </div>
      </div>

      {/* Suggested prompts */}
      {suggestedPrompts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void sendQuery(prompt)}
              className="px-3.5 py-2 rounded-full bg-white border border-[#E5E7EB] text-xs font-semibold text-[#171717] hover:border-[#C8102E] hover:text-[#C8102E] hover:bg-[#FFF1F2] transition focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Messages area */}
      <div
        className="bg-white rounded-3xl border border-[#E5E7EB] shadow-soft p-4 sm:p-5 space-y-4 min-h-[340px] max-h-[55vh] overflow-y-auto"
        aria-live="polite"
      >
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          const matchedPoints = (msg.matchedIds ?? [])
            .map((id) => pointsById.get(id))
            .filter((p): p is NonNullable<typeof p> => Boolean(p));

          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"} gap-2`}>
              <div
                className={`max-w-[90%] sm:max-w-[82%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line leading-relaxed ${
                  isUser
                    ? "bg-[#C8102E] text-white rounded-br-md"
                    : "bg-[#FAFAFA] border border-[#E5E7EB] text-[#171717] rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>

              {!isUser && matchedPoints.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-1">
                  {matchedPoints.map((pt) => {
                    const dist = haversineDistanceMeters(effectiveOrigin, {
                      lat: pt.latitude,
                      lng: pt.longitude,
                    });
                    return (
                      <div
                        key={pt.id}
                        className="rounded-2xl border border-[#E5E7EB] bg-white p-3.5 shadow-soft flex flex-col justify-between gap-2.5"
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-[#171717] leading-snug">{pt.name}</p>
                            <StatusBadge status={pt.operationalStatus} />
                          </div>
                          <p className="text-[11px] text-[#737373]">
                            {pt.address} • {formatDistance(dist, language)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/navigation/${pt.id}`}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-[#C8102E] text-white text-xs font-semibold hover:bg-[#8B1028]"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            {t("point.navigate")}
                          </Link>
                          <Link
                            to={`/points/${pt.id}`}
                            className="px-3 py-1.5 rounded-xl border border-[#C8102E] text-[#C8102E] text-xs font-semibold hover:bg-[#FFF1F2]"
                          >
                            {t("point.details")}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs text-[#737373]">
            <span className="w-2 h-2 rounded-full bg-[#C8102E] animate-ping" />
            Searching Baku access points...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Chat Composer */}
      <form onSubmit={handleSubmit} className="space-y-2">
        {voiceNote && (
          <p className="text-xs text-[#C8102E] px-2" role="alert">
            {voiceNote}
          </p>
        )}
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-[#E5E7EB] p-2 shadow-soft focus-within:border-[#C8102E]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("assistant.placeholder")}
            aria-label={t("assistant.placeholder")}
            className="flex-1 px-3 py-2 text-sm text-[#171717] placeholder:text-[#737373] bg-transparent focus:outline-none"
          />
          <button
            type="button"
            onClick={handleVoiceInput}
            aria-label={t("assistant.voiceInput")}
            className={`p-2.5 rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-[#C8102E] ${
              isListening
                ? "bg-[#FFF1F2] border-[#C8102E] text-[#C8102E]"
                : "border-[#E5E7EB] text-[#737373] hover:text-[#171717]"
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C8102E] text-white text-sm font-semibold hover:bg-[#8B1028] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#E11D48] transition"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{t("assistant.send")}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
