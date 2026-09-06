import axios from "axios";

let mediaRecorder;
let audioChunks = [];
export async function handleStartRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioChunks = [];
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.start();
}
export async function handleStopRecording(
  setSongSuggestions,
  setProccessRecording,
  setResultRecord,
) {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    setProccessRecording(false);
    return;
  }

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    audioChunks = [];
    const formData = new FormData();
    formData.append("audioFile", audioBlob, "sample.wav");
    try {
      const res = await axios.post(`/api/videoSong/recognize-audio`, formData);

      console.log("Recognition response:", res);
      const data = await res.data;

      if (data.error || !data.artists?.[0]?.name || !data.title) {
        console.error("Song recognition failed:", data.error || data);
        setResultRecord(data);
        return;
      }

      // const songRecognized = `${data.artists[0].name} - ${data.title}`;
      const songRecognized = { title: data.title, artist: data.artists[0].name };
      setSongSuggestions([songRecognized]);
      setResultRecord(data);
    } catch (error) {
      console.error("Song recognition request failed:", error);
      setResultRecord({ error: "Song recognition failed" });
    } finally {
      setProccessRecording(false);
      mediaRecorder = undefined;
    }
  };

  mediaRecorder.stream?.getTracks().forEach((track) => track.stop());
  mediaRecorder.stop();
}
