import styles from "./Search.module.css";
import {
  handleStartRecording,
  handleStopRecording,
} from "../../utils/recording";
import {
  handleVoiceSearch,
  SPEECH_RECOGNITION_LANGUAGES,
  getDetectedLanguage,
} from "../../utils/voice_search_song";
import { useNavigate } from "react-router";
import {
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { SearchContext } from "../../Contexts/SearchContext";
import { BarsScaleMiddleIcon } from "../../components/icons/svg-spinners-bars-scale-middle";
import MicrophoneAnimation from "../../components/icons/MicrophoneAnimation";
import { Spinner } from "../../components/ui/spinner";
import Form from "../Form/Form";
import { Toaster, toast } from "react-hot-toast";
import TooltipComponent from "../TooltipComponent";
import { deduplicateSongs } from "../../utils/deduplicateSongs";
export default function Search() {
  const {
    formVisible,
    setFormVisible,
    isMapVisible,
    setIsMapVisible,
    isRecording,
    setIsRecording,
    setSongSuggestions,
    setIsVoiceSearch,
    isVoiceSearch,
  } = useContext(SearchContext);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const voiceRecognitionRef = useRef(null);

  const userData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [proccessRecording, setProccessRecording] = useState(false);
  const [proccessVoiceSearch, setProccessVoiceSearch] = useState(false);
  const [resultRecord, setResultRecord] = useState(null);
  const [resultVoice, setResultVoice] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(
    getDetectedLanguage(),
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setSecondsLeft(10);
  }, []);
  useEffect(() => {
    if (resultRecord?.error) {
      toast.error("Voice record failed! Please try again.");
    } else if (resultVoice?.error) {
      toast.error("Voice search failed! Please try again.");
    } else if (resultRecord) {
      toast.success("Voice record successful! Redirecting to home...");
      navigate("/home");
    }
  }, [resultRecord, resultVoice, navigate]);

  const stopRecordingAndReset = useCallback(async () => {
    setIsRecording(false);
    handleStopRecording(
      userData,
      setSongSuggestions,
      setProccessRecording,
      setResultRecord,
    );
    setIsVoiceSearch(false);
    setIsMapVisible(false);
    setFormVisible(false);
  }, [
    setFormVisible,
    setIsMapVisible,
    setIsRecording,
    setIsVoiceSearch,
    setSongSuggestions,
    userData,
  ]);

  useEffect(() => {
    if (!isRecording) {
      setSecondsLeft(10);
      return;
    }

    setSecondsLeft(10);

    const countdownInterval = window.setInterval(() => {
      setSecondsLeft((prevSeconds) => {
        if (prevSeconds <= 1) {
          window.clearInterval(countdownInterval);
          stopRecordingAndReset();
          return 0;
        }

        return prevSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(countdownInterval);
  }, [isRecording, stopRecordingAndReset]);
  // Close menu when clicking outside
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [mobileMenuOpen]);

  // ===== HANDLER FUNCTIONS =====

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
      setFormVisible(false);
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

  const handleRecordClick = () => {
    if (proccessRecording) {
      stopRecordingAndReset();
      return;
    }

    setIsRecording(true);
    setProccessRecording(true);
    handleStartRecording();
    clearTimeout();
    setSecondsLeft(10);
    setIsVoiceSearch(false);
    setIsMapVisible(false);
    setFormVisible(false);
    mobileMenuOpen(false);
  };

  const handleTextSearchClick = () => {
    setMobileMenuOpen(false);
    setIsVoiceSearch(false);
    setIsRecording(false);
    setIsMapVisible(false);
    setFormVisible(!formVisible);
  };

  const handleMapClick = () => {
    setMobileMenuOpen(false);
    setIsMapVisible(!isMapVisible);
    navigate("/global");
  };
  return (
    <>
      <div className={styles.searchBar}>
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
        {/* ===== DESKTOP ICONS ===== */}

        <TooltipComponent text="searching song by voice">
          {!isVoiceSearch && (
            <button
              onClick={async () => {
                setIsVoiceSearch(true);
                setProccessVoiceSearch(true);
                const response = await handleVoiceSearch(
                  userData,
                  10000,
                  setResultVoice,
                  selectedLanguage,
                );
                if (!response) return;
                else if (response?.length == 0)
                  toast.error("No available songs, please try again..");
                setProccessVoiceSearch(false);
                setSongSuggestions(deduplicateSongs(response));
                setIsVoiceSearch(false);
                setIsMapVisible(false);
                setIsRecording(false);
                setFormVisible(false);

                navigate("/home");
              }}
              disabled={proccessVoiceSearch}
            >
              <img src="/mic_i.png" />
              {proccessVoiceSearch && (
                <div className={styles.recordingSpinner}>
                  <Spinner />
                  Proccessing...
                </div>
              )}
            </button>
          )}
          {isVoiceSearch && (
            <MicrophoneAnimation
              setIsVoiceSearch={setIsVoiceSearch}
              mobileMenuOpen={false}
            />
          )}
        </TooltipComponent>
        {/* Recording Timer */}
        {isRecording && (
          <span
            className={styles.recordingSpinner}
            onClick={stopRecordingAndReset}
          >
            <div className={styles.recordingSpinner}>
              <BarsScaleMiddleIcon
                width={40}
                height={60}
                fill="none"
                stroke="#ffffff"
              />
              <Spinner />
              Please wait {secondsLeft} seconds...
            </div>
          </span>
        )}
        {/* Identify Song Button */}

        <TooltipComponent text="Identify song (currently works only for spotify)">
          {!isRecording && (
            <button
              onClick={async () => {
                setIsRecording(true);
                setProccessRecording(true);
                handleStartRecording();
                clearTimeout();
                setSecondsLeft(10);
                setIsVoiceSearch(false);
                setIsMapVisible(false);
                setFormVisible(false);
              }}
              disabled={proccessRecording}
            >
              <img src="/record_i.png" />
              {proccessRecording && (
                <div className={styles.recordingSpinner}>
                  <Spinner />
                  Proccessing...
                </div>
              )}
            </button>
          )}
        </TooltipComponent>
        {/* Text Search */}

        <TooltipComponent text="searching by text">
          <span>
            <img
              src="/chat_i.png"
              onClick={() => {
                setIsVoiceSearch(false);
                setIsRecording(false);
                setIsMapVisible(false);
                setFormVisible(!formVisible);
              }}
            />
          </span>
        </TooltipComponent>
        {/* Explore Global */}

        <TooltipComponent text="explore global songs">
          <span
            onClick={() => {
              setIsMapVisible(!isMapVisible);
              navigate("/global");
            }}
          >
            <img src="/earth_i.png" />
          </span>
        </TooltipComponent>
      </div>

      {formVisible && (
        <Form
          setSongSuggestions={setSongSuggestions}
          setFormVisible={setFormVisible}
          formVisible={formVisible}
        />
      )}

      {/* ===== HAMBURGER MENU (MOBILE ONLY) ===== */}
      <button
        className={styles.hamburger}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        title="Menu"
      >
        ☰
      </button>
      {/* ===== MOBILE DROPDOWN MENU ===== */}
      <div
        className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ""}`}
      >
        {/* Language selector in menu */}
        <select
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
        </select>

        {/* Voice Search */}
        <button
          onClick={handleVoiceSearchClick}
          disabled={proccessVoiceSearch && !isVoiceSearch}
        >
          {!isVoiceSearch && (
            <>
              <img src="/mic_i.png" alt="Voice Search" />
              <span>Voice Search</span>
              {proccessVoiceSearch && <Spinner />}
            </>
          )}
          {isVoiceSearch && (
            <MicrophoneAnimation
              setIsVoiceSearch={setIsVoiceSearch}
              mobileMenuOpen={true}
            />
          )}
        </button>

        {/* Identify Song */}
        <button
          className={styles.recordingButton}
          onClick={handleRecordClick}
          disabled={proccessRecording && !isRecording}
        >
          {!isRecording && (
            <>
              <img src="/record_i.png" alt="Identify Song" />
              <span>Identify Song</span>
              {proccessRecording && (
                <span className={styles.recordingSpinnerRight}>
                  <Spinner />
                </span>
              )}
            </>
          )}

          {isRecording && (
            <>
              <BarsScaleMiddleIcon
                width={20}
                height={30}
                fill="none"
                stroke="#ffffff"
              />
              <span>Identify Song</span>
            </>
          )}
        </button>

        {/* Text Search */}
        <button onClick={handleTextSearchClick}>
          <img src="/chat_i.png" alt="Text Search" />
          <span>Text Search</span>
        </button>

        {/* Explore Global */}
        <button onClick={handleMapClick}>
          <img src="/earth_i.png" alt="Explore" />
          <span>Explore Global</span>
        </button>
      </div>

      <Toaster />
    </>
  );
}
