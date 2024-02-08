import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAsyncFn } from "react-use";

import { searchForPopularMovies } from "@/backend/metadata/search";
import { MWQuery } from "@/backend/metadata/types/mw";
import { Icons } from "@/components/Icon";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { MediaGrid } from "@/components/media/MediaGrid";
import { WatchedMediaCard } from "@/components/media/WatchedMediaCard";
import { SearchLoadingPart } from "@/pages/parts/search/SearchLoadingPart";
import { MediaItem } from "@/utils/mediaTypes";

function SearchSuffix(props: { failed?: boolean; results?: number }) {
  const { t } = useTranslation();

  return (
    <div className="mb-24 mt-40  flex flex-col items-center justify-center space-y-3 text-center">
      {!props.failed ? (
        <div>
          {(props.results ?? 0) > 0 ? (
            <p>{t("home.search.allResults")}</p>
          ) : (
            <p>{t("home.search.noResults")}</p>
          )}
        </div>
      ) : null}

      {props.failed ? (
        <div>
          <p>{t("home.search.failed")}</p>
        </div>
      ) : null}
    </div>
  );
}

export function PopularMoviePart({ searchQuery }: { searchQuery: string }) {
  const { t } = useTranslation();

  const [results, setResults] = useState<MediaItem[]>([]);
  const [state, exec] = useAsyncFn((query: MWQuery) =>
    searchForPopularMovies(query),
  );

  useEffect(() => {
    async function runSearch(query: MWQuery) {
      const searchResults = await exec(query);
      if (!searchResults) return;
      setResults(searchResults);
    }

    runSearch({ searchQuery });
  }, [searchQuery, exec]);

  if (state.loading) return <SearchLoadingPart />;
  if (state.error) return <SearchSuffix failed />;
  if (!results) return null;

  return (
    <div>
      {results.length > 0 ? (
        <div>
          <footer className="mt-16 border-t border-type-divider py-16 md:py-8" />
          <SectionHeading
            title={t("home.popularMovies.sectionTitle") || "Popular Movies"}
            icon={Icons.RISING_STAR}
          />
          <MediaGrid>
            {results.map((v) => (
              <WatchedMediaCard key={v.id.toString()} media={v} />
            ))}
          </MediaGrid>
        </div>
      ) : null}
    </div>
  );
}
