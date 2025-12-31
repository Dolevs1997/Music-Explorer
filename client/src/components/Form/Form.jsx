/* eslint-disable react/prop-types */
import styles from "./Form.module.css";
import { useState } from "react";
import { getSongSuggestions } from "../../services/OpenAI_service";
import { useNavigate } from "react-router";
import { Spinner } from "../../components/ui/spinner";

function Form({ setSongSuggestions, setFormVisible, formVisible }) {
  const [text, setText] = useState("I want you to generate ");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  console.log("Form Component");
  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    const text = document.getElementById("text").value;
    const response = await getSongSuggestions(text);
    setSongSuggestions(response);
    setFormVisible(!formVisible);
    setIsLoading(false);
    setText("");
    if (response.length === 0) {
      alert("No song suggestions found. Please try again.");
    } else {
      navigate("/home/songSuggestions");
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
    </form>
  );
}

export default Form;
