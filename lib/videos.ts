import videoData from '../data/videos.json';
import { watchAgainVideos, myListVideos } from './db/hasura';

interface Video {
  id: string;
  title: string;
  imgUrl: string;
  description: string;
  publishTime: string;
  channelTitle: string;
  statistics: Object;
}

const fetchVideos = async (url: string) => {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  const BASE_URL = 'youtube.googleapis.com/youtube/v3';

  const response = await fetch(`https://${BASE_URL}/${url}&maxResults=20&key=${YOUTUBE_API_KEY}`);

  return await response.json();
};

/**
 * Fetches videos from YouTube API or falls back to local video data.
 * @param url - API endpoint URL
 * @returns Array of Video objects
 */
export const getCommonVideos = async (url: string) => {
  try {
    const isDev = process.env.DEVELOPMENT === 'true';
    const data = isDev ? mapFallbackVideos() : await fetchVideos(url);
    if (data?.error) {
      console.error('YouTube API error', data?.error?.code, data?.error?.message);
      return mapFallbackVideos();
    }
    console.log(process.env.DEVELOPMENT);
    return data?.items.map(mapVideoData) || [];
  } catch (error) {
    console.error('Something went wrong with video library', error);
    return mapFallbackVideos();
  }
};

/**
 * Maps video API response items to Video objects.
 * @param item - API response item
 * @returns Mapped Video object
 */
const mapVideoData = (item: any): Video => {
  const id = item.id?.videoId || item.id;
  const snippet = item.snippet;
  return {
    title: snippet?.title,
    imgUrl: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    id,
    description: snippet.description,
    publishTime: snippet.publishedAt,
    channelTitle: snippet.channelTitle,
    statistics: item.statistics ? item.statistics : { viewCount: 0 },
  };
};

/**
 * Uses fallback video data if API fails.
 * @returns Array of Video objects
 */
const mapFallbackVideos = (): Video[] => {
  console.warn('Using fallback video data');
  return videoData?.items?.map(mapVideoData) || [];
};

/**
 * Fetches videos based on search query.
 * @param searchQuery - Search query string
 * @returns Promise of Video array
 */
export const getVideos = (searchQuery: string): Promise<Video[]> => {
  console.log('Fetching videos for:', searchQuery);
  const URL = `search?part=snippet&q=${searchQuery}&type=video`;
  return getCommonVideos(URL);
};

/**
 * Fetches popular videos.
 * @returns Promise of Video array
 */
export const getPopularVideos = (): Promise<Video[]> => {
  const URL = 'videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&regionCode=ES';
  return getCommonVideos(URL);
};
/**
 * Fetches popular videos.
 * @returns Promise of Video array
 */
export const getYoutubeVideoById = (videoId: string) => {
  const URL = `videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoId}`;

  return getCommonVideos(URL);
};

/**
 * Fetches popular videos.
 * @returns Promise of Video array
 */
export const getWatchAgainVideos = async (userId: string, token: string) => {
  const watchedVideos = await watchAgainVideos(userId, token);
  return (
    watchedVideos?.data?.stats?.map((video: { videoId: string }) => {
      return {
        id: video.videoId,
        imgUrl: `https://i.ytimg.com/vi/${video.videoId}/maxresdefault.jpg`,
      };
    }) || []
  );
};

/**
 * Fetches popular videos.
 * @returns Promise of Video array
 */
export const getMyListVideos = async (userId: string, token: string) => {
  const myVideos = await myListVideos(userId, token);
  return (
    myVideos?.data?.stats?.map((video: { videoId: string }) => {
      return {
        id: video.videoId,
        imgUrl: `https://i.ytimg.com/vi/${video.videoId}/maxresdefault.jpg`,
      };
    }) || []
  );
};
