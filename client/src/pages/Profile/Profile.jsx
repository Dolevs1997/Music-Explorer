import Logo from "../../components/Logo/Logo";
import Search from "../../components/Search/Search";
import NavBar from "../../components/NavBar/NavBar";
import { useContext, useState } from "react";
import UserContext from "../../Contexts/UserContext";
import styles from "./Profile.module.css";
import "@heroui/styles";
import { Tabs } from "@heroui/react";
import "@heroui/react/styles";
import { Card } from "@heroui/react";
import { useNavigate } from "react-router";

function Profile() {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("playlists");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  return (
    <div>
      <header className="header">
        <Logo />
        <Search />
        <NavBar />
      </header>
      <div className={styles.profilePageContainer}>
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar}>
            image
            <button className={styles.editAvatar}>Edit Picture</button>
          </div>

          <div className={styles.profileInfo}>
            <h1>{user.username}</h1>
            <p className={styles.userEmail}>{user.email}</p>
            <button onClick={() => setIsEditing(true)}>Edit Profile</button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="stats-dashboard">
          <div className="stat">
            <h3>{user.playlists?.length || 0}</h3>
            <p>Playlists</p>
          </div>
          <div className="stat">
            <h3>total user songs</h3>
            <p>Songs</p>
          </div>
          <div className="stat">
            <h3>{user.listeningTime || 0}</h3>
            <p>Hours Listened</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs className="w-full max-w-md" variant="secondary">
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
            <div className={styles.playlistsTab}>
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
        {isEditing && <p>edit profile user</p>}
      </div>
    </div>
  );
}

export default Profile;
