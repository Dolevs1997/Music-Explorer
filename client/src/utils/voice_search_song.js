// Web Speech API language codes
const SPEECH_RECOGNITION_LANGUAGES = {
  "en-US": "English (US)",
  "en-GB": "English (UK)",
  "he-IL": "עברית (Hebrew)",
  "fr-FR": "Français (French)",
  "de-DE": "Deutsch (German)",
  "it-IT": "Italiano (Italian)",
  "es-ES": "Español (Spanish)",
  "pt-BR": "Português (Portuguese)",
  "ru-RU": "Русский (Russian)",
  "zh-CN": "中文 (Chinese)",
  "ja-JP": "日本語 (Japanese)",
  "ar-SA": "العربية (Arabic)",
  "ko-KR": "한국어 (Korean)",
  "hi-IN": "हिन्दी (Hindi)",
};

function getDetectedLanguage() {
  const browserLang = navigator.language || navigator.userLanguage || "en-US";
  if (SPEECH_RECOGNITION_LANGUAGES[browserLang]) {
    return browserLang;
  }

  const langCode = browserLang.split("-")[0];
  return (
    Object.keys(SPEECH_RECOGNITION_LANGUAGES).find((lang) =>
      lang.startsWith(langCode),
    ) || "en-US"
  );
}

function createVoiceRecognition(language) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    throw new Error("Speech recognition is not supported by this browser.");
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.lang = language || getDetectedLanguage();

  return recognition;
}

export {
  createVoiceRecognition,
  SPEECH_RECOGNITION_LANGUAGES,
  getDetectedLanguage,
};
