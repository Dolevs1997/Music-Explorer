import styles from "./Search.module.css";
import {
  handleStartRecording,
  handleStopRecording,
} from "../../utils/recording";
import { handleVoiceSearch } from "../../utils/voice_search_song";
import { useNavigate } from "react-router";
import { useContext } from "react";
import { SearchContext } from "../../Contexts/SearchContext";
import { BarsScaleMiddleIcon } from "../../components/icons/svg-spinners-bars-scale-middle";
import MicrophoneAnimation from "../../components/icons/MicrophoneAnimation";
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
  return (
    <div className={styles.searchBar}>
      {isRecording && (
        <span
          className={styles.recordingSpinner}
          onClick={() => {
            setIsRecording(!isRecording);
            if (isRecording) {
              handleStopRecording(userData, setSongSuggestions);
              setIsVoiceSearch(false);
              setIsMapVisible(false);
              setFormVisible(false);
              navigate("/home");
            } else {
              handleStartRecording();
            }
          }}
        >
          <BarsScaleMiddleIcon
            width={40}
            height={60}
            fill="none"
            stroke="#ffffff"
          />
        </span>
      )}
      {!isRecording && (
        <span
          onClick={() => {
            setIsRecording(!isRecording);
            if (isRecording) {
              handleStopRecording(userData, setSongSuggestions);
              setIsVoiceSearch(false);
              setIsMapVisible(false);
              setFormVisible(false);
              navigate("/home");
            } else {
              handleStartRecording();
            }
          }}
        >
          <img src="/moodiify/record_i.png" />
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
