import styles from "./Form.module.css";
import { useState } from "react";
import { getSongSuggestions } from "../../services/OpenAI_service";
import { useNavigate } from "react-router";
import { Spinner } from "../../components/ui/spinner";
import propTypes from "prop-types";
import { toast } from "react-hot-toast";
import { deduplicateSongs } from "../../utils/deduplicateSongs";
import Button from "../Button/Button";
import { fetchSongsYT } from "../../services/YouTube_service";

function Form({ setSongSuggestions, setFormVisible, formVisible }) {
  const [text, setText] = useState("");
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
      const response = await getSongSuggestions(payload);
      const uniqueSongs = deduplicateSongs(response);
      const recommendations = await fetchSongsYT(
        uniqueSongs,
        user.country?.shortName || "US",
      );
      console.log("recommendations: ", recommendations);
      setSongSuggestions(recommendations);
      setFormVisible(!formVisible);
      setText("");
      if (recommendations.length === 0) {
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
      <label htmlFor="text">What would you like to listen?</label>

      <textarea
        id="text"
        placeholder="Describe your tracks"
        value={text}
        onChange={handleChange}
      />
      <div className="modalActions">
        <Button
          type="submit"
          onClick={(e) => handleSubmit(e)}
          loading={isLoading}
        >
          Send
        </Button>
        <Button
          type="cancel"
          onClick={() => setFormVisible((prev) => !prev)}
          loading={isLoading}
        >
          Cancel
        </Button>
      </div>
      {isLoading && (
        <>
          <Spinner />
          <p>Getting song suggestions...</p>
        </>
      )}
    </form>
  );
}

Form.propTypes = {
  setSongSuggestions: propTypes.func.isRequired,
  setFormVisible: propTypes.func.isRequired,
  formVisible: propTypes.bool.isRequired,
};

export default Form;
