import styles from "./Search.module.css";
import {
  handleStartRecording,
  handleStopRecording,
} from "../../utils/recording";
import { handleVoiceSearch } from "../../utils/voice_search_song";
import { useNavigate } from "react-router";
import { useContext, useState, useEffect } from "react";
import { SearchContext } from "../../Contexts/SearchContext";
import { BarsScaleMiddleIcon } from "../../components/icons/svg-spinners-bars-scale-middle";
import MicrophoneAnimation from "../../components/icons/MicrophoneAnimation";
import { Spinner } from "../../components/ui/spinner";
import Form from "../Form/Form";
import { Toaster, toast } from "react-hot-toast";

export default function Search() {
  const {
    formVisible,
    setFormVisible,
    isMapVisible,
    setIsMapVisible,
    isRecording,
    setIsRecording,
    userData,
    setSongSuggestions,
    setIsVoiceSearch,
    isVoiceSearch,
  } = useContext(SearchContext);
  const navigate = useNavigate();
  // const userData = JSON.parse(localStorage.getItem("user"));
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [proccessRecording, setProccessRecording] = useState(false);
  const [proccessVoiceSearch, setProccessVoiceSearch] = useState(false);
  const [resultRecord, setResultRecord] = useState(null);
  const [resultVoice, setResultVoice] = useState(null);
  // console.log("secondsLeft:", secondsLeft);
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

        {!isRecording && (
          <span
            onClick={() => {
              setIsRecording(true);
              setProccessRecording(true);
              handleStartRecording();
              setIsVoiceSearch(false);
              setIsMapVisible(false);
              setFormVisible(false);
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
              setProccessVoiceSearch(true);
              const response = await handleVoiceSearch(
                userData,
                10000,
                setResultVoice,
              );
              if (!response) return;
              console.log("response from voice search:", response);
              setProccessVoiceSearch(false);
              setSongSuggestions(response);
              setIsVoiceSearch(false);
              setIsMapVisible(false);
              setIsRecording(false);
              setFormVisible(false);
              navigate("/home");
            }}
          >
            <img src="/moodiify/mic_i.png" />
            {proccessVoiceSearch && (
              <div className={styles.recordingSpinner}>
                <Spinner />
                Proccessing...
              </div>
            )}
          </span>
        )}
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
        <span
          onClick={() => {
            setIsMapVisible(!isMapVisible);
            navigate("/global");
          }}
        >
          <img src="/moodiify/earth_i.png" />
        </span>
      </div>
      <Toaster />
    </>
  );
}
