import propTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "../Button/Button";
import Form from "react-bootstrap/Form";

function EditPlaylistModal({ playlistName, setPlaylistName, onSave, onClose }) {
  console.log("playlistName: ", playlistName);
  return (
    <div className="modalOverlay">
      <Modal.Dialog>
        <Form.Group controlId="exampleForm.ControlTextarea1">
          <Form.Label>Edit Playlist Name</Form.Label>
          <Form.Control
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
          />
        </Form.Group>
        <Modal.Footer>
          <div className="modalActions">
            <Button onClick={onSave} type="submit">
              Send
            </Button>
            <Button onClick={onClose} type="cancel">
              Cancel
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  );
}

EditPlaylistModal.propTypes = {
  playlistName: propTypes.string.isRequired,
  setPlaylistName: propTypes.func.isRequired,
  onSave: propTypes.func.isRequired,
  onClose: propTypes.func.isRequired,
};

export default EditPlaylistModal;
