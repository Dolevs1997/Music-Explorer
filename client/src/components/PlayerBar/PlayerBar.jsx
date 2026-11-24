import styles from "./PlayerBar.module.css";
import { usePlayerStore } from "../../hooks/usePlayerStore";
import CustomPlayer from "../CustomPlayer/CustomPlayer";
import { useContext, useEffect } from "react";
import { addSongToHistory } from "../../utils/userActivity";
import UserContext from "../../Contexts/UserContext";
function PlayerBar() {
  const song = usePlayerStore((s) => s.queue[s.currentIndex]);
  const source = usePlayerStore((s) => s.source);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const closePlayer = usePlayerStore((s) => s.closePlayer);
  const { user } = useContext(UserContext);

  useEffect(() => {
    async function addingSongToHistory() {
      await addSongToHistory(user, song);
    }
    addingSongToHistory();
  }, [song, user]);
  if (!song) return null;
  const info = (
    <>
      <img
        src={`https://img.youtube.com/vi/${song.videoId}/default.jpg`}
        alt=""
      />
      {/* <span>{song.title}</span> */}
    </>
  );
  return (
    <div className={styles.playerBar}>
      <CustomPlayer
        videoId={song.videoId}
        autoPlay
        onNext={next}
        onPrev={prev}
        onEnded={next}
        info={info}
        title={song.title}
        source={source}
        onClose={closePlayer}
      />
    </div>
  );
}

export default PlayerBar;
