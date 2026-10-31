import propTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "../Button/Button";

function DeleteModalPlaylist({ playlist, onDelete, onClose }) {
  return (
    <div className="modalOverlay">
      <Modal.Dialog>
        <Modal.Header closeButton onClick={onClose}>
          <Modal.Title>Delete Playlist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the playlist {playlist.name}?
        </Modal.Body>
        <Modal.Footer>
          <div className="modalActions">
            <Button type="accept" onClick={onDelete}>
              Delete
            </Button>
            <Button type="cancel" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Dialog>
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
