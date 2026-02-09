import { useState } from "react";
import BottomNav from "../../components/ui/BottomNav/BottomNav";
import styles from "./Map.module.css";

const CATEGORIES = ["동물약국", "반려동물용품", "동물병원", "미용", "반려식당"];

export default function Map() {
  const [keyword, setKeyword] = useState("");
  const [activeCat, setActiveCat] = useState("동물약국");

  const onSearch = (e) => {
    e.preventDefault();
    // TODO: 나중에 API/카카오맵 검색 연결
    console.log("검색:", keyword, "카테고리:", activeCat);
  };

  return (
    <div className={styles.page}>
      {/* 상단 검색/카테고리 */}
      <div className={styles.topArea}>
        <form className={styles.searchBar} onSubmit={onSearch}>
          <span className={styles.searchIcon}>🔎</span>
          <input
            className={styles.searchInput}
            placeholder="장소 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </form>

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
