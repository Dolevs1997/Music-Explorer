import styles from "./UploadPlaylistImageModal.module.css";
import { useRef, useState } from "react";
import propTypes from "prop-types";
import Button from "../Button/Button";
import { X } from "lucide-react";
import { previewImageUpload } from "../../utils/playlist";
import { FileUpload } from "@/components/application/file-upload/file-upload-base";

function UploadPlaylistImageModal({
  onUpload,
  onClose,
  loading,
  setLoading,
  previewImage,
  setPreviewImage,
}) {
  const [file, setFile] = useState(null);

  const [progress, setProgress] = useState(0);
  const uploadId = useRef(0);
  function handleClose() {
    setFile(null);
    setProgress(0);
    setPreviewImage(() => null);
    setLoading(false);
    onClose();
  }

  const handleDropFiles = async (files) => {
    setLoading(true);
    const selectedFile = files[0];
    if (!selectedFile) return;
    const currentUploadId = ++uploadId.current;
    setFile(selectedFile);
    const formData = new FormData();
    formData.append("image", selectedFile);
    if (currentUploadId !== uploadId.current) return;
    const response = await previewImageUpload(formData, (event) => {
      if (currentUploadId === uploadId.current && event.total) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      } else {
        return;
      }
    });

    setLoading(false);
    setProgress(100);
    setPreviewImage(response.data.imageUrl);
  };

  const handleDeleteFile = () => {
    ++uploadId.current;
    setFile(null);
    setProgress(0);
    setPreviewImage(() => null);
    setLoading(false);
  };

  return (
    <div className={styles.modalContainer}>
      <section
        className={styles.modal}
        role="img"
        aria-description="changing playlist image"
      >
        <button className={styles.closeModal}>
          <X onClick={handleClose} />
        </button>

        <div className={styles.playlistImage}>
          {previewImage && !loading && (
            <>
              <img src={previewImage} />
            </>
          )}
          {!previewImage && !loading && (
            <>
              <h1 className={styles.title}>Edit playlist cover</h1>
              <span className={styles.description}>
                Choose an image that captures the mood of your playlist.
              </span>
            </>
          )}
          {!previewImage && loading && (
            <div className={styles.imageBox}>
              {loading && (
                <FileUpload.List>
                  <FileUpload.ListItemProgressBar
                    className={styles.uploadedFile}
                    name={file.name}
                    size={file.size}
                    progress={progress}
                    onDelete={handleDeleteFile}
                  />
                </FileUpload.List>
              )}
            </div>
          )}
        </div>
        <div className={styles.form}>
          <FileUpload.DropZone
            className={styles.upload}
            accept="image/*"
            hint="Please upload PNG or JPEG images only."
            onDropFiles={handleDropFiles}
            allowsMultiple={false}
          />

          {/* <label>Choose an image for {playlist.name}</label>
          <input type="file" onChange={handleFileChange} accept="image/*" /> */}
          <footer className={styles.buttons}>
            <Button onClick={handleClose} type="close">
              Close
            </Button>
            <Button onClick={onUpload} type="submit">
              Save changes
            </Button>
          </footer>
        </div>
      </section>
    </div>
  );
}

UploadPlaylistImageModal.propTypes = {
  playlist: propTypes.shape({
    name: propTypes.string,
  }).isRequired,
  onUpload: propTypes.func.isRequired,
  onClose: propTypes.func.isRequired,
  loading: propTypes.bool.isRequired,
  setLoading: propTypes.func,
  previewImage: propTypes.string.isRequired,
  setPreviewImage: propTypes.func.isRequired,
};

export default UploadPlaylistImageModal;
