import styles from "./PlayerBar.module.css";
import { usePlayerStore } from "../../hooks/usePlayerStore";
import CustomPlayer from "../CustomPlayer/CustomPlayer";
function PlayerBar() {
  const song = usePlayerStore((s) => s.queue[s.currentIndex]);
  const source = usePlayerStore((s) => s.source);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
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
      {/* {sourcePath ? (
        <Link to={`${sourcePath}`} className={styles.playerBarInfo}>
          {info}
        </Link>
      ) : (
        <div className="player-bar__info">{info}</div>
      )} */}
      <CustomPlayer
        videoId={song.videoId}
        autoPlay
        onNext={next}
        onPrev={prev}
        onEnded={next}
        info={info}
        title={song.title}
        source={source}
      />
    </div>
  );
}

export default PlayerBar;
