import Logo from "../../components/Logo/Logo";
import Search from "../../components/Search/Search";
import NavBar from "../../components/NavBar/NavBar";
import { useContext, useState, useEffect, useRef } from "react";
import UserContext from "../../Contexts/UserContext";
import styles from "./Profile.module.css";
import "@heroui/styles";
import { Tabs } from "@heroui/react";
import "@heroui/react/styles";
import { Card } from "@heroui/react";
import { useNavigate } from "react-router";
import updateUserActivity from "../../utils/userActivity";
import { uploadImageToCloudinary } from "../../services/Cloudinary_service";
import toast from "react-hot-toast";
function Profile() {
  const { user, setUser } = useContext(UserContext);

  const [activeTab, setActiveTab] = useState("playlists");

  //Avatar
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);
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

  // ── Derived ──────────────────────────────────────────────────────────────
  const totalSongs =
    user.playlists?.reduce((acc, p) => acc + (p.songs?.length || 0), 0) ?? 0;

  const currentAvatar =
    avatarPreview || user.avatar || "public/default-avatar-user.jpg";

  // ── Avatar ───────────────────────────────────────────────────────────────
  function handlePickFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
  }

  // History tab state
  // const [recentSongs, setRecentSongs] = useState([]);
  // const [historyLoading, setHistoryLoading] = useState(false);
  // Settings tab state
  // const [displayName, setDisplayName] = useState(user?.displayName || "");
  // const [currentPassword, setCurrentPassword] = useState("");
  // const [newPassword, setNewPassword] = useState("");
  // const [confirmNewPassword, setConfirmNewPassword] = useState("");
  // const [settingsLoading, setSettingsLoading] = useState(false);

  // useEffect(() => {
  //   async function fetchRecentSongs() {
  //     setHistoryLoading(true);
  //     try {
  //       const response = await fetch(
  //         `http://${import.meta.env.VITE_SERVER_URL}/moodiify/userActivity/history?id=${user.id}`,
  //         {
  //           method: "GET",
  //           headers: { Authorization: `Bearer ${user.token}` },
  //         },
  //       );
  //       if (!response.ok) throw new Error("Failed to fetch history");
  //       const data = await response.json();
  //       setRecentSongs(data.recentSongs || []);
  //     } catch (error) {
  //       console.error("Error fetching recent songs:", error);
  //       toast.error("Could not load history.");
  //     } finally {
  //       setHistoryLoading(false);
  //     }
  //   }
  //   if (activeTab === "history" && user) {
  //     fetchRecentSongs();
  //   }
  // }, [activeTab, user]);

  async function handleSaveChanges() {
    if (!avatarFile) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("image", avatarFile); // multer expects "image"

      const uploadResponse = await uploadImageToCloudinary(
        formData,
        user.token,
      );
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

  return (
    <div className="app-container">
      <header className="header">
        <Logo />
        <Search />
        <NavBar />
      </header>
      <div className={styles.profilePageContainer}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrapper}>
            <img
              className={styles.avatarImage}
              src={currentAvatar}
              alt="User Avatar"
            />
            <button
              className={styles.changeAvatarBtn}
              onClick={() => fileInputRef.current?.click()}
              title="Change avatar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="16"
                height="16"
              >
                <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm6.5-4H19l-1.5-2h-11L5 5h-.5A3.5 3.5 0 0 0 1 8.5v10A3.5 3.5 0 0 0 4.5 22h15a3.5 3.5 0 0 0 3.5-3.5v-10A3.5 3.5 0 0 0 18.5 5z" />
              </svg>
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
            <h1 className={styles.displayName}>
              {user.email?.split("@")[0] || "User"}
            </h1>
            <p className={styles.userEmail}>{user.email}</p>

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
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
        {/* Stats Dashboard */}
        <div className={styles.statsDashboard}>
          <div className={styles.stat}>
            <h3>{user.playlists?.length || 0}</h3>
            <p>Playlists</p>
          </div>
          <div className={styles.stat}>
            <h3>{totalSongs}</h3>
            <p>Songs</p>
          </div>
          <div className={styles.stat}>
            <h3>{user.listeningTime || 0}</h3>
            <p>Hours Listened</p>
          </div>
        </div>

        {/* Tabs */}

        <Tabs
          className={`${styles.tabsContainer} w-full max-w-md`}
          variant="secondary"
        >
          <Tabs.ListContainer>
            <Tabs.List>
              <Tabs.Tab
                className={activeTab === "playlists" ? styles.activeTab : ""}
                id="playlists"
                onClick={() => setActiveTab("playlists")}
              >
                Playlists
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab
                className={activeTab === "history" ? styles.activeTab : ""}
                id="history"
                onClick={() => setActiveTab("history")}
              >
                History
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab
                className={activeTab === "settings" ? styles.activeTab : ""}
                id="settings"
                onClick={() => setActiveTab("settings")}
              >
                Settings
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
          {/* Tab Content */}
          <Tabs.Panel className="pt-4" id="playlists">
            <div>
              <h2>My Playlists</h2>
              <div className={styles.playlistGrid}>
                {user.playlists?.map((playlist) => (
                  <Card
                    key={playlist._id}
                    className={`${styles.playlistCard} w-[200px] gap-2`}
                    onClick={() =>
                      navigate(`/myplaylists/${playlist._id}`, {
                        state: { playlist: playlist },
                      })
                    }
                  >
                    <img
                      className="pointer-events-none aspect-square w-14 rounded-2xl object-cover select-none"
                      src={playlist.imageUrl || "/default-playlist.png"}
                      alt={playlist.name}
                      loading="lazy"
                    />
                    <Card.Header>
                      <Card.Title>{playlist.name}</Card.Title>
                      <Card.Description>
                        {playlist.songs?.length || 0} songs
                      </Card.Description>
                    </Card.Header>
                  </Card>
                ))}
              </div>
            </div>
          </Tabs.Panel>
          <Tabs.Panel className="pt-4" id="history">
            <p>history</p>
          </Tabs.Panel>
          <Tabs.Panel className="pt-4" id="settings">
            <p>settings</p>
          </Tabs.Panel>
        </Tabs>
        {/* Edit Profile Modal */}
      </div>
    </div>
  );
}

export default Profile;
