'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadConstellations } from '@/lib/data/constellationsLoader';
import { loadStars } from '@/lib/data/starsLoader';
import type { Constellation } from '@/types/constellation';
import type { Star } from '@/types/star';
import PageHeader from '@/components/Layout/PageHeader';
import ConstellationModal from './ConstellationModal';
import { PageTransition } from '@/components/Animate/PageTransition';
import { FadeIn } from '@/components/Animate/FadeIn';

interface EncyclopediaState {
  constellations: Constellation[];
  stars: Star[];
  loading: boolean;
  error: string | null;
}

export default function EncyclopediaClient() {
  const [{ constellations, stars, loading, error }, setState] = useState<EncyclopediaState>({
    constellations: [],
    stars: [],
    loading: true,
    error: null,
  });
  const [search, setSearch] = useState('');
  const [selectedConstellationId, setSelectedConstellationId] = useState<string | null>(null);
  const [selectedStarId, setSelectedStarId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [constellationData, starData] = await Promise.all([
          loadConstellations(),
          loadStars(),
        ]);
        if (!cancelled) {
          setState({ constellations: constellationData, stars: starData, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            constellations: [],
            stars: [],
            loading: false,
            error: err instanceof Error ? err.message : '予期せぬエラーが発生しました。',
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const starLookup = useMemo(() => new Map(stars.map((star) => [star.id, star])), [stars]);

  const filteredConstellations = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return constellations;
    return constellations.filter((cons) =>
      cons.nameJa.toLowerCase().includes(keyword) || cons.name.toLowerCase().includes(keyword)
    );
  }, [constellations, search]);

  const selectedConstellation = useMemo(() => {
    if (!selectedConstellationId) return null;
    return constellations.find((cons) => cons.id === selectedConstellationId) ?? null;
  }, [constellations, selectedConstellationId]);

  const mainStars = useMemo(() => {
    if (!selectedConstellation) return [] as Star[];
    return selectedConstellation.mainStars
      .map((id) => starLookup.get(id))
      .filter((star): star is Star => Boolean(star));
  }, [selectedConstellation, starLookup]);

  const openConstellation = useCallback((cons: Constellation) => {
    setSelectedConstellationId(cons.id);
    setSelectedStarId(null);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedConstellationId(null);
    setSelectedStarId(null);
  }, []);

  const handleStarSelect = useCallback((starId: number) => {
    setSelectedStarId(starId);
  }, []);

  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <PageHeader
          eyebrow="Encyclopedia"
          title="星空図鑑"
          description="88 星座と主要な恒星の情報をチェックして、クイズで有利に進めよう。"
        >
          <FadeIn className="mx-auto mt-3 flex w-full max-w-xl items-center overflow-hidden rounded-2xl border border-white/10 bg-black/40 px-4" data-motion="fade-in-search">
            <span className="text-lg">🔍</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="星座名または英語名で検索"
              className="ml-3 w-full bg-transparent py-3 text-sm text-white placeholder:text-blue-200/60 focus:outline-none"
            />
          </FadeIn>
        </PageHeader>

        {loading && (
          <p className="text-center text-sm text-blue-200">星データを読み込み中...</p>
        )}

        {!loading && error && (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-center text-sm text-red-100">
            {error}
          </p>
        )}

        {!loading && !error && (
          <section>
            <h2 className="sr-only">星座リスト</h2>
            {filteredConstellations.length === 0 ? (
              <p className="text-center text-sm text-blue-100">該当する星座が見つかりませんでした。</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredConstellations.map((cons) => (
                  <li
                    key={cons.id}
                    className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur transition hover:border-blue-300/60"
                  >
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{cons.nameJa}</h3>
                      <p className="text-sm text-blue-200">{cons.name}</p>
                      {cons.mythology && (
                        <p className="text-xs text-blue-100 line-clamp-3">{cons.mythology}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => openConstellation(cons)}
                      className="mt-4 flex items-center justify-center rounded-2xl bg-blue-600/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      aria-label={`${cons.nameJa}の詳細を開く`}
                    >
                      詳しく見る
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      {selectedConstellation && (
        <ConstellationModal
          constellation={selectedConstellation}
          stars={mainStars}
          selectedStarId={selectedStarId}
          onSelectStar={handleStarSelect}
          onClose={closeModal}
        />
      )}
    </PageTransition>
  );
}
