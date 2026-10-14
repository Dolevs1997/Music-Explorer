import { SearchContext } from "../../Contexts/SearchContext";
import { getSongSuggestions } from "../../services/OpenAI_service";
import { createVoiceRecognition } from "../../utils/voice_search_song";
import { toast } from "react-hot-toast";
import { useContext, useEffect, useRef, useState } from "react";
import { deduplicateSongs } from "../../utils/deduplicateSongs";
import { Spinner } from "../ui/spinner";
import { Mic } from "lucide-react";
import propTypes from "prop-types";
import {
  getDetectedLanguage,
  SPEECH_RECOGNITION_LANGUAGES,
} from "../../utils/voice_search_song";
import { useNavigate } from "react-router";
function Voice() {
  const { setIsMapVisible, setIsRecording, setSongSuggestions } =
    useContext(SearchContext);
  const [status, setStatus] = useState("idle");
  const [selectedLanguage, setSelectedLanguage] = useState(
    getDetectedLanguage(),
  );
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const recognitionFailedRef = useRef(false);
  const navigate = useNavigate();
  async function handleRecognitionEnd() {
    recognitionRef.current = null;

    if (recognitionFailedRef.current) {
      recognitionFailedRef.current = false;
      setStatus("idle");
      return;
    }

    const transcript = transcriptRef.current.trim();
    setStatus("processing");

    if (!transcript) {
      toast.error("No speech detected. Please try again.");
      setStatus("idle");
      return;
    }

    try {
      const response = await getSongSuggestions({
        content: transcript,
        role: "user",
      });

      const songs = deduplicateSongs(response || []);
      if (songs.length === 0) {
        toast.error("No available songs, please try again.");
      }
      setSongSuggestions(songs);
      setIsMapVisible(false);
      navigate("/home");
    } catch (error) {
      console.error(
        "Error fetching song suggestions from voice search:",
        error,
      );
      toast.error("Voice search failed. Please try again.");
    } finally {
      setStatus("idle");
    }
  }

  async function startRecording() {
    try {
      const recognition = createVoiceRecognition(selectedLanguage);
      transcriptRef.current = "";
      recognitionFailedRef.current = false;
      recognitionRef.current = recognition;

      recognition.onresult = (event) => {
        for (
          let index = event.resultIndex;
          index < event.results.length;
          index++
        ) {
          const result = event.results[index];
          if (result.isFinal) {
            transcriptRef.current += `${
              transcriptRef.current ? " " : ""
            }${result[0].transcript}`;
          }
        }
      };

      recognition.onerror = (event) => {
        recognitionFailedRef.current = true;
        console.error("Speech recognition error:", event.error);
        toast.error("Voice recording failed. Please check microphone access.");
        try {
          recognition.stop();
        } catch (error) {
          console.error(
            "Could not stop speech recognition after an error:",
            error,
          );
          recognitionRef.current = null;
          setStatus("idle");
        }
      };

      recognition.onend = handleRecognitionEnd;
      recognition.start();
      setIsRecording(false);
      setIsMapVisible(false);
      setStatus("listening");
    } catch (error) {
      console.error("Could not start voice recognition:", error);
      toast.error(error.message || "Voice search failed. Please try again.");
      recognitionRef.current = null;
      setStatus("idle");
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      setStatus("processing");
      recognitionRef.current.stop();
    }
  };

  const handleMicClick = () => {
    if (status === "listening") {
      stopRecording();
    } else if (status === "idle") {
      startRecording();
    }
  };

  useEffect(
    () => () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    },
    [],
  );

  return (
    <nav>
      <button
        type="button"
        onClick={handleMicClick}
        disabled={status === "processing"}
        aria-label={
          status === "listening"
            ? "Stop voice recording"
            : "Start voice recording"
        }
        aria-pressed={status === "listening"}
      >
        <div className="search-tool">
          {status === "processing" ? (
            <Spinner />
          ) : (
            <Mic
              size={28}
              strokeWidth={1.5}
              style={{
                cursor: status === "processing" ? "default" : "pointer",
                color: status === "listening" ? "#f75555" : "#A855F7",
                filter: "drop-shadow(0 0 8px rgba(168,85,247,0.5))",
              }}
            />
          )}
          <span>
            {status === "listening"
              ? "Click to stop"
              : status === "processing"
                ? "Processing..."
                : "Voice Search"}
          </span>
        </div>
      </button>

      <select
        value={selectedLanguage}
        onChange={(event) => setSelectedLanguage(event.target.value)}
        className="languageSelect"
        title="Select language for voice search"
        disabled={status !== "idle"}
      >
        {Object.entries(SPEECH_RECOGNITION_LANGUAGES).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </nav>
  );
}

Voice.propTypes = {
  setSongSuggestions: propTypes.func,
};

export default Voice;
