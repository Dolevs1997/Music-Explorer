import { getSongSuggestions } from "../services/OpenAI_service";

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

// Detect browser language and convert to Web Speech API format
function getDetectedLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  console.log("Browser language detected:", browserLang);
  // Check if browser language is directly supported
  if (SPEECH_RECOGNITION_LANGUAGES[browserLang]) {
    return browserLang;
  }

  // Try to match language without region
  const langCode = browserLang.split("-")[0];
  const matching = Object.keys(SPEECH_RECOGNITION_LANGUAGES).find((lang) =>
    lang.startsWith(langCode),
  );

  return matching || "en-US";
}

function voiceSearchSong(language = null) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const SpeechGrammarList =
    window.SpeechGrammarList || window.webkitSpeechGrammarList;

  const recognition = new SpeechRecognition();
  const speechRecognitionList = new SpeechGrammarList();

  recognition.grammars = speechRecognitionList;
  // Allow longer sessions and multiple phrases
  recognition.continuous = true;
  // Get partial (interim) results while speaking
  recognition.interimResults = true;

  // Use provided language or detect automatically
  const detectedLang = language || getDetectedLanguage();
  recognition.lang = detectedLang;
  console.log("Speech recognition language set to:", recognition.lang);

  recognition.maxAlternatives = 1;
  recognition.start();
  return recognition;
}

// timeoutMs controls how long to listen before processing
// language parameter can be used to override auto-detected language (e.g., "he-IL" for Hebrew)
async function handleVoiceSearch(
  userData,
  timeoutMs = 10000,
  setResultVoice,
  language = null,
) {
  return new Promise((resolve, reject) => {
    if (!userData || !userData.token) {
      console.error("User data or token is missing");
      reject("User data or token is missing");
      return;
    }

    const recognition = voiceSearchSong(language);

    let finalTranscript = "";

    // Collect final results across the session
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript +=
            (finalTranscript ? " " : "") + result[0].transcript;
          timeoutMs -= 1000;
        }
      }
    };

    const stopTimer = setTimeout(() => {
      try {
        recognition.stop();
      } catch (e) {
        console.error("Error stopping recognition:", e);
        // noop
      }
    }, timeoutMs);

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      clearTimeout(stopTimer);
      try {
        recognition.stop();
      } catch (e) {
        console.error("Error stopping recognition after error:", e);
      }
      reject(event.error);
    };

    recognition.onend = async () => {
      clearTimeout(stopTimer);
      const transcript = finalTranscript.trim();
      if (!transcript) {
        reject("No speech detected or transcript empty");
        return;
      }
      const payload = {
        content: transcript,
        role: "user",
      };

      try {
        const response = await getSongSuggestions(payload, userData.token);
        resolve(response);
        setResultVoice(response);
      } catch (error) {
        console.error("Error fetching song suggestions:", error);
        setResultVoice(error);
        reject(error);
      }
    };
  });
}

export { handleVoiceSearch, SPEECH_RECOGNITION_LANGUAGES, getDetectedLanguage };
