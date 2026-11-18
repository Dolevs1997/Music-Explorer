import styles from "./RecentSongs.module.css";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import UserContext from "../../Contexts/UserContext";
import toast, { Toaster } from "react-hot-toast";
import Songs from "../../components/Songs/Songs";
import Logo from "../../components/Logo/Logo";
import DropDownComponent from "../../components/DropDownComponent/DropDownComponent";
import SideBar from "../../components/SideBar/SideBar";
function RecentSongs() {
  //History states
  const [recentSongs, setRecentSongs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFetched, setHistoryFetched] = useState(false);
  const { user } = useContext(UserContext);
  useEffect(() => {
    if (historyFetched || !user) return;

    async function fetchHistory() {
      setHistoryLoading(true);
      try {
        const response = await axios.get(
          `/api/userActivity/songsHistory?id=${user._id}`,
        );
        if (response.status !== 200) throw new Error("Failed to fetch history");
        const data = await response.data;
        setRecentSongs(data.recentSongs || []);
        setHistoryFetched(true);
      } catch (error) {
        console.error("Error fetching history:", error);
        toast.error("Could not load history.");
      } finally {
        setHistoryLoading(false);
      }
    }

    fetchHistory();
  }, [historyFetched, user]);

  return (
    <div>
      <header className="header">
        <Logo />
        <DropDownComponent />
      </header>
      <SideBar />
      <main className="home">
        <h2 className={styles.title}>Recently Played</h2>
        <Toaster />
        {historyLoading && <p className={styles.state}>Loading songs...</p>}
        {!historyLoading && recentSongs.length === 0 && (
          <p className={styles.state}>
            No songs found. Start listening to see your history!
          </p>
        )}
        {!historyLoading && recentSongs.length > 0 && (
          <div className={styles.historyList}>
            <Songs songSuggestions={recentSongs} />
          </div>
        )}
      </main>
    </div>
  );
}

export default RecentSongs;
