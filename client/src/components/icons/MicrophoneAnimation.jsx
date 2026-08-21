import propTypes from "prop-types";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import styles from "./MicrophoneAnimation.module.css";

function MicrophoneAnimation({ setIsVoiceSearch, mobileMenuOpen }) {
  return (
    <div
      className={`${styles.animation} ${mobileMenuOpen ? styles.mobile : ""}`}
      onClick={() => setIsVoiceSearch(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          setIsVoiceSearch(false);
        }
      }}
    >
      <DotLottieReact
        src="https://lottie.host/7ad9e959-ae0e-4eb4-b297-670a73c752d3/68kit5xz2W.lottie"
        loop
        autoplay
      />
      <span>Speak Now...</span>
    </div>
  );
}

MicrophoneAnimation.propTypes = {
  setIsVoiceSearch: propTypes.func.isRequired,
  mobileMenuOpen: propTypes.bool,
};

export default MicrophoneAnimation;
