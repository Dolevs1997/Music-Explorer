import styles from "./Search.module.css";
import {
  handleStartRecording,
  handleStopRecording,
} from "../../utils/recording";
import { handleVoiceSearch } from "../../utils/voice_search_song";
import { useNavigate } from "react-router";
import { useContext, useState } from "react";
import { SearchContext } from "../../Contexts/SearchContext";
import { BarsScaleMiddleIcon } from "../../components/icons/svg-spinners-bars-scale-middle";
import MicrophoneAnimation from "../../components/icons/MicrophoneAnimation";
import { Spinner } from "../../components/ui/spinner";

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
  function handleSecondsLeft(seconds) {
    setInterval(function () {
      if (seconds > 0) setSecondsLeft(seconds - 1);
    }, 1000);
  }
  function handleTimeOut() {
    setTimeout(() => {
      setIsRecording(false);
      handleStopRecording(userData, setSongSuggestions, setProccessRecording);
      setIsVoiceSearch(false);
      setIsMapVisible(false);
      setFormVisible(false);
      navigate("/home");
    }, 10000);
  }
  return (
    <div className={styles.searchBar}>
      {isRecording && (
        <span
          className={styles.recordingSpinner}
          onClick={() => {
            setIsRecording(false);
            handleStopRecording(
              userData,
              setSongSuggestions,
              setProccessRecording
            );
            setIsVoiceSearch(false);
            setIsMapVisible(false);
            setFormVisible(false);
            navigate("/home");
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

      {!isRecording && (
        <span
          onClick={() => {
            setIsRecording(true);
            setProccessRecording(true);

            handleStartRecording();
            setIsVoiceSearch(false);
            setIsMapVisible(false);
            setFormVisible(false);
            navigate("/home");
          }}
        >
          <img src="/moodiify/record_i.png" />
          {proccessRecording && (
            <div className={styles.recordingSpinner}>
              <Spinner />
              Proccessing...
            </div>
          )}
        </span>
      )}
      {isVoiceSearch && (
        <MicrophoneAnimation setIsVoiceSearch={setIsVoiceSearch} />
      )}
      {!isVoiceSearch && (
        <span
          onClick={async () => {
            setIsVoiceSearch(true);
            const response = await handleVoiceSearch(userData);
            if (!response) return;
            console.log("response from voice search:", response);
            setSongSuggestions(response);
            setIsVoiceSearch(false);
            setIsMapVisible(false);
            setIsRecording(false);
            setFormVisible(false);
            navigate("/home");
          }}
        >
          <img src="/moodiify/mic_i.png" />
        </span>
      )}
      <span
        onClick={() => {
          setFormVisible(!formVisible);
          setIsVoiceSearch(false);
          setIsRecording(false);
          setIsMapVisible(false);
          navigate("/home");
        }}
      >
        <img src="/moodiify/chat_i.png" />
      </span>
      <span
        onClick={() => {
          setIsMapVisible(!isMapVisible);
          navigate("/global");
        }}
      >
        <img src="/moodiify/earth_i.png" />
      </span>
    </div>
  );
}
