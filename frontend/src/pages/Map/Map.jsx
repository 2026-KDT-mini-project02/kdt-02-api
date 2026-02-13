import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

import BottomNav from "../../components/ui/BottomNav/BottomNav";
import FilterChips from "../../components/ui/FilterChips/FilterChips";
import SearchBar from "../../components/ui/SearchBar/SearchBar";
import MapView from "../../components/map/MapView";
import PhotoUploadButton from "../../components/map/PhotoUploadButton";
import RoadviewModal from "../../components/map/RoadviewModal";
import { useLocation } from "../../contexts/LocationContext";
import styles from "./Map.module.css";

const PHOTO_SPOT_API_BASE =
  process.env.REACT_APP_PHOTO_SPOT_API_BASE || `http://${window.location.hostname}:8080`;

function toAbsolutePhotoUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${PHOTO_SPOT_API_BASE}${url}`;
}

const CATEGORIES = [
  "전체",
  "공원",
  "카페",
  "식당",
  "동물병원",
  "동물약국",
  "미용",
  "반려동물용품",
  "문화시설",
];
const SUGGESTIONS = ["동물병원", "반려견 동반 카페", "공원"];

export default function Map() {
  const [keyword, setKeyword] = useState("");
  const [activeCat, setActiveCat] = useState(CATEGORIES[0]);
  const [photoSpots, setPhotoSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [roadviewOpen, setRoadviewOpen] = useState(false);
  const [spotSaving, setSpotSaving] = useState(false);
  const { location, status, error, requestLocation } = useLocation();
  const mapViewRef = useRef(null);

  const handleSearch = useCallback((text) => {
    setKeyword(text);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchPhotoSpots = async () => {
      try {
        const response = await axios.get(`${PHOTO_SPOT_API_BASE}/api/photo-spots/mine`, {
          withCredentials: true,
        });
        if (cancelled) return;
        const nextSpots = Array.isArray(response.data)
          ? response.data.map((spot) => ({
              ...spot,
              imgUrl: toAbsolutePhotoUrl(spot?.imgUrl),
            }))
          : [];
        setPhotoSpots(nextSpots);
      } catch (e) {
        console.error("Failed to load photo spots:", e);
      }
    };

    fetchPhotoSpots();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddPhotoSpot = useCallback(
    async (file) => {
      if (!file) return;

      setSpotSaving(true);
      try {
        const center = mapViewRef.current?.getCenter() ?? location;
        if (!center) {
          alert("지도의 중심 좌표를 확인할 수 없습니다.");
          return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("lat", String(center.lat));
        formData.append("lng", String(center.lng));

        const response = await axios.post(`${PHOTO_SPOT_API_BASE}/api/photo-spots`, formData, {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const savedSpot = {
          ...response.data,
          imgUrl: toAbsolutePhotoUrl(response.data?.imgUrl),
        };
        if (!savedSpot?.id) throw new Error("Invalid photo spot response");
        setPhotoSpots((prev) => [savedSpot, ...prev]);
      } catch (e) {
        console.error("Failed to upload photo spot:", e);
        alert("사진 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        setSpotSaving(false);
      }
    },
    [location]
  );

  const handleClickSpot = useCallback((spot) => {
    setSelectedSpot(spot);
    setRoadviewOpen(true);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.topArea}>
        <SearchBar
          value={keyword}
          onChange={setKeyword}
          onSearch={handleSearch}
          placeholder="검색하기"
          suggestions={SUGGESTIONS}
          storageKey="dangwalk_recent_search"
        />

        <FilterChips items={CATEGORIES} value={activeCat} onChange={setActiveCat} />

        {status === "loading" && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
            Checking current location...
          </div>
        )}

        {status === "error" && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#ef4444" }}>
            {error}{" "}
            <button type="button" onClick={() => requestLocation()} style={{ marginLeft: 6 }}>
              Retry
            </button>
          </div>
        )}
      </div>

      <div className={styles.mapArea}>
        <MapView
          ref={mapViewRef}
          keyword={keyword}
          activeCat={activeCat}
          location={location}
          photoSpots={photoSpots}
          onClickPhotoSpot={handleClickSpot}
          mapClassName={styles.map}
        />

        <PhotoUploadButton disabled={spotSaving} loading={spotSaving} onUpload={handleAddPhotoSpot} />
      </div>

      <BottomNav />

      {roadviewOpen && selectedSpot && (
        <RoadviewModal spot={selectedSpot} onClose={() => setRoadviewOpen(false)} />
      )}
    </div>
  );
}
