let mediaRecorder;
let audioChunks = [];
export async function handleStartRecording() {
  console.log("Recording started");

  // event.preventDefault();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.start();
}
export async function handleStopRecording(
  userData,
  setSongSuggestions,
  setProccessRecording,
  setResultRecord
) {
  audioChunks = [];
  let songRecognized = "";
  console.log("Stopping recording...");

  mediaRecorder.stop();
  mediaRecorder.onstop = async () => {
    // setIsRecording(false);
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const formData = new FormData();
    formData.append("audioFile", audioBlob, "sample.wav");
    console.log("Audio blob created:", audioBlob);
    console.log("FormData prepared:", formData.file);
    const res = await fetch(
      `http://${
        import.meta.env.VITE_SERVER_URL
      }/moodiify/videoSong/recognize-audio`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
        body: formData,
      }
    );

    const data = await res.json();
    console.log("Response from server:", data);
    console.log(data);

    if (data.error) {
      console.error("Error:", data.error);
      setProccessRecording(false);
      setResultRecord(data);
      return;
    }

    songRecognized = data.artists[0].name + " - " + data.title;
    console.log("Song recognized:", songRecognized);
    setSongSuggestions([songRecognized]);
    setProccessRecording(false);
    setResultRecord(data);
    return songRecognized;
  };
}
