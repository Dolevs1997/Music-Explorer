import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { Pencil } from "@gravity-ui/icons";
import NavDropdown from "react-bootstrap/NavDropdown";
import { toast } from "react-hot-toast";
import Logo from "../../components/Logo/Logo.jsx";
import Search from "../../components/Search/Search.jsx";
import DropDownComponent from "../../components/DropDownComponent/DropDownComponent";
import SideBar from "../../components/SideBar/SideBar.jsx";
import CreateModalPlaylist from "../../components/CreatePlaylistModal/CreateModalPlaylist.jsx";
import DeleteModalPlaylist from "../../components/DeletePlaylistModal/DeleteModalPlaylist.jsx";
import EditPlaylistModal from "../../components/EditPlaylistModal/EditPlaylistModal.jsx";
import UploadPlaylistImageModal from "../../components/UploadPlaylistImageModal/UploadPlaylistImageModal.jsx";
import GeneratePlaylistImageModal from "../../components/GeneratePlaylistImageModal/GeneratePlaylistImageModal.jsx";
import PlaylistUserCard from "../../components/PlaylistUserCard/PlaylistUserCard.jsx";
import UserContext from "../../Contexts/UserContext.jsx";
import { removePlaylist, updatePlaylist } from "../../utils/playlist.js";
import styles from "./PlaylistsUser.module.css";

function PlaylistsUser() {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistMenu, setPlaylistMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const playlists = user.playlists;
  console.log("selectedPlaylist: ", selectedPlaylist);
  function updateUserPlaylist(playlist) {
    const updatedUser = {
      ...user,
      playlists: user.playlists.map((existingPlaylist) =>
        existingPlaylist._id === playlist._id ? playlist : existingPlaylist,
      ),
    };
    setUser(updatedUser);
    return updatedUser;
  }

  async function handleRemovePlaylist() {
    const playlistId = selectedPlaylist?._id || selectedPlaylist?.id;
    if (!playlistId) return;

    try {
      await removePlaylist(playlistId);
      const updatedUser = {
        ...user,
        playlists: user.playlists.filter(
          (playlist) =>
            playlist._id !== playlistId && playlist.id !== playlistId,
        ),
      };
      setUser(updatedUser);
      toast.success("Playlist deleted successfully");
      setActiveModal(null);
      setSelectedPlaylist(null);
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast.error("Failed to delete playlist");
    }
  }

  async function handleEditPlaylist() {
    if (!selectedPlaylist) return;

    try {
      const response = await updatePlaylist(selectedPlaylist, {
        name: playlistName,
      });
      console.log("response: ", response);
      if (response.status == 200) {
        const updatedUser = updateUserPlaylist(response.data.playlist);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
      setActiveModal(null);
      setSelectedPlaylist(null);
    } catch (error) {
      console.error("Error updating playlist:", error);
      toast.error("Failed to update playlist. Please try again.");
    }
  }

  async function handleUploadImage(file) {
    if (!selectedPlaylist) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await updatePlaylist(selectedPlaylist, formData);
      if (response.status == 200) {
        updateUserPlaylist(response.data.playlist);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
      setActiveModal(null);
      setSelectedPlaylist(null);
    } catch (error) {
      console.error("Error uploading image:", error.message);
      toast.error("Failed to update playlist image. Please try again.");
    }
  }

  async function handleGenerateImage(prompt) {
    if (!selectedPlaylist) return;

    setLoading(true);
    try {
      const response = await updatePlaylist(selectedPlaylist, { prompt });
      if (response.status == 200) {
        updateUserPlaylist(response.data.playlist);
        toast.success(response.data.message);
      } else toast.error(response.data.message);
      setActiveModal(null);
      setSelectedPlaylist(null);
    } catch (error) {
      console.error("Error generating playlist image:", error);
      toast.error("Image generation failed.");
    } finally {
      setLoading(false);
    }
  }

  function openModal(modalName, playlist) {
    setSelectedPlaylist(playlist);
    setPlaylistMenu(null);
    setActiveModal(modalName);
  }

  return (
    <div>
      <header className="header">
        <Logo />
        <DropDownComponent />
      </header>
      <SideBar />
      <main className="home">
        <Search />
        <main className="home">
          <h1>Your Playlists</h1>
          <div className={styles.playlistHeader}>
            <NavDropdown
              title=""
              style={{
                marginLeft: "30px",
                fontSize: "30px",
              }}
            >
              <NavDropdown.Item onClick={() => setActiveModal("create")}>
                Create Playlist
              </NavDropdown.Item>
            </NavDropdown>
          </div>

          {playlists.length > 0 ? (
            <div className={styles.playlistsUser}>
              {playlists.map((playlist, index) => {
                const playlistId = playlist._id || playlist.id;
                return (
                  <div key={playlistId || index}>
                    <div className={styles.playlistMenuContainer}>
                      <Pencil
                        onClick={() => {
                          setSelectedPlaylist(playlist);
                          setPlaylistMenu((currentMenu) =>
                            currentMenu === playlistId ? null : playlistId,
                          );
                        }}
                      />
                      {playlistMenu === playlistId && (
                        <div className={styles.playlistMenu}>
                          <div
                            className={styles.menuItem}
                            onClick={() => {
                              setPlaylistName(playlist.name || "");
                              openModal("edit", playlist);
                            }}
                          >
                            Edit Playlist
                          </div>
                          <div
                            className={styles.menuItem}
                            onClick={() => openModal("delete", playlist)}
                          >
                            Delete Playlist
                          </div>
                          <div
                            className={styles.menuItem}
                            onClick={() => openModal("upload-image", playlist)}
                          >
                            Edit Playlist Image
                          </div>
                          <div
                            className={styles.menuItem}
                            onClick={() =>
                              openModal("generate-image", playlist)
                            }
                          >
                            Generate Playlist Image
                          </div>
                        </div>
                      )}
                    </div>
                    <PlaylistUserCard
                      playlist={playlist}
                      onClick={() => {
                        navigate(`/myplaylists/${playlistId}`, {
                          state: { playlist, user },
                        });
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="homeContainer">
              <p>No playlists available.</p>
            </div>
          )}

          {activeModal === "create" && (
            <CreateModalPlaylist
              playlistName={playlistName}
              setPlaylistName={setPlaylistName}
              setShowCreateModal={(isOpen) =>
                setActiveModal(isOpen ? "create" : null)
              }
            />
          )}
          {activeModal === "delete" && selectedPlaylist && (
            <DeleteModalPlaylist
              playlist={selectedPlaylist}
              onDelete={handleRemovePlaylist}
              onClose={() => setActiveModal(null)}
            />
          )}
          {activeModal === "edit" && selectedPlaylist && (
            <EditPlaylistModal
              playlistName={playlistName}
              setPlaylistName={setPlaylistName}
              onSave={handleEditPlaylist}
              onClose={() => setActiveModal(null)}
            />
          )}
          {activeModal === "upload-image" && selectedPlaylist && (
            <UploadPlaylistImageModal
              playlist={selectedPlaylist}
              onUpload={handleUploadImage}
              onClose={() => setActiveModal(null)}
            />
          )}
          {activeModal === "generate-image" && selectedPlaylist && (
            <GeneratePlaylistImageModal
              playlist={selectedPlaylist}
              loading={loading}
              onGenerate={handleGenerateImage}
              onClose={() => setActiveModal(null)}
            />
          )}
        </main>
      </main>
    </div>
  );
}

export default PlaylistsUser;
