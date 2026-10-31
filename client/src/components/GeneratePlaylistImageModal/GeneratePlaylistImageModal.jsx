import { useState } from "react";
import propTypes from "prop-types";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { Spinner } from "../ui/spinner";
import Button from "../Button/Button";

function GeneratePlaylistImageModal({
  playlist,
  loading,
  onGenerate,
  onClose,
}) {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="modalOverlay">
      <Modal.Dialog>
        <Modal.Header closeButton onClick={onClose}>
          <Modal.Title>Generate Playlist Image</Modal.Title>
        </Modal.Header>
        <Form.Group controlId="playlist-image-prompt">
          <Form.Label>
            Generate an image for the {playlist.name} playlist
          </Form.Label>
          <Form.Control
            as="textarea"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
          />
        </Form.Group>
        <Modal.Footer>
          <div className="modalActions">
            <Button
              onClick={() => onGenerate(prompt)}
              type="submit"
              loading={loading}
            >
              Send
            </Button>
            <Button type="cancel" onClick={onClose} loading={loading}>
              Cancel
            </Button>
            {loading && <Spinner />}
          </div>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  );
}

GeneratePlaylistImageModal.propTypes = {
  playlist: propTypes.shape({
    name: propTypes.string,
  }).isRequired,
  loading: propTypes.bool.isRequired,
  onGenerate: propTypes.func.isRequired,
  onClose: propTypes.func.isRequired,
};

export default GeneratePlaylistImageModal;
