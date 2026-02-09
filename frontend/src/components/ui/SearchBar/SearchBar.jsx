import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./SearchBar.module.css";

/**
 * 재사용 검색바 컴포넌트
 * - 자동완성(입력값 포함 필터)
 * - 최근검색(localStorage)
 * - 추천검색(입력값 없을 때)
 * - 바깥 클릭 시 닫힘
 */
export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "검색",
  suggestions = [],
  storageKey = "recent_search",
  maxRecent = 6,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [recent, setRecent] = useState([]);
  const wrapRef = useRef(null);

  // 최근검색 로드
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    setRecent(saved);
  }, [storageKey]);

  // 바깥 클릭하면 닫기
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
    const q = (value || "").trim();
    if (!q) return [];
    return suggestions.filter((s) => s.includes(q)).slice(0, 6);
  }, [value, suggestions]);

  const saveRecent = (text) => {
    const t = text.trim();
    if (!t) return;

    const next = [t, ...recent.filter((r) => r !== t)].slice(0, maxRecent);
    setRecent(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const runSearch = (text) => {
    const t = text.trim();
    if (!t) return;

    onChange?.(t);
    saveRecent(t);
    setIsOpen(false);
    onSearch?.(t);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    runSearch(value || "");
  };

  return (
    <div className={styles.searchWrap} ref={wrapRef}>
      <form className={styles.searchBar} onSubmit={onSubmit}>
        <span className={styles.searchIcon}>🔎</span>
        <input
          className={styles.searchInput}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange?.(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </form>

      {isOpen && (
        <div className={styles.dropdown}>
          {/* 자동완성 */}
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

          {/* 추천 검색어 */}
          {String(value || "").trim() === "" && suggestions.length > 0 && (
            <>
              <div className={styles.sectionTitle}>추천 검색어</div>
              {suggestions.slice(0, 5).map((p, i) => (
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
  );
}
