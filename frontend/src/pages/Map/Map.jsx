// src/pages/Map/Map.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import BottomNav from "../../components/ui/BottomNav/BottomNav";
import SearchBar from "../../components/ui/SearchBar/SearchBar";
import FilterChips from "../../components/ui/FilterChips/FilterChips";
import styles from "./Map.module.css";
import { useLocation } from "../../contexts/LocationContext";

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

function loadKakaoMapScript() {
  return new Promise((resolve, reject) => {
    const key = process.env.REACT_APP_KAKAO_JS_KEY;
    if (!key) return reject(new Error("REACT_APP_KAKAO_JS_KEY 없음 (.env 확인/재시작)"));

    if (window.kakao && window.kakao.maps) return resolve();

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
    script.async = true;

    script.onload = () => {
      if (!window.kakao || !window.kakao.maps) {
        return reject(new Error("script 로드 후 window.kakao.maps 없음"));
      }
      window.kakao.maps.load(resolve);
    };

    script.onerror = () => reject(new Error("카카오 SDK script 로드 실패"));
    document.head.appendChild(script);
  });
}

export default function Map() {
  const [keyword, setKeyword] = useState("");
  const [activeCat, setActiveCat] = useState("동물병원");

  const { location, status, error, requestLocation } = useLocation();

  const mapRef = useRef(null);
  const mapObjRef = useRef(null);
  const myMarkerRef = useRef(null);

  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let canceled = false;

    loadKakaoMapScript()
      .then(() => {
        if (canceled) return;

        const { kakao } = window;

        const fallback = new kakao.maps.LatLng(37.5665, 126.9780);

        const map = new kakao.maps.Map(mapRef.current, {
          center: fallback,
          level: 4,
          draggable: true,
        });

        mapObjRef.current = map;
        setMapReady(true);

        setTimeout(() => {
          if (canceled) return;
          map.relayout();
        }, 0);
      })
      .catch((e) => console.error("카카오맵 로드 실패:", e));

    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    if (!location) return;
    if (!mapObjRef.current) return;

    const { kakao } = window;
    const map = mapObjRef.current;

    const myPos = new kakao.maps.LatLng(location.lat, location.lng);

    map.setCenter(myPos);

    if (!myMarkerRef.current) {
      myMarkerRef.current = new kakao.maps.Marker({
        position: myPos,
        map,
      });
    } else {
      myMarkerRef.current.setPosition(myPos);
    }
  }, [mapReady, location]);

  // 검색 버튼 눌렀을 때
  const handleSearch = useCallback(
    (text) => {
      console.log("검색:", text, "카테고리:", activeCat);
      // 여기서 키워드/카테고리로 백엔드 호출하거나
      // 카카오 장소검색(Places) 연결하면 됨
    },
    [activeCat]
  );

  return (
    <div className={styles.page}>
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

        {status === "loading" && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
            현재 위치 확인 중…
          </div>
        )}

        {status === "error" && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#ef4444" }}>
            {error}{" "}
            <button type="button" onClick={() => requestLocation()} style={{ marginLeft: 6 }}>
              다시 시도
            </button>
          </div>
        )}
      </div>

      <div className={styles.mapArea}>
        <div ref={mapRef} className={styles.map} />
      </div>

      <BottomNav />
    </div>
  );
}
