import styles from "./Form.module.css";
import { useState } from "react";
import { getSongSuggestions } from "../../services/OpenAI_service";
import { useNavigate } from "react-router";
import { Spinner } from "../../components/ui/spinner";
import propTypes from "prop-types";
import { Toaster, toast } from "react-hot-toast";
import { deduplicateSongs } from "../../utils/deduplicateSongs";

function Form({ setSongSuggestions, setFormVisible, formVisible }) {
  const [text, setText] = useState("I want you to generate ");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    toast.error("Please login to continue.");
    navigate("/login");
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    const text = document.getElementById("text").value;
    const payload = {
      content: text,
      role: "user",
    };
    try {
      const response = await getSongSuggestions(payload, user.token);
      const uniqueSongs = deduplicateSongs(response);
      setSongSuggestions(uniqueSongs);

      setFormVisible(!formVisible);
      setText("");
      if (uniqueSongs.length === 0) {
        alert("No song suggestions found. Please try again.");
      } else {
        navigate("/home/songSuggestions");
      }
    } catch (err) {
      console.error("error fetching song suggestions: ", err);
      toast.error("Error getting song suggestions...");
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(e) {
    setText(e.target.value);
  }

  return (
    <form className={formVisible ? styles.formVisible : ""}>
      <label htmlFor="text">What is your mood today?</label>

      <textarea id="text" value={text} onChange={handleChange} />

      <button type="submit" onClick={(e) => handleSubmit(e)}>
        Send
      </button>
      {isLoading && (
        <>
          <Spinner />
          <p>Getting song suggestions...</p>
        </>
      )}
      <Toaster />
    </form>
  );
}

Form.propTypes = {
  setSongSuggestions: propTypes.func.isRequired,
  setFormVisible: propTypes.func.isRequired,
  formVisible: propTypes.bool.isRequired,
};

export default Form;
