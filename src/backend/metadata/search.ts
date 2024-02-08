import { SimpleCache } from "@/utils/cache";
import { MediaItem } from "@/utils/mediaTypes";

import {
  formatTMDBMetaToMediaItem,
  formatTMDBSearchResult,
  multiSearch,
  popularMovies,
  popularTvs,
} from "./tmdb";
import { MWQuery } from "./types/mw";
import { TMDBContentTypes } from "./types/tmdb";

const cache = new SimpleCache<MWQuery, MediaItem[]>();
cache.setCompare((a, b) => {
  return a.searchQuery.trim() === b.searchQuery.trim();
});
cache.initialize();

export async function searchForMedia(query: MWQuery): Promise<MediaItem[]> {
  if (cache.has(query)) return cache.get(query) as MediaItem[];
  const { searchQuery } = query;

  const data = await multiSearch(searchQuery);
  const results = data.map((v) => {
    const formattedResult = formatTMDBSearchResult(v, v.media_type);
    return formatTMDBMetaToMediaItem(formattedResult);
  });

  const movieWithPosters = results.filter((movie) => movie.poster);
  const movieWithoutPosters = results.filter((movie) => !movie.poster);

  movieWithPosters.sort((a, b) => {
    if (a.year === b.year) {
      return 0;
    }
    if (a.year === null) {
      return 1;
    }
    if (b.year === null) {
      return -1;
    }
    return a.year != null && b.year != null && a.year < b.year ? 1 : -1;
  });

  movieWithoutPosters.sort((a, b) => {
    if (a.year === b.year) {
      return 0;
    }
    if (a.year === null) {
      return 1;
    }
    if (b.year === null) {
      return -1;
    }
    return a.year != null && b.year != null && a.year < b.year ? 1 : -1;
  });

  const sortedresult = movieWithPosters.concat(movieWithoutPosters);

  // cache results for 1 hour
  cache.set(query, sortedresult, 3600);
  return sortedresult;
}

export async function searchForPopularMovies(
  query: MWQuery,
): Promise<MediaItem[]> {
  if (cache.has(query)) return cache.get(query) as MediaItem[];

  const data = await popularMovies();
  const results = data.map((v) => {
    const formattedResult = formatTMDBSearchResult(v, TMDBContentTypes.MOVIE);
    return formatTMDBMetaToMediaItem(formattedResult);
  });

  const movieWithPosters = results.filter((movie) => movie.poster);
  const movieWithoutPosters = results.filter((movie) => !movie.poster);

  const sortedresult = movieWithPosters.concat(movieWithoutPosters);

  // cache results for 1 hour
  cache.set(query, sortedresult, 3600);
  return sortedresult;
}

export async function searchForPopularTvs(
  query: MWQuery,
): Promise<MediaItem[]> {
  if (cache.has(query)) return cache.get(query) as MediaItem[];

  const data = await popularTvs();
  const results = data.map((v) => {
    const formattedResult = formatTMDBSearchResult(v, TMDBContentTypes.TV);
    return formatTMDBMetaToMediaItem(formattedResult);
  });

  const movieWithPosters = results.filter((movie) => movie.poster);
  const movieWithoutPosters = results.filter((movie) => !movie.poster);

  const sortedresult = movieWithPosters.concat(movieWithoutPosters);

  // cache results for 1 hour
  cache.set(query, sortedresult, 3600);
  return sortedresult;
}
