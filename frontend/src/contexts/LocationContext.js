// src/contexts/LocationContext.js
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";

const LocationContext = createContext(null);

const LAST_KEY = "last_location";
const LAST_TTL_MS = 60 * 60 * 1000; // 1시간

function readLastLocation() {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p?.lat !== "number" || typeof p?.lng !== "number") return null;
    if (typeof p?.at !== "number") return null;
    if (Date.now() - p.at > LAST_TTL_MS) return null;
    return p; // {lat, lng, at}
  } catch {
    return null;
  }
}

function writeLastLocation(lat, lng) {
  localStorage.setItem(LAST_KEY, JSON.stringify({ lat, lng, at: Date.now() }));
}

export function LocationProvider({ children }) {
  // 마지막 위치가 있으면 즉시 사용(UX 개선)
  const [location, setLocation] = useState(() => {
    const last = readLastLocation();
    return last ? { lat: last.lat, lng: last.lng } : null;
  });

  const [status, setStatus] = useState(location ? "success" : "idle"); // idle|loading|success|error
  const [error, setError] = useState(null);

  const watchIdRef = useRef(null);

  const stopWatch = useCallback(() => {
    if (watchIdRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      setError("이 브라우저는 위치 기능을 지원하지 않아요.");
      return;
    }

    setStatus("loading");
    setError(null);

    // 1) 빠른 위치(캐시 허용) 먼저 받기
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        setStatus("success");
        writeLastLocation(latitude, longitude);
      },
      (err) => {
        // 실패해도 화면은 last_location으로 이미 표시될 수 있음 (UX)
        setStatus("error");
        if (err.code === 1) setError("위치 권한이 거부됐어요.");
        else if (err.code === 2) setError("위치 정보를 가져올 수 없어요.");
        else if (err.code === 3)
          setError("현재 위치 확인이 지연되고 있어요. 다시 시도해 주세요.");
        else setError("위치 확인 실패");
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000,
      }
    );

    // 2) 백그라운드로 계속 갱신(더 정확한 좌표로 업데이트)
    stopWatch();
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        setStatus("success");
        setError(null);
        writeLastLocation(latitude, longitude);
      },
      (err) => {
        // watch는 실패가 종종 있음 → 치명적으로 막지 말고 메시지만 갱신
        if (err.code === 1) setError("위치 권한이 거부됐어요.");
        else if (err.code === 2) setError("위치 정보를 가져올 수 없어요.");
        else if (err.code === 3) setError("위치 업데이트가 지연되고 있어요.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 20000,
      }
    );
  }, [stopWatch]);

  // 앱 접속 시 위치권한 자동 요청
  useEffect(() => {
    requestLocation();
    return () => stopWatch();
  }, [requestLocation, stopWatch]);

  const value = useMemo(
    () => ({ location, status, error, requestLocation }),
    [location, status, error, requestLocation]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation은 LocationProvider 안에서만 사용해야 합니다.");
  return ctx;
}
