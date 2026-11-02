import styles from "./PlaylistUserCard.module.css";
import propTypes from "prop-types";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Ellipsis } from "lucide-react";

import { coverUrl } from "../../utils/playlist";
function PlaylistUserCard({
  playlist,
  onClick,
  setSelectedPlaylist,
  setPlaylistMenu,
}) {
  return (
    <Card className="py-4">
      {/* <Pencil
        
      /> */}

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
        <span className={styles.title}>{playlist.name}</span>
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
};

export default PlaylistUserCard;
