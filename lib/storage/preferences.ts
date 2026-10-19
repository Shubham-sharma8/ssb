import {
  UserPreferencesSchema,
  type UserPreferences,
} from "@/lib/validation/schemas";
import {
  decodeProtectedStorage,
  encodeProtectedStorage,
} from "@/lib/security/bot-guard";

const PREFS_STORAGE_KEY = "ssb_simulator_preferences_v1";

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: "light",
  writingMode: "notebook",
  defaultObservationSeconds: 30,
  defaultWritingSeconds: 240,
  showWordCounter: true,
  fullscreenShortcut: "f",
  brandName: "ssb.cogify.me",
  reduceMotion: false,
  soundAlerts: true,
};

export function loadUserPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return { ...DEFAULT_USER_PREFERENCES };
  }
  try {
    const raw = window.localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_USER_PREFERENCES };
    const parsed = decodeProtectedStorage<unknown>(raw);
    const result = UserPreferencesSchema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
    return { ...DEFAULT_USER_PREFERENCES };
  } catch {
    return { ...DEFAULT_USER_PREFERENCES };
  }
}

export function saveUserPreferences(
  partial: Partial<UserPreferences>
): UserPreferences {
  const current = loadUserPreferences();
  const next = UserPreferencesSchema.parse({ ...current, ...partial });
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        PREFS_STORAGE_KEY,
        encodeProtectedStorage(next)
      );
      window.dispatchEvent(
        new CustomEvent("ssb-preferences-changed", { detail: next })
      );
    } catch {
      // Ignore storage quota errors in preferences fallback
    }
  }
  return next;
}

export function resetUserPreferences(): UserPreferences {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(PREFS_STORAGE_KEY);
      window.dispatchEvent(
        new CustomEvent("ssb-preferences-changed", {
          detail: DEFAULT_USER_PREFERENCES,
        })
      );
    } catch {
      // Ignore
    }
  }
  return { ...DEFAULT_USER_PREFERENCES };
}
