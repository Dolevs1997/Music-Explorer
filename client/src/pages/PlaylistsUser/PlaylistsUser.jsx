import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, PencilToLine, Picture, SparklesFill } from "@gravity-ui/icons";
import { toast } from "react-hot-toast";
import Logo from "../../components/Logo/Logo.jsx";
import DropDownComponent from "../../components/DropDownComponent/DropDownComponent";
import SideBar from "../../components/SideBar/SideBar.jsx";
import CreateModalPlaylist from "../../components/CreateModalPlaylist/CreateModalPlaylist.jsx";
import DeleteModalPlaylist from "../../components/DeletePlaylistModal/DeleteModalPlaylist.jsx";
import UploadPlaylistImageModal from "../../components/UploadPlaylistImageModal/UploadPlaylistImageModal.jsx";
import GeneratePlaylistImageModal from "../../components/GeneratePlaylistImageModal/GeneratePlaylistImageModal.jsx";
import PlaylistUserCard from "../../components/PlaylistUserCard/PlaylistUserCard.jsx";
import UserContext from "../../Contexts/UserContext.jsx";
import { removePlaylist, updatePlaylist } from "../../utils/playlist.js";
import styles from "./PlaylistsUser.module.css";
import Button from "../../components/Button/Button.jsx";
import { createPlaylist } from "../../utils/playlist.js";

function PlaylistsUser() {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistMenu, setPlaylistMenu] = useState(null);
  const playlistMenuContainerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [generatedImage, setGeneratedImage] = useState(null);
  const playlists = user.playlists;
  const [previewImage, setPreviewImage] = useState(null);
  useEffect(() => {
    if (!playlistMenu) return;

    function handleOutsideClick(event) {
      if (
        playlistMenuContainerRef.current &&
        !playlistMenuContainerRef.current.contains(event.target)
      ) {
        setPlaylistMenu(null);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", handleOutsideClick);
  }, [playlistMenu]);

  async function handleAddPlaylist() {
    setActiveModal(false);
    try {
      const result = await createPlaylist(playlistName, user);
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
  async function handleSaveGeneratedImage() {
    if (!selectedPlaylist || !generatedImage) {
      toast.error("Missig field to complete the request");
      return;
    }
    const response = await updatePlaylist(selectedPlaylist, {
      imageUrl: generatedImage,
    });

    if (response.status === 200) {
      const updatedUser = updateUserPlaylist(response.data.playlist);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setActiveModal(null);
      setSelectedPlaylist(null);
    }
  }
  async function handleEditPlaylist() {
    if (!selectedPlaylist) return;

    try {
      const response = await updatePlaylist(selectedPlaylist, {
        name: playlistName,
      });
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

  async function handleUploadImage() {
    if (!selectedPlaylist || !previewImage) return;

    try {
      const response = await updatePlaylist(selectedPlaylist, {
        imageUrl: previewImage,
      });
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
        <>
          <div className={styles.playlistHeader}>
            <h1>Your Playlists</h1>
            <Button
              type="create-playlist"
              onClick={() => setActiveModal("create")}
            >
              <div className={styles.createPlaylistBtn}>
                <Plus />
                Create Playlist
              </div>
            </Button>
          </div>

          {playlists.length > 0 ? (
            <div className={styles.playlistsUser}>
              {playlists.map((playlist, index) => {
                const playlistId = playlist._id || playlist.id;
                return (
                  <div key={playlistId || index}>
                    <div
                      className={styles.playlistMenuContainer}
                      ref={
                        playlistMenu === playlistId
                          ? playlistMenuContainerRef
                          : null
                      }
                    >
                      <PlaylistUserCard
                        playlist={playlist}
                        onClick={() => {
                          navigate(`/myplaylists/${playlistId}`, {
                            state: { playlist, user },
                          });
                        }}
                        setSelectedPlaylist={setSelectedPlaylist}
                        setPlaylistMenu={setPlaylistMenu}
                        playlistName={playlistName}
                        setPlaylistName={setPlaylistName}
                        isRenaming={
                          activeModal === "edit" &&
                          (selectedPlaylist?._id || selectedPlaylist?.id) ===
                            playlistId
                        }
                        onSave={handleEditPlaylist}
                        onClose={() => {
                          setActiveModal(null);
                          setSelectedPlaylist(null);
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
                            <PencilToLine />
                            Rename
                          </div>

                          <div
                            className={styles.menuItem}
                            onClick={() => openModal("upload-image", playlist)}
                          >
                            <Picture />
                            Change cover image
                          </div>
                          <div
                            className={styles.menuItemAI}
                            onClick={() =>
                              openModal("generate-image", playlist)
                            }
                          >
                            <SparklesFill />
                            Generate cover Image with AI
                          </div>
                          <div
                            className={styles.menuItem}
                            onClick={() => openModal("delete", playlist)}
                          >
                            Delete Playlist
                          </div>
                        </div>
                      )}
                    </div>
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
              setShowModal={(isOpen) =>
                setActiveModal(isOpen ? "create" : null)
              }
              onClick={handleAddPlaylist}
            />
          )}
          {activeModal === "delete" && selectedPlaylist && (
            <DeleteModalPlaylist
              playlist={selectedPlaylist}
              onDelete={handleRemovePlaylist}
              onClose={() => setActiveModal(null)}
            />
          )}
          {activeModal === "upload-image" && selectedPlaylist && (
            <UploadPlaylistImageModal
              playlist={selectedPlaylist}
              onUpload={handleUploadImage}
              onClose={() => setActiveModal(null)}
              loading={loading}
              setLoading={setLoading}
              previewImage={previewImage}
              setPreviewImage={setPreviewImage}
            />
          )}
          {activeModal === "generate-image" && selectedPlaylist && (
            <GeneratePlaylistImageModal
              playlist={selectedPlaylist}
              loading={loading}
              setLoading={setLoading}
              onClose={() => setActiveModal(null)}
              onUpdate={handleSaveGeneratedImage}
              generatedImage={generatedImage}
              setGeneratedImage={setGeneratedImage}
            />
          )}
        </>
      </main>
    </div>
  );
}

export default PlaylistsUser;
