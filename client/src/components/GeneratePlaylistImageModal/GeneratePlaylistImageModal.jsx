import { useState } from "react";
import propTypes from "prop-types";
import { coverUrl, previewImageGeneration } from "../../utils/playlist.js";
import { Spinner } from "../ui/spinner";
import Button from "../Button/Button";
import styles from "./GeneratePlaylistImageModal.module.css";
import toast from "react-hot-toast";
import { X } from "lucide-react";
function GeneratePlaylistImageModal({
  playlist,
  loading,
  setLoading,
  onClose,
  onUpdate,
  generatedImage,
  setGeneratedImage,
}) {
  const [prompt, setPrompt] = useState("");

  async function handleGenerateImage(prompt, playlist) {
    if (!playlist) return;
    setLoading(true);
    try {
      const response = await previewImageGeneration(playlist, prompt);
      console.log("response: ", response);
      if (response.status == 200) {
        toast.success(response.data.message);
        setGeneratedImage(response.data.result.imageUrl);
      } else {
        toast.error(response.data.message);
      }
      // const response = await updatePlaylist(selectedPlaylist, { prompt });
      // if (response.status == 200) {
      //   updateUserPlaylist(response.data.playlist);
      //   toast.success(response.data.message);
      // } else toast.error(response.data.message);
      // setActiveModal(null);
      // setSelectedPlaylist(null);
    } catch (error) {
      console.error("Error generating playlist image:", error);
      toast.error("Image generation failed.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className={styles.modalContainer}>
      <div className={styles.generateImageModal}>
        <X className={styles.closeModal} onClick={onClose} />
        <div>
          <div className={styles.playlistImage}>
            {loading && (
              <div className={styles.load}>
                <Spinner fontSize="40px" color="#c084fc" />
                <h3>Creating your cover</h3>
                <span>this may takes a few seconds</span>
              </div>
            )}
            {!loading &&
              (generatedImage ? (
                <img src={generatedImage} />
              ) : (
                <img src={coverUrl(playlist?.imageUrl)} />
              ))}

            <span>Cover for</span>
            <div className={styles.playlistImageDetails}>
              <h3>{playlist.name}</h3>
            </div>
          </div>
          <div className={styles.playlistGenerationContainer}>
            <span className={styles.title}>AI COVER</span>
            <h2>Generate a cover</h2>
            <span className={styles.description}>
              Turn your playlist&apos;s vibe into custom cover art.
            </span>
            <label aria-label="describe cover" className={styles.description}>
              Describe the cover
            </label>
            <div>
              <textarea
                className={styles.textArea}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
            </div>
            <button
              className={styles.generationBtn}
              onClick={() => handleGenerateImage(prompt, playlist)}
            >
              Generate
            </button>
            <div className={styles.buttonActions}>
              <Button type="cancel" onClick={onClose} loading={loading}>
                Cancel
              </Button>
              <Button type="submit" loading={loading} onClick={onUpdate}>
                Use this cover
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

GeneratePlaylistImageModal.propTypes = {
  playlist: propTypes.shape({
    _id: propTypes.string,
    name: propTypes.string,
    imageUrl: propTypes.string,
  }).isRequired,
  loading: propTypes.bool.isRequired,
  setLoading: propTypes.func,
  onClose: propTypes.func.isRequired,
  onUpdate: propTypes.func,
  generatedImage: propTypes.string,
  setGeneratedImage: propTypes.func,
};

export default GeneratePlaylistImageModal;
