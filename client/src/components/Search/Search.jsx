import styles from "./Search.module.css";
import {
  handleStartRecording,
  handleStopRecording,
} from "../../utils/recording";
import { handleVoiceSearch, SPEECH_RECOGNITION_LANGUAGES, getDetectedLanguage } from "../../utils/voice_search_song";
import { useNavigate } from "react-router";
import { useContext, useState, useEffect } from "react";
import { SearchContext } from "../../Contexts/SearchContext";
import { BarsScaleMiddleIcon } from "../../components/icons/svg-spinners-bars-scale-middle";
import MicrophoneAnimation from "../../components/icons/MicrophoneAnimation";
import { Spinner } from "../../components/ui/spinner";
import Form from "../Form/Form";
import { Toaster, toast } from "react-hot-toast";
import TooltipComponent from "../TooltipComponent";
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
  const userData = JSON.parse(localStorage.getItem("user"));
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [proccessRecording, setProccessRecording] = useState(false);
  const [proccessVoiceSearch, setProccessVoiceSearch] = useState(false);
  const [resultRecord, setResultRecord] = useState(null);
  const [resultVoice, setResultVoice] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(getDetectedLanguage());

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
  function handleSecondsLeft(seconds) {
    setInterval(function () {
      if (seconds > 0) setSecondsLeft(seconds - 1);
    }, 1000);
  }
  function handleTimeOut() {
    setTimeout(() => {
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
    }, 10000);
  }
  return (
    <>
      <div className={styles.searchBar}>
        {/* Language Selector for Voice Search */}
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className={styles.languageSelector}
          title="Select language for voice search"
        >
          {Object.entries(SPEECH_RECOGNITION_LANGUAGES).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
        {isRecording && (
          <span
            className={styles.recordingSpinner}
            onClick={() => {
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
            }}
          >
            {handleTimeOut()}
            <div className={styles.recordingSpinner}>
              <BarsScaleMiddleIcon
                width={40}
                height={60}
                fill="none"
                stroke="#ffffff"
              />
              <Spinner />
              {handleSecondsLeft(secondsLeft)}
              Please wait {secondsLeft} seconds...
            </div>
          </span>
        )}
        <TooltipComponent text="Identify song (currently works only for spotify)">
          {!isRecording && (
            <button
              onClick={() => {
                setIsRecording(true);
                setProccessRecording(true);
                handleStartRecording();
                setIsVoiceSearch(false);
                setIsMapVisible(false);
                setFormVisible(false);
              }}
              disabled={proccessRecording}
            >
              <img src="/moodiify/record_i.png" />
              {proccessRecording && (
                <div className={styles.recordingSpinner}>
                  <Spinner />
                  Proccessing...
                </div>
              )}
            </button>
          )}
        </TooltipComponent>
        {isVoiceSearch && (
          <MicrophoneAnimation setIsVoiceSearch={setIsVoiceSearch} />
        )}
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
                console.log("response: ", response);
                if (!response) return;
                setProccessVoiceSearch(false);
                setSongSuggestions(response);
                setIsVoiceSearch(false);
                setIsMapVisible(false);
                setIsRecording(false);
                setFormVisible(false);
                navigate("/home");
              }}
              disabled={proccessVoiceSearch}
            >
              <img src="/moodiify/mic_i.png" />
              {proccessVoiceSearch && (
                <div className={styles.recordingSpinner}>
                  <Spinner />
                  Proccessing...
                </div>
              )}
            </button>
          )}
        </TooltipComponent>
        <TooltipComponent text="searching song by text">
          <span>
            {formVisible && (
              <Form
                setSongSuggestions={setSongSuggestions}
                setFormVisible={setFormVisible}
                formVisible={formVisible}
              />
            )}
            <img
              src="/moodiify/chat_i.png"
              onClick={() => {
                setIsVoiceSearch(false);
                setIsRecording(false);
                setIsMapVisible(false);
                setFormVisible(!formVisible);
              }}
            />
          </span>
        </TooltipComponent>
        <TooltipComponent text="explore global songs">
          <span
            onClick={() => {
              setIsMapVisible(!isMapVisible);
              navigate("/global");
            }}
          >
            <img src="/moodiify/earth_i.png" />
          </span>
        </TooltipComponent>
      </div>
      <Toaster />
    </>
  );
}
