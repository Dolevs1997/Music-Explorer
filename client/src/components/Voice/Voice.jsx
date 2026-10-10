import styles from "./Voice.module.css";
import { SearchContext } from "../../Contexts/SearchContext";
import {
  handleVoiceSearch,
  SPEECH_RECOGNITION_LANGUAGES,
  getDetectedLanguage,
} from "../../utils/voice_search_song";
import { toast } from "react-hot-toast";
import { useContext, useState, useMemo, useRef } from "react";
import { deduplicateSongs } from "../../utils/deduplicateSongs";
import { useNavigate } from "react-router";
import { Spinner } from "../ui/spinner";
import { Mic } from "lucide-react";
function Voice() {
  const {
    setIsMapVisible,
    setIsRecording,
    setSongSuggestions,
    setIsVoiceSearch,
    isVoiceSearch,
  } = useContext(SearchContext);
  const navigate = useNavigate();

  const [proccessVoiceSearch, setProccessVoiceSearch] = useState(false);
  const voiceRecognitionRef = useRef(null);
  const [setResultVoice] = useState(null);

  const userData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);
  const [selectedLanguage, setSelectedLanguage] = useState(
    getDetectedLanguage(),
  );

  const handleVoiceSearchClick = async () => {
    if (isVoiceSearch && voiceRecognitionRef.current) {
      voiceRecognitionRef.current.stop();
      setIsVoiceSearch(false);
      return;
    }

    setIsVoiceSearch(true);
    setProccessVoiceSearch(true);
    try {
      const response = await handleVoiceSearch(
        userData,
        10000,
        setResultVoice,
        selectedLanguage,
        (recognition) => {
          voiceRecognitionRef.current = recognition;
        },
      );
      if (response?.length === 0)
        toast.error("No available songs, please try again.");
      setSongSuggestions(deduplicateSongs(response || []));
      setIsMapVisible(false);
      navigate("/home");
    } catch (error) {
      console.error("Voice search failed:", error);
      toast.error("Voice search failed! Please try again.");
    } finally {
      voiceRecognitionRef.current = null;
      setProccessVoiceSearch(false);
      setIsVoiceSearch(false);
    }
  };

  return (
    <nav>
      {/* Language Selector for Voice Search */}
      <select
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
        className="languageSelect"
        title="Select language for voice search"
      >
        <option disabled>Choose your language for voice</option>
        {Object.entries(SPEECH_RECOGNITION_LANGUAGES).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
      {/* Language selector in menu */}
      {/* <select
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
        className={styles.languageSelect}
        title="Select language"
      >
        <option disabled value="">
          Choose language
        </option>
        {Object.entries(SPEECH_RECOGNITION_LANGUAGES).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select> */}
      {!isVoiceSearch && (
        <button
          onClick={async () => {
            setIsVoiceSearch(true);
            setProccessVoiceSearch(true);
            try {
              const response = await handleVoiceSearch(
                userData,
                10000,
                setResultVoice,
                selectedLanguage,
              );
              if (!response) return;
              else if (response?.length == 0)
                toast.error("No available songs, please try again..");
              const uniqueSongs = deduplicateSongs(response);
              setProccessVoiceSearch(false);
              setSongSuggestions(uniqueSongs);
              setIsVoiceSearch(false);
              setIsMapVisible(false);
              setIsRecording(false);

              navigate("/home");
            } catch (e) {
              console.error("Error in speech detecting: ", e);
              toast.error("Speech recognition error");
              setProccessVoiceSearch(false);
            }
          }}
          disabled={proccessVoiceSearch}
        >
          {proccessVoiceSearch && (
            <div className={styles.recordingSpinner}>
              <Spinner />
              Proccessing...
            </div>
          )}
        </button>
      )}

      {/* Voice Search */}
      <button
        onClick={handleVoiceSearchClick}
        disabled={proccessVoiceSearch && !isVoiceSearch}
      >
        {!isVoiceSearch && (
          <div className="search-tool">
            <Mic
              size={28}
              strokeWidth={1.5}
              style={{
                cursor: "pointer",
                color: "#A855F7",
                filter: "drop-shadow(0 0 8px rgba(168,85,247,0.5))",
              }}
            />
            <span>Voice Search</span>
            {proccessVoiceSearch && <Spinner />}
          </div>
        )}
      </button>
    </nav>
  );
}

export default Voice;
