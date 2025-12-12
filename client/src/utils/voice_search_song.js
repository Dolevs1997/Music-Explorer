import axios from "axios";

function voiceSearchSong() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const SpeechGrammarList =
    window.SpeechGrammarList || window.webkitSpeechGrammarList;

  const recognition = new SpeechRecognition();
  const speechRecognitionList = new SpeechGrammarList();

  recognition.grammars = speechRecognitionList;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";
  recognition.maxAlternatives = 1;
  recognition.start();

  return recognition;
}

async function handleVoiceSearch(userData) {
  return new Promise((resolve, reject) => {
    if (!userData || !userData.token) {
      console.error("User data or token is missing");
      reject("User data or token is missing");
      return;
    }

    console.log("Voice search activated");
    // console.log("userData in voice search:", userData);
    const recognition = voiceSearchSong();

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
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
        // console.log("response: \n", response.data);
        resolve(response.data);
      } catch (error) {
        console.error("Error fetching song suggestions:", error);
        reject(error);
      } finally {
        recognition.stop();
      }
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      recognition.stop();
      reject(event.error);
    };
    recognition.onend = () => {
      console.log("Speech recognition ended");
    };
  });
}

export { handleVoiceSearch };
