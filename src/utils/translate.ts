import axios from "axios";

const CACHE_KEY = "translation_cache_v3";
const TRANSLATE_CONCURRENCY = 4;
const CACHE_PERSIST_DELAY_MS = 500;

let memoryCache: Record<string, string> | null = null;
let cacheDirty = false;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

const loadCache = (): Record<string, string> => {
  if (memoryCache) return memoryCache;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    memoryCache = cached ? JSON.parse(cached) : {};
  } catch {
    memoryCache = {};
  }

  return memoryCache!;
};

const schedulePersistCache = () => {
  cacheDirty = true;
  if (persistTimer) return;

  persistTimer = setTimeout(() => {
    persistTimer = null;
    if (!cacheDirty || !memoryCache) return;

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
      cacheDirty = false;
    } catch {
      //
    }
  }, CACHE_PERSIST_DELAY_MS);
};

const flushCache = () => {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }

  if (!cacheDirty || !memoryCache) return;

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
    cacheDirty = false;
  } catch {
    //
  }
};

export const purgeOldTranslationCaches = () => {
    try {
        localStorage.removeItem("translation_cache");
        localStorage.removeItem("translation_cache_v2");
    } catch {
        //
    }
};

const countryToLanguage: Record<string, string> = {
  // Middle East & Arabic
  AE: "ar",
  SA: "ar",
  QA: "ar",
  KW: "ar",
  BH: "ar",
  OM: "ar",
  JO: "ar",
  IQ: "ar",
  EG: "ar",
  MA: "ar",
  DZ: "ar",
  TN: "ar",
  LB: "ar",
  SY: "ar",
  YE: "ar",
  LY: "ar",
  SD: "ar",
  MR: "ar",
  SO: "ar",
  PS: "ar",

  // Europe
  AD: "ca",
  AL: "sq",
  AT: "de",
  BA: "bs",
  BE: "nl",
  BG: "bg",
  BY: "be",
  CH: "de",
  CY: "el",
  CZ: "cs",
  DE: "de",
  DK: "da",
  EE: "et",
  ES: "es",
  FI: "fi",
  FR: "fr",
  GB: "en",
  GR: "el",
  HR: "hr",
  HU: "hu",
  IE: "ga",
  IS: "is",
  IT: "it",
  LI: "de",
  LT: "lt",
  LU: "lb",
  LV: "lv",
  MC: "fr",
  MD: "ro",
  ME: "sr",
  MK: "mk",
  MT: "mt",
  NL: "nl",
  NO: "no",
  PL: "pl",
  PT: "pt",
  RO: "ro",
  RS: "sr",
  RU: "ru",
  SE: "sv",
  SI: "sl",
  SK: "sk",
  SM: "it",
  UA: "uk",
  VA: "it",
  XK: "sq",

  // Asia
  AF: "ps",
  AM: "hy",
  AZ: "az",
  BD: "bn",
  BT: "dz",
  CN: "zh-CN",
  GE: "ka",
  HK: "zh-TW",
  ID: "id",
  IL: "he",
  IN: "hi",
  JP: "ja",
  KH: "km",
  KR: "ko",
  KZ: "kk",
  LA: "lo",
  LK: "si",
  MM: "my",
  MN: "mn",
  MO: "zh-TW",
  MV: "dv",
  MY: "ms",
  NP: "ne",
  PH: "fil",
  PK: "ur",
  SG: "en",
  TH: "th",
  TJ: "tg",
  TL: "pt",
  TM: "tk",
  TR: "tr",
  TW: "zh-TW",
  UZ: "uz",
  VN: "vi",

  // Americas
  AR: "es",
  BO: "es",
  BR: "pt",
  CA: "en",
  CL: "es",
  CO: "es",
  CR: "es",
  CU: "es",
  DO: "es",
  EC: "es",
  GT: "es",
  GY: "en",
  HN: "es",
  HT: "ht",
  JM: "en",
  MX: "es",
  NI: "es",
  PA: "es",
  PE: "es",
  PR: "es",
  PY: "es",
  SV: "es",
  TT: "en",
  US: "en",
  UY: "es",
  VE: "es",

  // Africa
  AO: "pt",
  BJ: "fr",
  BF: "fr",
  BI: "fr",
  CD: "fr",
  CF: "fr",
  CG: "fr",
  CI: "fr",
  CM: "fr",
  CV: "pt",
  DJ: "fr",
  ET: "am",
  GA: "fr",
  GH: "en",
  GM: "en",
  GN: "fr",
  GQ: "es",
  GW: "pt",
  KE: "sw",
  KM: "ar",
  LR: "en",
  LS: "en",
  MG: "mg",
  ML: "fr",
  MW: "en",
  MZ: "pt",
  NA: "en",
  NE: "fr",
  NG: "en",
  RW: "rw",
  SC: "fr",
  SL: "en",
  SN: "fr",
  SS: "en",
  ST: "pt",
  SZ: "en",
  TD: "fr",
  TG: "fr",
  TZ: "sw",
  UG: "en",
  ZA: "en",
  ZM: "en",
  ZW: "en",

  // Oceania
  AU: "en",
  FJ: "en",
  FM: "en",
  NZ: "en",
  PG: "en",
  PW: "en",
  SB: "en",
  TO: "en",
  VU: "fr",
  WS: "en",
};

const translateOneCached = async (
  text: string,
  targetLang: string,
  cache: Record<string, string>,
): Promise<string> => {
  const cacheKey = `auto:${targetLang}:${text}`;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  try {
    const response = await axios.get(
      "https://translate.googleapis.com/translate_a/single",
      {
        params: {
          client: "gtx",
          sl: "auto",
          tl: targetLang,
          dt: "t",
          q: text,
        },
      },
    );

    const data = response.data;
    const translatedText = data[0]
      ?.map((item: unknown[]) => item[0])
      .filter(Boolean)
      .join("");

    const result = translatedText || text;
    cache[cacheKey] = result;
    return result;
  } catch {
    return text;
  }
};

const mapWithConcurrency = async <T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number,
): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await fn(items[index]);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker),
  );

  return results;
};

/**
 * Dịch từng text riêng để giữ đúng mapping key → value.
 * Google Translate không trả về 1 segment / 1 dòng khi gộp batch.
 */
export const translateBatch = async (
  texts: string[],
  countryCode: string,
): Promise<string[]> => {
  const normalizedCountryCode = countryCode?.toUpperCase?.() || "";
  const targetLang = countryToLanguage[normalizedCountryCode] || "en";

  if (targetLang === "en") {
    return texts;
  }

  const cache = loadCache();

  const results = await mapWithConcurrency(
    texts,
    (text) => translateOneCached(text, targetLang, cache),
    TRANSLATE_CONCURRENCY,
  );

  flushCache();

  return results;
};

export const translateKeys = async (
  keys: readonly string[],
  source: Record<string, string>,
  countryCode: string,
): Promise<Record<string, string>> => {
  const values = keys.map((key) => source[key]);
  const results = await translateBatch(values, countryCode);
  const translated: Record<string, string> = {};

  keys.forEach((key, index) => {
    translated[key] = results[index] ?? source[key];
  });

  return translated;
};
