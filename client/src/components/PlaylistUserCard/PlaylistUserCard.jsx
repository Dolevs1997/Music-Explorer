import styles from "./PlaylistUserCard.module.css";
import propTypes from "prop-types";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Check, Ellipsis, X } from "lucide-react";

import { coverUrl } from "../../utils/playlist";
function PlaylistUserCard({
  playlist,
  onClick,
  setSelectedPlaylist,
  setPlaylistMenu,
  playlistName,
  setPlaylistName,
  isRenaming,
  onSave,
  onClose,
}) {
  return (
    <Card className={styles.playlistCard}>
      <CardBody className="overflow-visible py-2">
        <div className={styles.playlistBox}>
          <Ellipsis
            size={18}
            className={styles.editPlaylist}
            onClick={() => {
              setSelectedPlaylist(playlist);
              setPlaylistMenu((currentMenu) =>
                currentMenu === playlist?._id ? null : playlist?._id,
              );
            }}
          />
          {playlist.imageUrl && (
            <img
              alt={playlist.name}
              className="object-cover rounded-xl"
              src={coverUrl(playlist.imageUrl)}
              height={130}
              width={200}
              onClick={onClick}
            />
          )}
        </div>
      </CardBody>
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        {!isRenaming && <span className={styles.title}>{playlist.name}</span>}
        {isRenaming && (
          <div className={styles.renameForm}>
            <input
              className={styles.renameInput}
              type="text"
              id={playlist._id}
              aria-label="Playlist name"
              value={playlistName}
              onChange={(event) => setPlaylistName(event.target.value)}
            />
            <div className={styles.renameActions}>
              <Check
                style={{ background: "#a855f7" }}
                className={styles.renameBtn}
                onClick={onSave}
              />

              <X
                style={{ color: "#cc9cfb" }}
                className={styles.renameBtn}
                onClick={onClose}
              />
            </div>
          </div>
        )}
        <span className={styles.tracks}>
          {playlist.songs?.length || 0} Tracks
        </span>
      </CardHeader>
    </Card>
  );
}

PlaylistUserCard.propTypes = {
  playlist: propTypes.shape({
    _id: propTypes.string,
    name: propTypes.string,
    songs: propTypes.array,
    imageUrl: propTypes.string,
  }).isRequired,
  onClick: propTypes.func.isRequired,
  setSelectedPlaylist: propTypes.func,
  setPlaylistMenu: propTypes.func,
  playlistName: propTypes.string,
  setPlaylistName: propTypes.func,
  isRenaming: propTypes.bool,
  onSave: propTypes.func,
  onClose: propTypes.func,
};

export default PlaylistUserCard;
