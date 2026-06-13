import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import styles from "./AppIntro.module.css";

function AppIntro() {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((error) => {
        console.error("Auto-play failed:", error);
        // Fallback to login if video fails
        navigate("/login");
      });

      const handleVideoEnd = () => {
        navigate("/login");
      };

      video.addEventListener("ended", handleVideoEnd);
      return () => video.removeEventListener("ended", handleVideoEnd);
    }
  }, [navigate]);

  const handleSkip = () => {
    navigate("/login");
  };

  return (
    <div className={styles.introContainer}>
      <video ref={videoRef} className={styles.video} controls="false" autoPlay>
        <source src="/music-explorer/app-intro.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <button className={styles.skipButton} onClick={handleSkip}>
        Skip Intro
      </button>
    </div>
  );
}

export default AppIntro;
