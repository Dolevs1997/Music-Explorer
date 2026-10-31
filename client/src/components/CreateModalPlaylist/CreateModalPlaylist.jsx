import styles from "./CreateModalPlaylist.module.css";
import propTypes from "prop-types";

function CreateModalPlaylist({
  playlistName,
  setPlaylistName,
  setShowModal,
  onClick,
}) {
  return (
    <div
      className={styles.modalOverlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setShowModal(false);
      }}
    >
      <section
        className={styles.playlistDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-playlist-title"
      >
        <div className={styles.dialogArtwork} aria-hidden>
          ♪
        </div>
        <span className={styles.menuEyebrow}>MAKE IT YOURS</span>
        <h2 id="create-playlist-title" className={styles.dialogTitle}>
          Create a playlist
        </h2>
        <p className={styles.dialogDescription}>
          Give your new collection a name. We’ll add this song to it.
        </p>
        <form
          className={styles.playlistForm}
          onSubmit={(event) => {
            event.preventDefault();
            return onClick?.();
          }}
        >
          <label className={styles.playlistInputLabel} htmlFor="playlist-name">
            Playlist name
          </label>
          <input
            id="playlist-name"
            className={styles.playlistInput}
            type="text"
            placeholder="e.g. Late night discoveries"
            value={playlistName}
            onChange={(event) => setPlaylistName(event.target.value)}
            autoFocus
          />
          <div className={styles.dialogActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className={styles.savePlaylistButton}>
              Create playlist
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

CreateModalPlaylist.propTypes = {
  playlistName: propTypes.string,
  setPlaylistName: propTypes.func,
  setShowModal: propTypes.func,
  onClick: propTypes.func,
};

export default CreateModalPlaylist;
