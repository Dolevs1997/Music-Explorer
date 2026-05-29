let mediaRecorder;
let audioChunks = [];
export async function handleStartRecording() {
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
  setResultRecord,
) {
  audioChunks = [];
  let songRecognized = "";

  mediaRecorder.stop();
  mediaRecorder.onstop = async () => {
    // setIsRecording(false);
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const formData = new FormData();
    formData.append("audioFile", audioBlob, "sample.wav");
    const res = await fetch(
      `http://${import.meta.env.VITE_SERVER_URL}/moodiify/videoSong/recognize-audio`,
      {
        body: formData,
        method: "POST",
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      },
    );

    const data = await res.json();

    if (data.error) {
      console.error("Error:", data.error);
      setProccessRecording(false);
      setResultRecord(data);
      return;
    }

    songRecognized = data.artists[0].name + " - " + data.title;

    setSongSuggestions([songRecognized]);
    setProccessRecording(false);
    setResultRecord(data);
    return songRecognized;
  };
}
