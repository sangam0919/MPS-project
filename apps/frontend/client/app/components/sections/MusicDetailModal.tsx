"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { resolveImageUrl } from '@/app/utils/resolveImageUrl';
type Company = { id: number; name: string; tier?: "Free" | "Standard" | "Business" };
type Playlist = { id: number; name: string };

export type MusicDetail = {
  id: number;
  title: string;
  artist: string;
  cover?: string;
  lyrics: string;
  company: Company;
  isSubscribed?: boolean;
  audioUrl?: string;
};

type UsageMetrics = {
  perRead: number;
  monthlyTotal: number;
  remaining: number;
};

/* ---------- helpers: selection / clipboard ---------- */
function getSelectedTextIn(container: HTMLElement | null): string {
  if (!container || typeof window === "undefined") return "";
  const sel = window.getSelection?.();
  if (!sel || sel.rangeCount === 0) return "";
  const range = sel.getRangeAt(0);
  const isInside = container.contains(range.commonAncestorContainer as Node);
  return isInside ? sel.toString() : "";
}

async function copyToClipboard(text: string) {
  if (!text) throw new Error("복사할 내용이 없습니다.");
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

export default function MusicDetailModal({
  open,
  onClose,
  item,
  myPlaylists = [],
  onSubscribe,
  onAddToPlaylist,
  onCreatePlaylist,
  usage,
}: {
  open: boolean;
  onClose: () => void;
  item: MusicDetail | null;
  myPlaylists?: Playlist[];
  onSubscribe?: (musicId: number) => Promise<void> | void;
  onAddToPlaylist?: (musicId: number, playlistId: number) => Promise<void> | void;
  onCreatePlaylist?: (name: string) => Promise<{ id: number; name: string }> | Promise<Playlist> | void;
  usage?: UsageMetrics;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const portalRoot = mounted && typeof window !== "undefined" ? document.getElementById("modal-root") : null;

  const fmt = useMemo(() => new Intl.NumberFormat("ko-KR"), []);
  const [showPicker, setShowPicker] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const firstFocusRef = useRef<HTMLButtonElement>(null);

 
  const mockLyrics =
`[Verse 1]
창문을 스치는 바람에 너의 온기가 남아
아직 사라지지 못한 길 위의 작은 노래

[Chorus]
아무 말도 하지 말아, 오늘만은 그대로
불을 끄지 않은 듯한 마음의 잔열로

[Bridge]
흐르는 불빛 사이로
우리의 계절이 번져`;

  // 가사 DOM (선택 복사용)
  const lyricsBoxRef = useRef<HTMLPreElement>(null);

  // 간단 토스트
  const [toast, setToast] = useState("");
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => firstFocusRef.current?.focus(), 0);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      setShowPicker(false);
      setCreating(false);
      setNewName("");
      setToast("");
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1200);
    return () => clearTimeout(t);
  }, [toast]);

  if (!mounted || !open || !item || !portalRoot) return null;

  const handleSubscribe = async () => { await onSubscribe?.(item.id); };
  const handlePick = async (playlistId: number) => { await onAddToPlaylist?.(item.id, playlistId); setShowPicker(false); };
  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const created = await onCreatePlaylist?.(newName.trim());
      if (created && "id" in (created as any)) await onAddToPlaylist?.(item.id, (created as any).id);
      setShowPicker(false);
    } finally {
      setCreating(false);
      setNewName("");
    }
  };

  // 재생 (그대로 유지)
  const handlePlay = () => {
    const src = item.audioUrl || "/audio/placeholder-sample.mp3";
    window.dispatchEvent(new CustomEvent("app:player:play", {
      detail: { id: item.id, title: item.title, artist: item.artist, cover: item.cover, src },
    }));
  };

  // 가사 소스 (실데이터 우선, 없으면 mock)
  const lyricsText = (item.lyrics && item.lyrics.trim()) ? item.lyrics : mockLyrics;

  // 복사/다운로드(척) 액션
  const copyAll = async () => {
    try { await copyToClipboard(lyricsText); setToast("가사 전체를 복사했어요."); }
    catch { setToast("복사에 실패했어요."); }
  };
  const copySelection = async () => {
    const selected = getSelectedTextIn(lyricsBoxRef.current?.parentElement || null);
    if (!selected.trim()) { setToast("가사에서 복사할 부분을 드래그하세요."); return; }
    try { await copyToClipboard(selected); setToast("선택한 부분을 복사했어요."); }
    catch { setToast("복사에 실패했어요."); }
  };
  const fakeDownload = () => {
    // 실제 파일 저장 대신 “되는 척”만 토스트
    setToast("다운로드 준비 중… (데모)");
  };

  const Stat = ({ label, value }: { label: string; value: number | string | undefined }) => (
    <div className="min-w-[120px] rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5">
      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="mt-0.5 font-semibold text-zinc-900 dark:text-white">
        {typeof value === "number" ? fmt.format(value) : value ?? "--"}
      </div>
    </div>
  );

  const ui = (
    <div className="fixed inset-0 z-[1000] flex items-stretch justify-center overscroll-contain">
      {/* Dimmer */}
      <div aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-black/50" />

      {/* Panel */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="music-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="
          relative z-[1001] w-full
          h-[100dvh] md:h-[calc(100%-6rem)]
          md:w-[min(100%,980px)]
          md:my-[4.5rem]
          overflow-hidden
          bg-white text-zinc-900 shadow-xl
          dark:bg-zinc-900 dark:text-white
          md:rounded-2xl md:border md:border-zinc-200 md:dark:border-white/10
          pt-[max(env(safe-area-inset-top),0px)]
          pb-[max(env(safe-area-inset-bottom),0px)]
          flex flex-col
        "
      >
        {/* Header */}
        <header className="flex items-start gap-4 border-b border-zinc-200 px-5 py-4 dark:border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
              src={resolveImageUrl(item.cover, 'music')}
              alt={`${item.title} cover`}
              className="h-16 w-16 rounded-md object-cover ring-1 ring-zinc-200 dark:ring-white/10"
              draggable={false}
            />
          <div className="min-w-0 flex-1">
            <h2 id="music-modal-title" className="truncate text-lg font-semibold">
              {item.title}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-600 dark:text-zinc-300">
              <span className="truncate">{item.artist}</span>
            </div>
            <div className="mt-3">
              <button
                ref={firstFocusRef}
                onClick={handlePlay}
                className="h-9 rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-800 active:bg-zinc-900
                           dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                재생
              </button>
            </div>
          </div>

          <div className="hidden gap-2 md:flex">
            <Stat label="1회 리워드 량" value={usage?.perRead} />
            <Stat label="총 월별 리워드 량" value={usage?.monthlyTotal} />
            <Stat label="남은 량" value={usage?.remaining} />
          </div>

          <button
            onClick={onClose}
            className="ml-2 rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="모달 닫기"
          >
            ×
          </button>
        </header>

        {/* Mobile usage metrics */}
        {usage ? (
          <div className="flex gap-2 border-b border-zinc-200 px-5 py-3 md:hidden dark:border-white/10">
            <Stat label="1회 리워드 량" value={usage.perRead} />
            <Stat label="총 월별 리워드 량" value={usage.monthlyTotal} />
            <Stat label="남은 량" value={usage.remaining} />
          </div>
        ) : null}

        {/* Body */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[1fr_320px]">
          {/* Lyrics */}
          <div className="relative border-b border-zinc-200 md:border-b-0 md:border-r dark:border-white/10">
            <article className="h-full overflow-y-auto p-5 pr-4">
              <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">가사</h3>

              <pre
                ref={lyricsBoxRef}
                className="whitespace-pre-wrap text-[15px] leading-7 text-zinc-800 dark:text-zinc-100
                           rounded-md border border-zinc-200 dark:border-zinc-700 p-2
                           max-h-full select-text"
              >
                {lyricsText}
              </pre>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={copyAll}
                  className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50
                             dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-white/10"
                >
                  전체 복사
                </button>
                <button
                  onClick={fakeDownload}
                  className="h-9 rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-800 active:bg-zinc-900
                             dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  TXT 다운로드 (데모)
                </button>
              </div>

              {toast && <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">{toast}</div>}
            </article>
          </div>

          {/* Sidebar */}
          <aside className="flex h-full flex-col justify-between p-5">
            <div className="space-y-4">
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleSubscribe}
                  className="h-10 rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-800 active:bg-zinc-900
                             dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  {item.isSubscribed ? "사용중" : "사용하기"}
                </button>

                {/* Playlist picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowPicker((s) => !s)}
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50
                               dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-white/10"
                  >
                    플레이리스트에 추가
                  </button>

                  {showPicker && (
                    <div className="absolute z-[1002] mt-2 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-white/10 dark:bg-zinc-900">
                      <div className="max-h-56 overflow-y-auto p-2">
                        {myPlaylists.length ? (
                          myPlaylists.map((pl) => (
                            <button
                              key={pl.id}
                              onClick={() => handlePick(pl.id)}
                              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-white/10"
                            >
                              <span className="truncate">{pl.name}</span>
                              <span className="text-xs text-zinc-400 dark:text-zinc-500">담기</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                            플레이리스트가 없습니다.
                          </div>
                        )}

                        <div className="my-2 h-px bg-zinc-200 dark:bg-white/10" />

                        {/* Create new */}
                        <div className="p-2">
                          <div className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">새 플레이리스트</div>
                          <div className="flex gap-2">
                            <input
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              placeholder="예: 출퇴근용"
                              className="h-9 flex-1 rounded-md border border-zinc-200 bg-white px-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300
                                         dark:border-white/10 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/20"
                            />
                            <button
                              disabled={creating}
                              onClick={handleCreate}
                              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50 disabled:opacity-60
                                         dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-white/10"
                            >
                              만들기
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 태그 칩 (데모) */}
              <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg:white/5">
                <div className="mb-2 text-sm font-medium text-zinc-900 dark:text-white">태그</div>
                <div className="flex flex-wrap gap-2">
                  {["잔잔한", "감성", "드라이브", "어쿠스틱", "Lo-fi"].map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full border border-zinc-200 bg-white/80 px-2.5 py-1 text-xs font-medium text-zinc-700 backdrop-blur
                                 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>  
  );

  return createPortal(ui, portalRoot);
}
