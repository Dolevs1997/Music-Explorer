import Logo from "../../components/Logo/Logo.jsx";
import Search from "../../components/Search/Search.jsx";
import NavBar from "../../components/NavBar/NavBar.jsx";
import { useNavigate } from "react-router";
import ButtonComponent from "../../components/Button/Button.jsx";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { updatePlaylist } from "../../utils/playlist.js";
import { useState } from "react";
import { toast } from "react-hot-toast";
function PlaylistsUser() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [modalOverlay, setModalOverlay] = useState(false);
  const [file, setFile] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const navigate = useNavigate();
  console.log("user playlists: ", user.playlists);
  async function handleChangeImage(e) {
    // Handle image selection and upload logic here
    console.log("selected playlist: ", selectedPlaylist);
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
    // console.log(formData.get("image"));
    try {
      const response = await updatePlaylist(
        selectedPlaylist._id || selectedPlaylist.id,
        formData,
        user,
      );
      console.log("Playlist updated with new image:", response.playlist);
      // Update the user state with the new playlist data
      const updatedUser = {
        ...user,
        playlists: user.playlists.map((p) =>
          p._id == response.playlist._id ? response.playlist : p,
        ),
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Playlist image updated successfully!");

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
          <h1>Your Playlists</h1>
          {user.playlists.length > 0 ? (
            <ul>
              {user.playlists.map((playlist) => (
                <li
                  key={playlist._id || playlist.id}
                  className="cursor-pointer "
                >
                  <span
                    onClick={() => {
                      console.log(
                        "Selected playlist for image change: ",
                        playlist,
                      );
                      setSelectedPlaylist(playlist);
                      setModalOverlay(true);
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
                        console.log("clicked");
                        navigate(
                          `/myplaylists/${playlist._id || playlist.id}`,
                          {
                            state: { playlist, user },
                          },
                        );
                      }}
                    >
                      {playlist.imageUrl ? (
                        <img
                          alt="Playlist"
                          className="object-cover rounded-xl"
                          src={playlist.imageUrl}
                          height={160}
                          width={270}
                        />
                      ) : (
                        <img
                          alt="Playlist"
                          className="object-cover rounded-xl"
                          src="https://heroui.com/images/hero-card-complete.jpeg"
                          height={160}
                          width={270}
                        />
                      )}
                    </CardBody>
                  </Card>
                  {/* <ButtonComponent
                    onClick={() =>
                      navigate(`/myplaylists/${playlist._id || playlist.id}`, {
                        state: { playlist, user },
                      })
                    }
                    type="link"
                  >
                  </ButtonComponent> */}
                </li>
              ))}
            </ul>
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
                  <ButtonComponent
                    onClick={() => setModalOverlay(false)}
                    type="close"
                  >
                    Close
                  </ButtonComponent>
                  <ButtonComponent onClick={handleUploadImage} type="select">
                    Save changes
                  </ButtonComponent>
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
