import { useEffect, useMemo, useRef, useState } from "react";
import BottomNav from "../../components/ui/BottomNav/BottomNav";
import styles from "./Map.module.css";

const CATEGORIES = ["동물병원", "동물약국", "미용", "카페", "식당", "반려동물용품"];

// 임시 추천(나중에 API 자동완성으로 교체)
const SUGGESTIONS = [
  "강남 동물병원",
  "24시 동물병원",
  "애견 미용실",
  "반려견 카페",
  "반려동물 동반 식당",
  "동물약국",
  "펫샵",
];

const LS_KEY = "dangwalk_recent_search";

export default function Map() {
  const [keyword, setKeyword] = useState("");
  const [activeCat, setActiveCat] = useState("동물약국");

  const [isOpen, setIsOpen] = useState(false);
  const [recent, setRecent] = useState([]);

  const wrapRef = useRef(null);

  // 최근 검색어 로드
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    setRecent(saved);
  }, []);

  // 바깥 클릭하면 드롭다운 닫기
  useEffect(() => {
    const onDown = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // 입력값 기반 자동완성
  const autoList = useMemo(() => {
    const q = keyword.trim();
    if (!q) return [];
    return SUGGESTIONS.filter((s) => s.includes(q)).slice(0, 6);
  }, [keyword]);

  const saveRecent = (text) => {
    const t = text.trim();
    if (!t) return;

    const next = [t, ...recent.filter((r) => r !== t)].slice(0, 6);
    setRecent(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  };

  const runSearch = (text) => {
    const t = text.trim();
    if (!t) return;

    setKeyword(t);
    saveRecent(t);
    setIsOpen(false);

    // TODO: 나중에 API/카카오맵 검색 연결
    console.log("검색:", t, "카테고리:", activeCat);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    runSearch(keyword);
  };

  return (
    <div className={styles.page}>
      {/* 상단 검색/카테고리 */}
      <div className={styles.topArea} ref={wrapRef}>
        {/* 검색바 + 드롭다운을 한 묶음으로 */}
        <div className={styles.searchWrap}>
          <form className={styles.searchBar} onSubmit={onSubmit}>
            <span className={styles.searchIcon}>🔎</span>
            <input
              className={styles.searchInput}
              placeholder="장소 검색"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
            />
          </form>

          {/* 레이아웃 밀지 않는 absolute 드롭다운 */}
          {isOpen && (
            <div className={styles.dropdown}>
              {/* 자동완성(입력값 있을 때) */}
              {autoList.length > 0 && (
                <>
                  <div className={styles.sectionTitle}>자동완성</div>
                  {autoList.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={styles.dropItem}
                      onClick={() => runSearch(s)}
                    >
                      <span className={styles.itemIcon}>🔎</span>
                      <span className={styles.itemText}>{s}</span>
                    </button>
                  ))}
                </>
              )}

              {/* 최근 검색어 */}
              {recent.length > 0 && (
                <>
                  <div className={styles.sectionTitle}>최근 검색어</div>
                  {recent.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={styles.dropItem}
                      onClick={() => runSearch(r)}
                    >
                      <span className={styles.itemIcon}>🕘</span>
                      <span className={styles.itemText}>{r}</span>
                    </button>
                  ))}
                </>
              )}

              {/* 추천 검색어(입력값 없을 때) */}
              {keyword.trim() === "" && (
                <>
                  <div className={styles.sectionTitle}>추천 검색어</div>
                  {SUGGESTIONS.slice(0, 5).map((p, i) => (
                    <button
                      key={p}
                      type="button"
                      className={styles.dropItem}
                      onClick={() => runSearch(p)}
                    >
                      <span className={styles.rank}>{i + 1}</span>
                      <span className={styles.itemText}>{p}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <div className={styles.chips}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.chip} ${activeCat === c ? styles.active : ""}`}
              onClick={() => setActiveCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 지도 영역(일단 빈 화면 UI) */}
      <div className={styles.mapArea}>
        <div className={styles.centerHint}>
          <div className={styles.pin}>📍</div>
          <div className={styles.hintText}>산책 경로 지도</div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
