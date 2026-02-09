import { useState } from "react";
import BottomNav from "../../components/ui/BottomNav/BottomNav";
import SearchBar from "../../components/ui/SearchBar/SearchBar";
import FilterChips from "../../components/ui/FilterChips/FilterChips";
import styles from "./Map.module.css";

const CATEGORIES = ["동물병원", "동물약국", "미용", "카페", "식당", "반려동물용품"];

const SUGGESTIONS = [
  "강남 동물병원",
  "24시 동물병원",
  "애견 미용실",
  "반려견 카페",
  "반려동물 동반 식당",
  "동물약국",
  "펫샵",
];

export default function Map() {
  const [keyword, setKeyword] = useState("");
  const [activeCat, setActiveCat] = useState("동물병원");

  const handleSearch = (text) => {
    // TODO: 카카오맵 검색 연결
    console.log("검색:", text, "카테고리:", activeCat);
  };

  return (
    <div className={styles.page}>
      {/* 상단 */}
      <div className={styles.topArea}>
        <SearchBar
          value={keyword}
          onChange={setKeyword}
          onSearch={handleSearch}
          placeholder="장소 검색"
          suggestions={SUGGESTIONS}
          storageKey="dangwalk_recent_search"
        />

        <FilterChips items={CATEGORIES} value={activeCat} onChange={setActiveCat} />
      </div>

      {/* 지도 영역 */}
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
