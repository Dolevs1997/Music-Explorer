import propTypes from "prop-types";
import { Card, CardBody, CardHeader } from "@heroui/card";

function PlaylistUserCard({ playlist, onClick }) {
  return (
    <Card className="py-4">
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <small className="text-default-500">
          {playlist.songs?.length || 0} Tracks
        </small>
        <h4 className="font-bold text-large">{playlist.name}</h4>
      </CardHeader>
      <CardBody className="overflow-visible py-2" onClick={onClick}>
        {playlist.imageUrl && (
          <img
            alt="Playlist"
            className="object-cover rounded-xl"
            src={playlist.imageUrl}
            height={130}
            width={200}
          />
        )}
      </CardBody>
    </Card>
  );
}

PlaylistUserCard.propTypes = {
  playlist: propTypes.shape({
    name: propTypes.string,
    songs: propTypes.array,
    imageUrl: propTypes.string,
  }).isRequired,
  onClick: propTypes.func.isRequired,
};

export default PlaylistUserCard;
