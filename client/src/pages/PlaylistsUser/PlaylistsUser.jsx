import Logo from "../../components/Logo/Logo.jsx";
import Search from "../../components/Search/Search.jsx";
import NavBar from "../../components/NavBar/NavBar.jsx";
import { useNavigate } from "react-router";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Spinner } from "../../components/ui/spinner";

import Button from "../../components/Button/Button.jsx";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { updatePlaylist } from "../../utils/playlist.js";
import { useState, useContext } from "react";
import { toast } from "react-hot-toast";
import { removePlaylist, createPlaylist } from "../../utils/playlist.js";
import UserContext from "../../Contexts/UserContext.jsx";
import styles from "./PlaylistsUser.module.css";

function PlaylistsUser() {
  const [modalOverlay, setModalOverlay] = useState(false);
  const [file, setFile] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [playlistMenu, setPlaylistMenu] = useState(null);

  async function handleAddPlaylist() {
    setShowCreateModal(false);
    const result = await createPlaylist(playlistName, user);
    if (result.status == 200) {
      const updatedUser = {
        ...user,
        playlists: [...user.playlists, result.data.playlist],
      };
      setUser(updatedUser);

      toast.success(`${result.data.message}`);
    } else toast.error(`${result.data.message}`);
  }

  async function handleRemovePlaylist(playlistId) {
    try {
      await removePlaylist(playlistId, user);

      const updatedPlaylists = user.playlists.filter(
        (p) => p.id !== playlistId && p._id !== playlistId,
      );
      const updatedUser = { ...user, playlists: updatedPlaylists };
      setUser(updatedUser);
      toast.success("Playlist deleted successfully");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast.error("Failed to delete playlist");
    }
  }
  async function handleEditPlaylist() {
    if (!selectedPlaylist) return;
    try {
      const updatedPlaylist = await updatePlaylist(
        selectedPlaylist,
        { name: playlistName },
        user,
      );

      const updatedUser = {
        ...user,
        playlists: user.playlists.map((p) =>
          p._id == updatedPlaylist.playlist._id ||
          p.id == updatedPlaylist.playlist._id
            ? updatedPlaylist.playlist
            : p,
        ),
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Playlist updated successfully!");
      setShowEditModal(false);
      setPlaylistMenu(null);
    } catch (error) {
      console.error("Error updating playlist:", error);
      toast.error("Failed to update playlist. Please try again.");
    }
  }

  async function handleChangeImage(e) {
    // Handle image selection and upload logic here
    const selectedImage = e.target.files[0];
    if (selectedImage && selectedImage.type.startsWith("image/")) {
      setFile(selectedImage);
    } else {
      setFile(null);
      alert("Please select a valid image file.");
    }
  }
  async function handleUploadImage() {
    if (!file) {
      alert("No file selected for upload.");
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    try {
      const data = await updatePlaylist(selectedPlaylist, formData, user);
      // Update the user state with the new playlist data
      const updatedUser = {
        ...user,
        playlists: user.playlists.map((p) =>
          p._id == data.playlist._id ? (p = data.playlist) : p,
        ),
      };
      toast.success("Playlist image updated successfully!");
      setUser(updatedUser);
      setModalOverlay(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to update playlist image. Please try again.");
    }
  }
  return (
    <div className="app-container">
      <header className="header">
        <Logo />
        <Search />
        <NavBar />
      </header>
      <main className="homeContainer">
        <div className="playlist-songs">
          <div className={styles.playlistHeader}>
            <h1>Your Playlists</h1>
            <NavDropdown
              title=""
              style={{
                marginLeft: "30px",
                fontSize: "30px",
              }}
            >
              <NavDropdown.Item
                onClick={() => setShowCreateModal(!showCreateModal)}
              >
                Create Playlist
              </NavDropdown.Item>
            </NavDropdown>
          </div>
          {showCreateModal && (
            <form>
              <label htmlFor="create">Playlist Name:</label>
              <input
                id="create"
                type="text"
                placeholder="Enter playlist name"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
              />
              <div className="modalActions">
                <Button onClick={handleAddPlaylist} type="select">
                  Save changes
                </Button>
                <Button onClick={() => setShowCreateModal(false)} type="cancel">
                  Close
                </Button>
              </div>
            </form>
          )}
          {user.playlists.length > 0 ? (
            <div className="playlists">
              {user.playlists.map((playlist) => (
                <div key={playlist._id}>
                  {showDeleteModal &&
                    selectedPlaylist &&
                    (selectedPlaylist._id || selectedPlaylist.id) ===
                      (playlist._id || playlist.id) && (
                      <div className={styles.modalContent}>
                        <Modal.Dialog>
                          <Modal.Header
                            closeButton
                            onClick={() => setShowDeleteModal(false)}
                          >
                            <Modal.Title>Delete Playlist</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            Are you sure you want to delete the playlist{" "}
                            {playlist.name}?
                          </Modal.Body>
                          <Modal.Footer>
                            <div className="modalActions">
                              <Button
                                type="accept"
                                onClick={() =>
                                  handleRemovePlaylist(
                                    playlist._id || playlist.id,
                                  )
                                }
                              >
                                Delete
                              </Button>
                              <Button
                                type="cancel"
                                onClick={() => setShowDeleteModal(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </Modal.Footer>
                        </Modal.Dialog>
                      </div>
                    )}

                  <div className={styles.playlistMenu}>
                    <span
                      onClick={() => {
                        const id = playlist._id || playlist.id;
                        setSelectedPlaylist(playlist);
                        setPlaylistMenu((prev) => (prev === id ? null : id));
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#e3e3e3"
                      >
                        <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                      </svg>
                    </span>
                    {playlistMenu === (playlist._id || playlist.id) && (
                      <div
                        style={{
                          position: "absolute",
                          top: "28px",
                          right: 0,
                          borderRadius: 8,
                          padding: "6px",
                          zIndex: 1200,
                          minWidth: 160,
                        }}
                      >
                        <div
                          className={styles.menuItem}
                          onClick={() => {
                            setSelectedPlaylist(playlist);
                            setPlaylistName(playlist.name || "");
                            setShowEditModal(true);
                            setPlaylistMenu(null);
                          }}
                        >
                          Edit Playlist
                        </div>
                        <div
                          className={styles.menuItem}
                          onClick={() => {
                            setSelectedPlaylist(playlist);
                            setShowDeleteModal(true);
                            setPlaylistMenu(null);
                          }}
                        >
                          Delete Playlist
                        </div>
                        <div
                          className={styles.menuItem}
                          onClick={() => {
                            setSelectedPlaylist(playlist);
                            setModalOverlay(true);
                            setPlaylistMenu(null);
                          }}
                        >
                          Edit Playlist Image
                        </div>
                        {
                          <div
                            className={styles.menuItem}
                            onClick={() => {
                              setSelectedPlaylist(playlist);
                              setShowForm(true);
                              setPlaylistMenu(null);
                            }}
                          >
                            Generate Playlist Image
                          </div>
                        }
                      </div>
                    )}
                  </div>
                  <Card className="py-4">
                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                      <p className="text-tiny uppercase font-bold"></p>
                      <small className="text-default-500">
                        {playlist.songs?.length || 0} Tracks
                      </small>
                      <h4 className="font-bold text-large">{playlist.name}</h4>
                    </CardHeader>
                    {/* edit this to show playlist image */}

                    <CardBody
                      className="overflow-visible py-2"
                      onClick={() => {
                        navigate(
                          `/myplaylists/${playlist._id || playlist.id}`,
                          {
                            state: { playlist, user },
                          },
                        );
                      }}
                    >
                      {playlist.imageUrl && (
                        <img
                          alt="Playlist"
                          className="object-cover rounded-xl"
                          src={playlist.imageUrl}
                          height={130}
                          width={200}
                        />
                      )}
                    </CardBody>
                  </Card>

                  {showEditModal && (
                    <div className="modalOverlay">
                      <Modal.Dialog>
                        <Form.Group controlId="exampleForm.ControlTextarea1">
                          <Form.Label>Edit Playlist Name</Form.Label>
                          <Form.Control
                            type="text"
                            onChange={(e) => setPlaylistName(e.target.value)}
                          />
                        </Form.Group>
                        <Modal.Footer>
                          <div className="modalActions">
                            <Button onClick={handleEditPlaylist} type="submit">
                              Send
                            </Button>

                            <Button
                              onClick={(prev) => setShowEditModal(!prev)}
                              type="cancel"
                            >
                              Cancel
                            </Button>
                          </div>
                        </Modal.Footer>
                      </Modal.Dialog>
                    </div>
                  )}
                  {/* {
                    <ButtonComponent
                      onClick={() =>
                        navigate(
                          `/myplaylists/${playlist._id || playlist.id}`,
                          {
                            state: { playlist, user },
                          },
                        )
                      }
                      type="link"
                    ></ButtonComponent>
                  } */}
                  {showForm && (
                    <div className="modalOverlay">
                      <Modal.Dialog>
                        <Form.Group controlId="exampleForm.ControlTextarea1">
                          <Form.Label>
                            {" "}
                            Generate your image for {playlist.name} playlist
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            onChange={(e) => {
                              setInput(e.target.value);
                            }}
                          />
                        </Form.Group>
                        <Modal.Footer>
                          <div className="modalActions">
                            <Button
                              onClick={async () => {
                                setLoading(true);
                                try {
                                  const data = await updatePlaylist(
                                    playlist,
                                    { prompt: input },
                                    user,
                                  );
                                  // update user/playlist in context
                                  const updatedUser = {
                                    ...user,
                                    playlists: user.playlists.map((p) =>
                                      p._id == data.playlist._id
                                        ? (p = data.playlist)
                                        : p,
                                    ),
                                  };
                                  setUser(updatedUser);

                                  toast.success("Playlist image generated!");
                                  setShowForm(false);
                                } catch (err) {
                                  toast.error("Image generation failed.", err);
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              type="submit"
                              loading={loading ? true : false}
                            >
                              Send
                            </Button>
                            <Button
                              type="cancel"
                              onClick={(prev) => {
                                setShowForm(!prev);
                                setInput("");
                              }}
                              loading={loading}
                            >
                              Cancel
                            </Button>
                            {loading && <Spinner />}
                          </div>
                        </Modal.Footer>
                      </Modal.Dialog>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No playlists available.</p>
          )}
          {modalOverlay && (
            <div className="modalOverlay">
              <Modal.Dialog>
                <Modal.Header>
                  <Modal.Title>Edit Playlist picture</Modal.Title>
                </Modal.Header>
                <Form.Group controlId="exampleForm.ControlTextarea1">
                  <Form.Label>Choose an image for your playlist</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleChangeImage}
                    accept="image/*"
                  />
                </Form.Group>
                <Modal.Footer>
                  <div className="modalActions">
                    <Button onClick={handleUploadImage} type="submit">
                      Save changes
                    </Button>
                    <Button onClick={() => setModalOverlay(false)} type="close">
                      Close
                    </Button>
                  </div>
                </Modal.Footer>
              </Modal.Dialog>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PlaylistsUser;
