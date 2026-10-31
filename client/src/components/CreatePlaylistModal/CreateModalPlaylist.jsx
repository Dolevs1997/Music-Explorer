import Button from "../Button/Button";
import propTypes from "prop-types";
import { createPlaylist } from "../../utils/playlist.js";
import UserContext from "../../Contexts/UserContext.jsx";
import { useContext } from "react";
import { toast } from "react-hot-toast";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

function CreateModalPlaylist({
  playlistName,
  setPlaylistName,
  setShowCreateModal,
}) {
  const { user, setUser } = useContext(UserContext);
  console.log("user: ", user);
  async function handleAddPlaylist() {
    setShowCreateModal(false);
    try {
      const result = await createPlaylist(playlistName, user);
      console.log("Result: ", result);
      if (result.status === 200) {
        const updatedUser = {
          ...user,
          playlists: [...user.playlists, result.data.playlist],
        };
        setUser(updatedUser);
        toast.success(`${result.data.message}`);
      } else {
        toast.error(`${result.data.message}`);
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error("Failed to create playlist. Please try again.");
    }
  }
  return (
    <div className="modalOverlay">
      <Modal.Dialog>
        <Modal.Header closeButton onClick={() => setShowCreateModal(false)}>
          <Modal.Title>Create Playlist</Modal.Title>
        </Modal.Header>
        <Form
          onSubmit={(event) => {
            event.preventDefault();
            handleAddPlaylist();
          }}
        >
          <Form.Group controlId="create-playlist-name">
            <Form.Label>Playlist Name:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter playlist name"
              value={playlistName}
              onChange={(event) => setPlaylistName(event.target.value)}
            />
          </Form.Group>
          <Modal.Footer>
            <div className="modalActions">
              <Button type="submit">Save changes</Button>
              <Button onClick={() => setShowCreateModal(false)} type="cancel">
                Close
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal.Dialog>
    </div>
  );
}

CreateModalPlaylist.propTypes = {
  playlistName: propTypes.string,
  setPlaylistName: propTypes.func,
  setShowCreateModal: propTypes.func,
};

export default CreateModalPlaylist;
