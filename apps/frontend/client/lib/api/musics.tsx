// lib/api/musics.ts
// ─────────────────────────────────────────────────────────────────────────────
// 실데이터용 클린 버전
// ─────────────────────────────────────────────────────────────────────────────

export type Category = { category_id: number; category_name: string };

// 서버가 내려주는 PopularMusicDto (요약)
export type RewardInfo = {
  reward_one: string | null;
  reward_total: string | null;
  reward_remain: string | null;
  total_count: number | null;
  remain_count: number | null;
};

export type MusicDetailApi = {
  id: number;
  title: string;
  artist: string;
  cover_image_url: string | null;
  format: 'FULL' | 'INSTRUMENTAL';
  has_lyrics: boolean;
  lyrics_text: string | null;
  lyrics_file_path: string | null;
  grade_required: 0|1|2;
  can_use: boolean;
  reward: {
    reward_one: string | null;
    reward_total: string | null;
    reward_remain: string | null;
    total_count: number | null;
    remain_count: number | null;
  };
  popularity: number;
  created_at: string;
  category_id: number | null;
  category_name: string | null;
  duration_sec: number | null;
  price_per_play: string | null;
  is_using: boolean;
};


export type PopularMusicDto = {
  id: number;
  title: string;
  artist: string;
  cover_image_url?: string | null;
  // 선택적으로 백엔드가 cover 필드를 직접 줄 수도 있음
  cover?: string | null;

  format: 'FULL' | 'INSTRUMENTAL';
  has_lyrics: boolean;

  grade_required: 0 | 1 | 2;
  can_use: boolean;

  reward: RewardInfo;

  popularity: number;
  created_at: string | Date;

  category?: string | null;
};

export type Music = PopularMusicDto & {
  // 프론트에서 편하게 쓰려고 cover 통일
  cover: string;
};

export type Page<T> = {
  items: T[];
  nextCursor: string | number | null;
  hasMore: boolean;
};

// ── BASE URL ────────────────────────────────────────────────────────────────
const BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}`
    : 'http://localhost:4000');
// ── 공통 유틸 ───────────────────────────────────────────────────────────────
const qs = (o: Record<string, any>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(o)) {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
};

async function safeJson(r: Response) {
  const text = await r.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`HTTP ${r.status} – invalid JSON: ${text?.slice(0, 200)}`);
  }
}

function pickArray<T = any>(obj: any, key: string): T[] | undefined {
  if (!obj) return undefined;
  if (Array.isArray(obj[key])) return obj[key];
  if (obj.data && Array.isArray(obj.data[key])) return obj.data[key];
  if (Array.isArray(obj.data)) return obj.data;
  if (Array.isArray(obj)) return obj;
  return undefined;
}

function pickValue<T = any>(obj: any, ...keys: string[]): T | undefined {
  for (const k of keys) {
    if (obj && obj[k] !== undefined) return obj[k];
    if (obj?.data && obj.data[k] !== undefined) return obj.data[k];
  }
  return undefined;
}

// 백엔드가 cover 또는 cover_image_url만 줄 수 있으니 cover 통일
function normalize(m: any): Music {
  const cover = (m.cover ?? m.cover_image_url ?? '') as string;
  return { ...m, cover };
}

// 필요 시 Authorization 헤더도 같이 실을 수 있게 훅
function authHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('accessToken');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// 공통 fetch 옵션
function reqInit(extra?: RequestInit): RequestInit {
  return {
    cache: 'no-store',
    credentials: 'include',
    headers: { ...(extra?.headers || {}), ...authHeaders() },
    ...extra,
  };
}

// ── API 함수들 ──────────────────────────────────────────────────────────────

/** 카테고리 목록 */
export async function fetchCategories(): Promise<Category[]> {
  const r = await fetch(`${BASE}/musics/categories`, reqInit());
  if (!r.ok) throw new Error(`GET ${BASE}/musics/categories ${r.status}`);
  const j = await safeJson(r);

  const items = pickArray<Category>(j, 'items');
  if (Array.isArray(items)) return items;

  throw new Error(`Unexpected categories response: ${JSON.stringify(j).slice(0, 200)}`);
}

/**
 * 일반 목록/검색 API
 * - category: 숫자 ID 또는 문자열 ID를 서버에서 category_id로 받는다고 가정
 * - sort: 'new' | 'popular' → 서버 sort 키로 매핑
 * - cursor: 문자열/숫자 허용
 */
export async function fetchMusics(params: {
  q?: string;
  category?: string | number;
  mood?: string;
  sort?: 'new' | 'popular';
  limit?: number;
  cursor?: string | number | null;
}): Promise<Page<Music>> {
  // 서버 파라미터 매핑
  const serverParams: Record<string, any> = {};
  if (params.q) serverParams.q = params.q;
  if (params.category !== undefined) serverParams.category_id = params.category;
  if (params.mood) serverParams.mood = params.mood;
  if (params.limit !== undefined) serverParams.limit = params.limit;
  if (params.cursor !== undefined && params.cursor !== null) serverParams.cursor = params.cursor;
  if (params.sort) {
    serverParams.sort = params.sort === 'popular' ? 'most_played' : 'newest';
  }

  const r = await fetch(`${BASE}/musics${qs(serverParams)}`, reqInit());
  if (!r.ok) throw new Error(`GET ${BASE}/musics ${r.status}`);
  const j = await safeJson(r);

  const itemsRaw = pickArray<PopularMusicDto>(j, 'items');
  const nextCursorRaw = pickValue<string | number | null>(j, 'nextCursor', 'next_cursor');
  const hasMoreRaw = pickValue<boolean>(j, 'hasMore', 'has_more');

  if (!Array.isArray(itemsRaw)) {
    throw new Error(`Unexpected musics response: ${JSON.stringify(j).slice(0, 200)}`);
  }

  const nextCursor = nextCursorRaw ?? null;
  const hasMore = Boolean(hasMoreRaw ?? (nextCursor !== null));

  return {
    items: itemsRaw.map(normalize),
    nextCursor,
    hasMore,
  };
}

/** 차트(인기) 전용 단축 API — 카테고리 칩에서 사용 */
export async function fetchPopular(params: {
  category?: string | number;
  limit?: number;
  days?: number; // 서버가 허용하면 최근기간 조절
} = {}): Promise<Music[]> {
  const serverParams: Record<string, any> = {};
  if (params.category !== undefined) serverParams.category = params.category;
  if (params.limit !== undefined) serverParams.limit = params.limit;
  if (params.days !== undefined) serverParams.days = params.days;

  const r = await fetch(`${BASE}/musics/popular${qs(serverParams)}`, reqInit());
  if (!r.ok) throw new Error(`GET ${BASE}/musics/popular ${r.status}`);
  const j = await safeJson(r);

  const items = pickArray<PopularMusicDto>(j, 'items');
  if (!items) throw new Error(`Unexpected popular response: ${JSON.stringify(j).slice(0, 200)}`);

  return items.map(normalize);
}

/** 상세 */
export async function fetchMusic(id: number | string): Promise<Music> {
  const r = await fetch(`${BASE}/musics/${id}`, reqInit());
  if (!r.ok) throw new Error(`GET ${BASE}/musics/${id} ${r.status}`);
  const j = await safeJson(r);
  const obj = pickValue<any>(j, 'data') ?? j;
  return normalize(obj);
}

  // 음원 상세 
export async function fetchMusicDetail(id: number | string): Promise<MusicDetailApi> {
  const r = await fetch(`${BASE}/musics/${id}`, { credentials: 'include', cache: 'no-store' });
  const j = await safeJson(r);
  if (!r.ok) throw new Error(j?.message || `GET /musics/${id} ${r.status}`);
  return j;
}

// 음원 사용하기 
export async function useMusic(musicId: number): Promise<{ isUsing: boolean; usingId?: number }> {
  const r = await fetch(`${BASE}/musics/${musicId}/use`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const j = await safeJson(r);
  if (!r.ok) throw new Error(j?.message || `POST /musics/${musicId}/use ${r.status}`);
  return { isUsing: !!j.is_using, usingId: j.using_id };
}