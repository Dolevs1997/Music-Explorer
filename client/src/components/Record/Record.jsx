import styles from "./Record.module.css";
import { useState, useEffect, useCallback, useContext } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import { Spinner } from "../../components/ui/spinner";
import { SearchContext } from "../../Contexts/SearchContext";
import {
  handleStartRecording,
  handleStopRecording,
} from "../../utils/recording";
import { AudioLines } from "lucide-react";
function Record() {
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [proccessRecording, setProccessRecording] = useState(false);
  const [resultRecord, setResultRecord] = useState(null);
  const navigate = useNavigate();
  const {
    setIsMapVisible,
    isRecording,
    setIsRecording,
    setIsVoiceSearch,
    setSongSuggestions,
  } = useContext(SearchContext);
  useEffect(() => {
    setSecondsLeft(10);
  }, []);
  useEffect(() => {
    if (resultRecord?.error) {
      toast.error("Voice record failed! Please try again.");
    } else if (resultRecord) {
      toast.success("Voice record successful! Redirecting to home...");
      navigate("/home");
    }
  }, [resultRecord, navigate]);

  const stopRecordingAndReset = useCallback(async () => {
    setIsRecording(false);
    handleStopRecording(
      setSongSuggestions,
      setProccessRecording,
      setResultRecord,
    );
    setIsVoiceSearch(false);
    setIsMapVisible(false);
  }, [setIsMapVisible, setIsRecording, setIsVoiceSearch, setSongSuggestions]);

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
  };

  return (
    <div>
      {/* Identify Song */}
      <button
        className={styles.recordingButton}
        onClick={handleRecordClick}
        disabled={proccessRecording && !isRecording}
      >
        <div className="search-tool">
          <AudioLines
            size={28}
            strokeWidth={1.5}
            style={{
              cursor: "pointer",
              color: "#A855F7",
              filter: "drop-shadow(0 0 8px rgba(168,85,247,0.5))",
            }}
          />
          Identify Song
        </div>
      </button>
      {!isRecording && (
        <div>
          {proccessRecording && (
            <>
              <Spinner />
              Proccessing...
            </>
          )}
        </div>
      )}
      {isRecording && (
        <>
          <Spinner />
          Please wait {secondsLeft} seconds...
        </>
      )}
    </div>
  );
}

export default Record;
