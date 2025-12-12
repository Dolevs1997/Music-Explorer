import axios from "axios";
function voiceSearchSong() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const SpeechGrammarList =
    window.SpeechGrammarList || window.webkitSpeechGrammarList;

  const recognition = new SpeechRecognition();
  const speechRecognitionList = new SpeechGrammarList();

  recognition.grammars = speechRecognitionList;
  // Allow longer sessions and multiple phrases
  recognition.continuous = true;
  // Get partial (interim) results while speaking
  recognition.interimResults = true;
  recognition.lang = "en-US";
  recognition.maxAlternatives = 1;
  recognition.start();
  return recognition;
}

// timeoutMs controls how long to listen before processing
async function handleVoiceSearch(userData, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    if (!userData || !userData.token) {
      console.error("User data or token is missing");
      reject("User data or token is missing");
      return;
    }
    console.log("Voice search activated");
    console.log("userData in voice search:", userData);
    const recognition = voiceSearchSong();

    let finalTranscript = "";

    // Collect final results across the session
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript +=
            (finalTranscript ? " " : "") + result[0].transcript;
          timeoutMs -= 1000;
        }
      }
    };

    const stopTimer = setTimeout(() => {
      try {
        recognition.stop();
      } catch (e) {
        // noop
      }
    }, timeoutMs);

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      clearTimeout(stopTimer);
      try {
        recognition.stop();
      } catch (e) {}
      reject(event.error);
    };

    recognition.onend = async () => {
      clearTimeout(stopTimer);
      console.log("Speech recognition ended");
      const transcript = finalTranscript.trim();
      if (!transcript) {
        reject("No speech detected or transcript empty");
        return;
      }
      console.log("Recognized text:", transcript);
      const payload = {
        text: transcript,
        role: "user",
      };

      try {
        const response = await axios.post(
          `http://${import.meta.env.VITE_SERVER_URL}/api/openai`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",

              Authorization: `Bearer ${userData.token}`,
            },
          }
        );
        console.log("response: \n", response.data);
        resolve(response.data);
      } catch (error) {
        console.error("Error fetching song suggestions:", error);
        reject(error);
      }
    };
  });
}

export { handleVoiceSearch };
