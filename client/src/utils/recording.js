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
  userData,
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
      const res = await fetch(`/api/videoSong/recognize-audio`, {
        body: formData,
        method: "POST",
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      });

      const data = await res.json();

      if (data.error || !data.artists?.[0]?.name || !data.title) {
        console.error("Song recognition failed:", data.error || data);
        setResultRecord(data);
        return;
      }

      const songRecognized = `${data.artists[0].name} - ${data.title}`;

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
