import propTypes from "prop-types";
import { useState, useContext } from "react";
import { deleteSongsHistory } from "../../../utils/userActivity";
import UserContext from "../../../Contexts/UserContext";
import toast from "react-hot-toast";

function Privacy({ setSettingsView }) {
  const [deleteSongsModal, setDeleteSongsModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user, setUser } = useContext(UserContext);

  async function handleDeleteSongsHistory() {
    setDeleteLoading(true);
    try {
      await deleteSongsHistory(user);
      const updatedPlaylists = user.playlists.filter((p) => p.songs);
      const updatedUser = { ...user, playlists: updatedPlaylists };
      setUser(updatedUser);
    } catch (error) {
      console.error("Error deleting history songs: ", error.message);
      toast.error("Error with deleting user history songs");
    } finally {
      setDeleteLoading(false);
      setDeleteSongsModal(false);
    }
  }
  return (
    <div>
      <button className="backBtn" onClick={() => setSettingsView("main")}>
        ‹ Back
      </button>
      <h2 className="panelTitle">Privacy</h2>
      <section className="settingsSection">
        <h3
          className="settingsSectionTitle"
          onClick={() => setDeleteSongsModal((prev) => !prev)}
        >
          Clear All Songs History
        </h3>
      </section>
      {deleteSongsModal && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h3 className="modalTitle">Delete All History Songs</h3>
            <p className="modalText">
              Are you sure? This will permanently delete your history songs
            </p>
            <div className="modalActions">
              <button
                className="settingsBtn"
                onClick={() => setDeleteSongsModal(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="settingsBtnDanger"
                onClick={handleDeleteSongsHistory}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Privacy.propTypes = {
  setSettingsView: propTypes.func,
};

export default Privacy;
