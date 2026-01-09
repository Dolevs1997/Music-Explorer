// import { YouTubePlaylistItem } from "../services/YouTube_service";

// export type YouTubPlaylistItems = {
//   kind: string;
//   items: YouTubePlaylistItem[];
// };

// function filteringPlaylistData(data: YouTubPlaylistItems) {
//   return data.items
//     .filter((item: YouTubePlaylistItem) => {
//       // Must be a video
//       if (item.snippet.resourceId.kind !== "youtube#video") return false;

//       // Exclude private/deleted videos
//       if (
//         item.snippet.title === "Deleted video" ||
//         item.snippet.title === "Private video"
//       )
//         return false;

//       // Exclude videos with unwanted content in title (trailers, clips, reviews, etc.)
//       const title = item.snippet.title.toLowerCase();
//       const excludePatterns = [
//         "trailer",
//         "teaser",
//         "official video",
//         "lyric video",
//         "review",
//         "reaction",
//         "tutorial",
//         "podcast",
//         "compilation",
//         "mixtape",
//         "mix",
//       ];

//       if (excludePatterns.some((pattern) => title.includes(pattern))) {
//         return false;
//       }

//       return true;
//     })
//     .map((item: YouTubePlaylistItem) => ({
//       id: item.snippet.resourceId.videoId,
//       title: item.snippet.title,
//       publishedAt: item.snippet.publishedAt,
//     }));
// }

// export default filteringPlaylistData;
