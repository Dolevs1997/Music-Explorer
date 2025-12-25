import propTypes from "prop-types";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

function MicrophoneAnimation({ setIsVoiceSearch }) {
  return (
    <div style={{ marginTop: "-10px" }} onClick={() => setIsVoiceSearch(false)}>
      <DotLottieReact
        src="https://lottie.host/7ad9e959-ae0e-4eb4-b297-670a73c752d3/68kit5xz2W.lottie"
        loop
        autoplay
        style={{ width: 80, height: 80, cursor: "pointer" }}
      />
    </div>
  );
}

MicrophoneAnimation.propTypes = {
  setIsVoiceSearch: propTypes.func.isRequired,
};

export default MicrophoneAnimation;
