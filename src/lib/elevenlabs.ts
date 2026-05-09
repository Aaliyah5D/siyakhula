/**
 * ElevenLabs Voice Service for Siyakhula
 *
 * Provides Speech-to-Text (STT) and Text-to-Speech (TTS) via ElevenLabs API.
 * In production, these calls are proxied through Supabase Edge Functions
 * so the API key is never exposed to the client. For development/demo,
 * we fall back to direct API calls using VITE_ env vars.
 */

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || "";
const ELEVENLABS_VOICE_ID =
  import.meta.env.VITE_ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // "Rachel" default

// Supabase edge function base (set when connected)
const EDGE_BASE = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : "";

// ---------------------------------------------------------------------------
// Speech-to-Text
// ---------------------------------------------------------------------------

export interface STTResult {
  text: string;
}

/**
 * Transcribes an audio blob using ElevenLabs Speech-to-Text.
 * Falls back to a simulated response when no API key is configured.
 */
export async function transcribeAudio(
  audioBlob: Blob,
  fallbackText?: string
): Promise<STTResult> {
  // If edge functions are available, proxy through them
  if (EDGE_BASE) {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      const res = await fetch(`${EDGE_BASE}/voice-transcribe`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ""}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        return { text: data.text || data.transcript || "" };
      }
    } catch (e) {
      console.warn("Edge function transcribe failed, falling back:", e);
    }
  }

  // Direct ElevenLabs API call (dev mode)
  if (ELEVENLABS_API_KEY) {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      formData.append("model_id", "scribe_v1");
      formData.append("language_code", "en");

      const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        return { text: data.text || "" };
      }
      console.warn("ElevenLabs STT returned status:", res.status);
    } catch (e) {
      console.warn("ElevenLabs STT error:", e);
    }
  }

  // Simulation fallback — for demo without API keys
  console.info("[Siyakhula] No ElevenLabs key — using simulated transcript");
  await simulateDelay(1500);
  return { text: fallbackText || "I am a farmer from Limpopo looking for funding." };
}

// ---------------------------------------------------------------------------
// Text-to-Speech
// ---------------------------------------------------------------------------

/**
 * Converts text to speech using ElevenLabs TTS.
 * Returns an AudioBuffer URL that can be played with an <audio> element.
 */
export async function speakText(text: string): Promise<string | null> {
  // Edge function proxy
  if (EDGE_BASE) {
    try {
      const res = await fetch(`${EDGE_BASE}/voice-speak`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ""}`,
        },
        body: JSON.stringify({ text, voice_id: ELEVENLABS_VOICE_ID }),
      });
      if (res.ok) {
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      }
    } catch (e) {
      console.warn("Edge function speak failed, falling back:", e);
    }
  }

  // Direct ElevenLabs API call (dev mode)
  if (ELEVENLABS_API_KEY) {
    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.3,
            },
          }),
        }
      );

      if (res.ok) {
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      }
      console.warn("ElevenLabs TTS returned status:", res.status);
    } catch (e) {
      console.warn("ElevenLabs TTS error:", e);
    }
  }

  // Fallback: use browser built-in TTS
  console.info("[Siyakhula] No ElevenLabs key — using browser speech synthesis");
  return null; // caller should use browserSpeak() instead
}

/**
 * Browser fallback TTS using the Web Speech API.
 * Returns a promise that resolves when speaking is done.
 */
export function browserSpeak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = "en-ZA";
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Unified speak function: tries ElevenLabs first, falls back to browser TTS.
 * Returns when audio finishes playing.
 */
export async function speakToFarmer(text: string): Promise<void> {
  const audioUrl = await speakText(text);

  if (audioUrl) {
    return new Promise((resolve) => {
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        // Fall back to browser TTS
        browserSpeak(text).then(resolve);
      };
      audio.play().catch(() => {
        URL.revokeObjectURL(audioUrl);
        browserSpeak(text).then(resolve);
      });
    });
  }

  return browserSpeak(text);
}

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

export interface FarmerProfile {
  name: string;
  location: string;
  hectares: string;
  fundingAmount: string;
  profitSplit: string;
  waterSource: string;
  experience: string;
}

/**
 * Extracts structured farmer data from the four voice transcripts.
 * Uses simple NLP heuristics. A production version would call GPT-4.
 */
export function parseFarmerTranscripts(transcripts: string[]): FarmerProfile {
  const all = transcripts.join(" ");

  // Name extraction
  const nameMatch = all.match(
    /(?:my name is|i am|i'm|name's|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
  );
  const name = nameMatch?.[1] || extractPossibleName(transcripts[0] || "");

  // Location
  const locMatch = all.match(
    /(?:farm is in|located in|from|in)\s+([A-Z][a-zA-Z,\s]+?)(?:\.|,\s*(?:and|I|my|it|the)|$)/i
  );
  const location = locMatch?.[1]?.trim() || "Limpopo Province";

  // Hectares
  const haMatch = all.match(/(\d+(?:\.\d+)?)\s*(?:hectares?|ha\b)/i);
  const hectares = haMatch?.[1] || "5";

  // Funding
  const fundMatch = all.match(
    /(?:R|rands?)\s*(\d[\d,]*(?:\.\d+)?)|(\d[\d,]*(?:\.\d+)?)\s*(?:rands?|R\b)/i
  );
  const fundingAmount = fundMatch
    ? `R${(fundMatch[1] || fundMatch[2]).replace(/,/g, "")}`
    : "R85,000";

  // Profit split
  const splitMatch = all.match(
    /(\d{1,3})\s*(?:%|percent)\s*(?:of|profit|share|to investors)/i
  );
  const profitSplit = splitMatch ? `${splitMatch[1]}% to investors` : "40% to investors";

  // Water source
  const waterMatch = all.match(
    /(?:water|irrigation|borehole|dam|river|rain|drip|pivot|sprinkler)[^.]*\./i
  );
  const waterSource = waterMatch?.[0]?.trim() || extractWaterInfo(all);

  // Experience
  const expMatch = all.match(/(\d+)\s*(?:years?|seasons?)\s*(?:of\s*)?(?:farming|experience|growing)/i);
  const experience = expMatch ? `${expMatch[1]} years farming` : extractExperience(all);

  return {
    name,
    location,
    hectares,
    fundingAmount,
    profitSplit,
    waterSource,
    experience,
  };
}

function extractPossibleName(text: string): string {
  // Try to get first two capitalized words
  const words = text.split(/\s+/);
  const caps = words.filter((w) => /^[A-Z]/.test(w) && w.length > 1);
  if (caps.length >= 2) return `${caps[0]} ${caps[1]}`;
  if (caps.length === 1) return caps[0];
  return "Farmer";
}

function extractWaterInfo(text: string): string {
  if (/borehole/i.test(text)) return "Borehole irrigation";
  if (/drip/i.test(text)) return "Drip irrigation";
  if (/river/i.test(text)) return "River water access";
  if (/dam/i.test(text)) return "Dam water supply";
  if (/rain/i.test(text)) return "Rain-fed farming";
  if (/pivot/i.test(text)) return "Center pivot irrigation";
  return "Mixed water sources";
}

function extractExperience(text: string): string {
  if (/first\s*(?:time|season)/i.test(text)) return "First season";
  if (/new\s*to/i.test(text)) return "New farmer";
  if (/many\s*years/i.test(text)) return "Experienced farmer";
  return "Experienced farmer";
}

// ---------------------------------------------------------------------------
// AI Summary (simulated — production uses GPT-4 via edge function)
// ---------------------------------------------------------------------------

/**
 * Generates an investor-friendly summary from a farmer's voice update.
 * In production, this calls GPT-4 via a Supabase Edge Function.
 */
export async function generateInvestorSummary(
  transcript: string,
  farmerName: string
): Promise<string> {
  // Edge function proxy for GPT-4 summarization
  if (EDGE_BASE) {
    try {
      const res = await fetch(`${EDGE_BASE}/voice-summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ""}`,
        },
        body: JSON.stringify({ transcript, farmer_name: farmerName }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.summary || data.text || "";
      }
    } catch (e) {
      console.warn("Edge function summarize failed, falling back:", e);
    }
  }

  // Client-side heuristic summary
  await simulateDelay(1200);
  return buildLocalSummary(transcript, farmerName);
}

function buildLocalSummary(transcript: string, farmerName: string): string {
  const lower = transcript.toLowerCase();
  const parts: string[] = [];

  parts.push(`${farmerName} reported:`);

  if (/plant/i.test(lower)) {
    const ha = lower.match(/(\d+)\s*(?:hectare|ha)/i);
    parts.push(`Planting progress${ha ? ` on ${ha[1]} hectares` : ""} confirmed.`);
  }
  if (/harvest/i.test(lower)) parts.push("Harvest activity underway.");
  if (/rain/i.test(lower)) parts.push("Recent rainfall noted.");
  if (/grow/i.test(lower) || /good/i.test(lower)) parts.push("Positive crop conditions observed.");
  if (/problem|issue|pest|disease|drought/i.test(lower))
    parts.push("Some challenges reported — details in full transcript.");

  if (parts.length === 1) {
    parts.push("Farm status update provided. Review full transcript for details.");
  }

  parts.push("Siyabonga!");
  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
