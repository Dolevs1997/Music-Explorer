import { useState } from "react";
import propTypes from "prop-types";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "../Button/Button";

function UploadPlaylistImageModal({ playlist, onUpload, onClose }) {
  const [file, setFile] = useState(null);

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
    } else {
      setFile(null);
      alert("Please select a valid image file.");
    }
  }

  function handleUpload() {
    if (!file) {
      alert("No file selected for upload.");
      return;
    }
    onUpload(file);
  }

  return (
    <div className="modalOverlay">
      <Modal.Dialog>
        <Modal.Header closeButton onClick={onClose}>
          <Modal.Title>Edit Playlist picture</Modal.Title>
        </Modal.Header>
        <Form.Group controlId="playlist-image-upload">
          <Form.Label>Choose an image for {playlist.name}</Form.Label>
          <Form.Control
            type="file"
            onChange={handleFileChange}
            accept="image/*"
          />
        </Form.Group>
        <Modal.Footer>
          <div className="modalActions">
            <Button onClick={handleUpload} type="submit">
              Save changes
            </Button>
            <Button onClick={onClose} type="close">
              Close
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  );
}

UploadPlaylistImageModal.propTypes = {
  playlist: propTypes.shape({
    name: propTypes.string,
  }).isRequired,
  onUpload: propTypes.func.isRequired,
  onClose: propTypes.func.isRequired,
};

export default UploadPlaylistImageModal;
