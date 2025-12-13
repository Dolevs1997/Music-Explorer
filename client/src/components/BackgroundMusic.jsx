import backgroundClip from "../../src/assets/image/backgrould-clip.mp4";
function BackgroundMusic() {
  return (
    <>
      <video
        src={backgroundClip}
        alt="background clip"
        style={{
          position: "fixed",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
          top: 0,
          left: 0,
        }}
        autoPlay
        loop
        muted
      />
    </>
  );
}

export default BackgroundMusic;
