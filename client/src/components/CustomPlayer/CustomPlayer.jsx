import { useCallback, useEffect, useRef, useState } from "react";
import "./CustomPlayer.css";
import propTypes from "prop-types";
import { Link } from "react-router";
import {
  Xmark,
  PlayFill,
  BackwardStepFill,
  ForwardStepFill,
  PauseFill,
} from "@gravity-ui/icons"; /* ---------- YouTube IFrame API loader (loads the script once) ---------- */
let apiPromise = null;
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return apiPromise;
}

const formatTime = (s) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

export default function CustomPlayer({
  videoId,
  onNext,
  onPrev,
  onEnded,
  autoPlay = false,
  info,
  title,
  source,
  onClose,
}) {
  const [showVideo, setShowVideo] = useState(false);

  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const repeatRef = useRef(false);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [seeking, setSeeking] = useState(false);
  // Create the player once

  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then(() => {
      if (cancelled || !mountRef.current) return;
      playerRef.current = new window.YT.Player(mountRef.current, {
        videoId,
        playerVars: {
          controls: 0, // hide YouTube's own controls
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          autoplay: autoPlay ? 1 : 0,
        },
        events: {
          onReady: (e) => {
            setReady(true);
            setDuration(e.target.getDuration());
            e.target.setVolume(80);
          },
          onStateChange: (e) => {
            const S = window.YT.PlayerState;
            setPlaying(e.data === S.PLAYING);
            if (e.data === S.PLAYING || e.data === S.CUED) {
              setDuration(e.target.getDuration());
            }
            if (e.data === S.ENDED) {
              if (repeatRef.current) {
                e.target.seekTo(0, true);
                e.target.playVideo();
              } else {
                onEndedRef.current?.();
              }
            }
          },
        },
      });
    });
    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Change song without recreating the player
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    setCurrent(0);
    if (autoPlay) playerRef.current.loadVideoById(videoId);
    else playerRef.current.cueVideoById(videoId);
  }, [videoId, ready, autoPlay]);

  // Poll the current time while playing
  useEffect(() => {
    if (!ready || !playing || seeking) return;
    const id = setInterval(() => {
      setCurrent(playerRef.current?.getCurrentTime?.() ?? 0);
    }, 250);
    return () => clearInterval(id);
  }, [ready, playing, seeking]);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  }, [playing]);

  const commitSeek = (value) => {
    playerRef.current?.seekTo(value, true);
    setCurrent(value);
    setSeeking(false);
  };

  const changeVolume = (v) => {
    setVolume(v);
    const p = playerRef.current;
    if (!p) return;
    p.setVolume(v);
    if (v > 0 && muted) {
      p.unMute();
      setMuted(false);
    }
  };

  const toggleMute = () => {
    const p = playerRef.current;
    if (!p) return;
    if (muted) p.unMute();
    else p.mute();
    setMuted(!muted);
  };

  const toggleRepeat = () => {
    repeatRef.current = !repeat;
    setRepeat(!repeat);
  };

  const pct = (v, max) => (max > 0 ? (v / max) * 100 : 0);
  const shownVolume = muted ? 0 : volume;

  return (
    <div className="cp">
      {/* The YouTube video. Remove/resize this wrapper if you don't want it shown. */}
      <div className={`cp__video ${showVideo ? "is-open" : ""}`}>
        <div ref={mountRef} />
      </div>
      <button onClick={() => setShowVideo((v) => !v)}>
        {showVideo ? "Hide video" : "Show video"}
      </button>
      <div className="cp__card">
        {/* Progress row */}
        <button
          type="button"
          className="options-btn"
          aria-label="Close Player"
          onClick={onClose}
        >
          <Xmark />
        </button>

        <div className="cp__progress">
          <span className="cp__time">{formatTime(current)}</span>
          <input
            className="cp__range cp__range--progress"
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            disabled={!ready}
            style={{ ["--fill"]: `${pct(current, duration)}%` }}
            onMouseDown={() => setSeeking(true)}
            onTouchStart={() => setSeeking(true)}
            onChange={(e) => setCurrent(Number(e.target.value))}
            onMouseUp={(e) => commitSeek(Number(e.target.value))}
            onTouchEnd={(e) => commitSeek(Number(e.target.value))}
            onKeyUp={(e) => commitSeek(Number(e.target.value))}
            aria-label="Seek"
          />
          <span className="cp__time">{formatTime(duration)}</span>
        </div>

        {/* Controls row */}
        <div className="cp__controls">
          <button
            className={`cp__icon-btn ${repeat ? "is-active" : ""}`}
            onClick={toggleRepeat}
            aria-label="Repeat"
            aria-pressed={repeat}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
            </svg>
          </button>
          <div>
            {info}
            <span>{title}</span>
          </div>
          <div className="cp__transport">
            <div className="controllers">
              <button
                className="cp__icon-btn"
                onClick={onPrev}
                aria-label="Previous"
              >
                <BackwardStepFill />
              </button>

              <button
                className="cp__icon-btn"
                onClick={togglePlay}
                disabled={!ready}
                aria-label={playing ? "Pause" : "Play"}
              >
                {!playing && <PlayFill />}
                {playing && <PauseFill />}
              </button>

              <button
                className="cp__icon-btn"
                onClick={onNext}
                aria-label="Next"
              >
                <ForwardStepFill />
              </button>
            </div>
            <Link
              className="link-playlist"
              to={{ pathname: source.pathname, search: source.search }}
              state={source.state}
            >
              Go to playlist
            </Link>
          </div>
          <div className="cp__volume">
            <button
              className="cp__icon-btn"
              onClick={toggleMute}
              aria-label="Mute"
            >
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
              >
                {shownVolume === 0 ? (
                  <path d="M16.5 12A4.5 4.5 0 0 0 14 8v2.2l2.5 2.5V12zM19 12c0 .9-.2 1.8-.5 2.6l1.5 1.5A8.9 8.9 0 0 0 21 12c0-4.3-3-7.9-7-8.8v2.1c2.9.9 5 3.5 5 6.7zM4.3 3 3 4.3 7.7 9H3v6h4l5 5v-6.7l4.3 4.3c-.7.5-1.4.9-2.3 1.1v2.1c1.4-.3 2.6-.9 3.7-1.8l2 2 1.3-1.3L4.3 3zM12 4 9.9 6.1 12 8.2V4z" />
                ) : (
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1c2.9.9 5 3.5 5 6.7s-2.1 5.8-5 6.7v2.1c4-.9 7-4.5 7-8.8s-3-7.900-7-8.800z" />
                )}
              </svg>
            </button>
            <input
              className="cp__range cp__range--volume"
              type="range"
              min={0}
              max={100}
              value={shownVolume}
              style={{ ["--fill"]: `${shownVolume}%` }}
              onChange={(e) => changeVolume(Number(e.target.value))}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

CustomPlayer.propTypes = {
  videoId: propTypes.string,
  onNext: propTypes.func,
  onPrev: propTypes.func,
  onEnded: propTypes.func,
  autoPlay: propTypes.bool,
  info: propTypes.element,
  title: propTypes.string,
  source: propTypes.shape({
    pathname: propTypes.string,
    search: propTypes.string,
    state: propTypes.object,
  }),
  onClose: propTypes.func,
};
