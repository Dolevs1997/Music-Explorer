import Logo from "../../components/Logo/Logo";
import DropDownComponent from "../../components/DropDownComponent/DropDownComponent";
import { useContext, useState, useEffect, useRef } from "react";
import UserContext from "../../Contexts/UserContext";
import styles from "./Profile.module.css";
import "@heroui/styles";
import "@heroui/react/styles";
import { useNavigate } from "react-router";
import { updateUserActivity } from "../../utils/userActivity";
import { uploadImageToCloudinary } from "../../services/Cloudinary_service";
import toast from "react-hot-toast";
import Account from "../../components/Settings/Account/Account";
import Preferences from "../../components/Settings/Preferences/Preferences";
import Privacy from "../../components/Settings/Privacy/Privacy";
import SideBar from "../../components/SideBar/SideBar";
import DeleteAccount from "../../components/DeleteAccount/DeleteAccount";
import { Card } from "@heroui/react";
import { ArrowRight, Upload, User } from "lucide-react";
import NavBar from "../../components/NavBar/NavBar";
function Profile() {
  const { user, setUser } = useContext(UserContext);
  //Avatar states
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  //Settings states

  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  if (!user) return null;

  // ── Avatar ───────────────────────────────────────────────────────────────
  function handlePickFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
  }

  async function handleSaveChanges() {
    if (!avatarFile) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("image", avatarFile); // multer expects "image"

      const uploadResponse = await uploadImageToCloudinary(formData);
      // upload_route.ts returns { imageUrl }
      const avatarUrl = uploadResponse.data?.imageUrl || user.avatar;

      await updateUserActivity(user, { avatar: avatarUrl });

      setUser({ ...user, avatar: avatarUrl });
      setAvatarFile(null);
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
      toast.success("Profile picture updated!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────
  const totalSongs =
    user.playlists?.reduce((acc, p) => acc + (p.songs?.length || 0), 0) ?? 0;

  const currentAvatar = avatarPreview || user.avatar;
  return (
    <div className="app-container">
      <header className="header homeHeader">
        <Logo />
        <NavBar />
        <DropDownComponent />
      </header>
      <SideBar />
      <main className="home">
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrapper}>
            {currentAvatar ? (
              <img
                className={styles.avatarImage}
                src={currentAvatar}
                alt="User Avatar"
              />
            ) : (
              <div className={styles.avatarImage}>
                <User />
              </div>
            )}
            <button
              className={styles.changeAvatarBtn}
              onClick={() => fileInputRef.current?.click()}
              title="Change avatar"
            >
              <Upload className={styles.iconUpload} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePickFile}
              style={{ display: "none" }}
            />
          </div>

          <div className={styles.profileMeta}>
            <div>
              <h6>Your Account</h6>
              <Card.Title>Profile</Card.Title>
              <p className={styles.userEmail}>{user.email}</p>
            </div>

            {avatarFile && (
              <span className={styles.pendingBadge}>
                📷 New photo selected — click Save to apply
              </span>
            )}

            <button
              className={styles.saveBtn}
              onClick={handleSaveChanges}
              disabled={isSaving || !avatarFile}
            >
              {isSaving ? "Saving..." : "Save photo"}
            </button>
          </div>
        </div>
        {/* Stats Dashboard */}
        <div className={styles.statsDashboard}>
          <div className="card-stats" onClick={() => navigate("/myplaylists")}>
            <Card.Title className="settingsSectionTitle">
              {user.playlists?.length || 0}
            </Card.Title>
            <Card.Description className="settingsCardSub">
              Playlists
            </Card.Description>
            <ArrowRight color="#a99abd" />
          </div>

          <div className="card-stats">
            <Card.Title className="settingsSectionTitle">
              {totalSongs}
            </Card.Title>
            <Card.Description className="settingsCardSub">
              Songs
            </Card.Description>
          </div>
        </div>

        <h2 className={styles.panelTitle}>Settings</h2>

        {/* ── Account View ── */}
        <div className={styles.settingsContainer}>
          <Account />

          <Preferences />

          <Privacy />
          <DeleteAccount />
        </div>
      </main>
    </div>
  );
}

export default Profile;
