import styles from "./DeleteModalPlaylist.module.css";
import propTypes from "prop-types";
import { AlertTriangle, X } from "lucide-react";
import Button from "../Button/Button";

function DeleteModalPlaylist({ playlist, onDelete, onClose }) {
  return (
    <div className={styles.modalContainer}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-playlist-title"
        aria-describedby="delete-playlist-description"
      >
        <button
          className={styles.closeModal}
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X aria-hidden="true" />
        </button>

        <div className={styles.warningIcon} aria-hidden="true">
          <AlertTriangle />
        </div>
        <h2 id="delete-playlist-title" className={styles.titleModal}>
          Delete playlist?
        </h2>
        <p id="delete-playlist-description" className={styles.description}>
          Are you sure you want to delete{" "}
          <span className={styles.playlistName}>“{playlist.name}”</span>? This
          action cannot be undone.
        </p>

        <div className={styles.modalActions}>
          <Button type="cancel" onClick={onClose}>
            Cancel
          </Button>
          <Button type="accept" onClick={onDelete}>
            Delete playlist
          </Button>
        </div>
      </section>
    </div>
  );
}

DeleteModalPlaylist.propTypes = {
  playlist: propTypes.shape({
    name: propTypes.string,
  }).isRequired,
  onDelete: propTypes.func.isRequired,
  onClose: propTypes.func.isRequired,
};

export default DeleteModalPlaylist;
