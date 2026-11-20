import propTypes from "prop-types";
import { useState, useContext } from "react";
import { deleteSongsHistory } from "../../../utils/userActivity";
import UserContext from "../../../Contexts/UserContext";
import toast from "react-hot-toast";
import Button from "../../Button/Button";
import { Card } from "@heroui/react";
import { Lock } from "lucide-react";

function Privacy() {
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
    <Card className="card">
      <div style={{ display: "flex" }}>
        <div className="header-card">
          <div className="icon-card">
            <Lock />
          </div>
          <div className="description">
            <Card.Title className="settingsSectionTitle">Privacy</Card.Title>
            <Card.Description className="settingsCardSub">
              Remove every song from your listening history
            </Card.Description>
          </div>
        </div>
        <div className="buttonActions">
          <Button
            className="clear-btn"
            onClick={() => setDeleteSongsModal((prev) => !prev)}
          >
            Clear History
          </Button>
        </div>
        {deleteSongsModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Delete All History Songs</h3>

              <Card.Description className="modal-text">
                This will permanently delete your history songs
              </Card.Description>
              <div className="modalActions">
                <Button
                  type="accept"
                  onClick={handleDeleteSongsHistory}
                  loading={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Yes, Delete"}
                </Button>
                <Button
                  type="cancel"
                  onClick={() => setDeleteSongsModal(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

Privacy.propTypes = {
  setSettingsView: propTypes.func,
};

export default Privacy;
