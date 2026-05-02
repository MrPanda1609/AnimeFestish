const ANISKIP_BASE = "https://api.aniskip.com/v2";
const FAIRY_TAIL_INTRO_END = 110;

const FAIRY_TAIL_CONFIG = {
  "hoi-phap-su-phan-1": {
    malId: 6702,
    episodeOffset: 0,
    fallback: { start: 0, end: FAIRY_TAIL_INTRO_END },
  },
  "hoi-phap-su-phan-2": {
    malId: 22043,
    episodeOffset: 0,
    fallback: { start: 26.033, end: 26.033 + FAIRY_TAIL_INTRO_END },
  },
  "hoi-phap-su-phan-3": {
    malId: 22043,
    episodeOffset: 51,
    fallback: { start: 0, end: FAIRY_TAIL_INTRO_END },
  },
  "hoi-phap-su-phan-4": {
    malId: 35972,
    episodeOffset: 0,
    fallback: { start: 93.035, end: 93.035 + FAIRY_TAIL_INTRO_END },
  },
  "hoi-phap-su-nhiem-vu-100-nam": {
    malId: 49785,
    episodeOffset: 0,
    fallback: { start: 5.739, end: 5.739 + FAIRY_TAIL_INTRO_END },
  },
};

function getEpisodeNumber(epObj, epParam) {
  const raw = [epObj?.slug, epObj?.name, epParam]
    .filter(Boolean)
    .join(" ");
  const match = raw.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function normalizeMarker(marker, source) {
  if (!marker) return null;
  const start = Number(marker.start);
  const end = Number(marker.end);

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return null;
  }

  return {
    start,
    end,
    source,
  };
}

async function fetchAniSkipMarker({ malId, episodeNumber, duration }) {
  if (!malId || !episodeNumber || !Number.isFinite(duration) || duration <= 0) {
    return null;
  }

  const params = new URLSearchParams();
  params.append("types[]", "op");
  params.append("types[]", "mixed-op");
  params.set("episodeLength", duration.toFixed(3));

  const res = await fetch(
    `${ANISKIP_BASE}/skip-times/${malId}/${episodeNumber}?${params.toString()}`
  );
  if (!res.ok) return null;

  const data = await res.json();
  const op = data?.results?.find((item) =>
    item?.skipType === "op" || item?.skipType === "mixed-op"
  );

  if (!op?.interval) return null;
  return normalizeMarker(
    {
      start: op.interval.startTime,
      end: op.interval.endTime,
    },
    "aniskip"
  );
}

export async function resolveSkipIntroMarker({ slug, ep, episode, duration }) {
  const config = FAIRY_TAIL_CONFIG[slug];
  if (!config) return null;

  const localEpisode = getEpisodeNumber(episode, ep);
  if (!localEpisode) return null;

  const episodeNumber = localEpisode + (config.episodeOffset || 0);

  try {
    const marker = await fetchAniSkipMarker({
      malId: config.malId,
      episodeNumber,
      duration,
    });
    if (marker) return marker;
  } catch {
    // Fallback below keeps Fairy Tail usable if AniSkip is unavailable.
  }

  return normalizeMarker(config.fallback, "local");
}
