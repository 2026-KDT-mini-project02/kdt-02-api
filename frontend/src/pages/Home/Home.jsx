import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
// 날씨 전용 아이콘 임포트
import { WiDaySunny, WiRain, WiSnow, WiCloudy, WiSleet, WiNa } from "react-icons/wi";

import Button from "../../components/ui/Button/Button";
import BottomNav from "../../components/ui/BottomNav/BottomNav";
import AirAlertBar from "../../components/ui/AirAlertBar/AirAlertBar";
import { API_BASE } from "../../api/api";
import styles from "./Home.module.css";

const WEATHER_CACHE_KEY = "weather_cache";
const WEATHER_TTL_MS = 60 * 60 * 1000; // 60분
const MOVE_THRESHOLD_KM = 0.7; // 약 700m

function readWeatherCache() {
    try {
        const raw = localStorage.getItem(WEATHER_CACHE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (
            typeof parsed?.lat !== "number" ||
            typeof parsed?.lon !== "number" ||
            typeof parsed?.at !== "number" ||
            !parsed?.data
        ) {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

function writeWeatherCache(lat, lon, data) {
    localStorage.setItem(
        WEATHER_CACHE_KEY,
        JSON.stringify({
            lat,
            lon,
            at: Date.now(),
            data,
        })
    );
}

// 위경도 차이를 km로 근사 계산(초보-friendly)
function approxDistanceKm(lat1, lon1, lat2, lon2) {
    const latKm = Math.abs(lat1 - lat2) * 111;
    const avgLatRad = ((lat1 + lat2) / 2) * (Math.PI / 180);
    const lonKm = Math.abs(lon1 - lon2) * 111 * Math.cos(avgLatRad);
    return Math.sqrt(latKm * latKm + lonKm * lonKm);
}

function shouldRefetch(cache, currentLat, currentLon) {
    if (!cache) return true;

    const expired = Date.now() - cache.at > WEATHER_TTL_MS;
    const movedFarEnough =
        approxDistanceKm(cache.lat, cache.lon, currentLat, currentLon) >= MOVE_THRESHOLD_KM;

    return expired || movedFarEnough;
}

export default function Home() {
    const navigate = useNavigate();
    const inFlightRef = useRef(false);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getWeatherData = async (lat, lon) => {
            if (inFlightRef.current) return;
            inFlightRef.current = true;

            try {
                const response = await axios.get(`${API_BASE}/api/weather`, {
                    params: { lat, lon },
                    withCredentials: true,
                });

                // ✅ 백엔드 데이터 추출 (.data.data)
                const realData = response.data.data; 

                if (realData) {
                    setWeather(realData);
                    // 캐시 저장
                    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
                        lat, lon, at: Date.now(), data: realData
                    }));
                }
                setLoading(false);
            } catch (error) {
                console.error("날씨 API 호출 실패:", error);
                setLoading(false);
            } finally {
                inFlightRef.current = false;
            }
        };

        // 꼬인 캐시 강제 삭제 (한 번만 실행)
        localStorage.removeItem(WEATHER_CACHE_KEY);

        navigator.geolocation.getCurrentPosition(
            (pos) => getWeatherData(pos.coords.latitude, pos.coords.longitude),
            () => getWeatherData(36.8151, 127.1138)
        );
    }, []);

    if (loading) return <div className={styles.loading}>로딩 중... 🐾</div>;
    if (!weather) return <div className={styles.error}>데이터를 불러올 수 없습니다.</div>;

    const renderWeatherIcon = (iconName) => {
        const iconSize = 90; 
        switch(iconName) {
            case "sun":   return <WiDaySunny size={iconSize} color="#FFB800" />;
            case "rain":  return <WiRain size={iconSize} color="#4A90E2" />;
            case "snow":  return <WiSnow size={iconSize} color="#A5D8FF" />;
            case "cloud": return <WiCloudy size={iconSize} color="#909090" />;
            default:      return <WiNa size={iconSize} color="#ccc" />;
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.topArea}>
                <header className={styles.header}>
                    <div className={styles.left}>
                        <div className={styles.date}>
                            <span className={styles.today}>오늘</span>
                            <span className={styles.dayText}>{weather.date}</span>
                        </div>
                        <div className={styles.tempRow}>
                            <div className={styles.tempNow}>
                                {Math.round(weather.temp)}<span className={styles.degree}>°</span>
                            </div>
                            <div className={styles.minMax}>
                                <span className={styles.max}>{weather.location}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.right}>
                        {/* 🌟 수정완료: dust와 ultraDust라는 이름으로 보냅니다. */}
                        <AirAlertBar 
                            dust={weather.dust} 
                            ultraDust={weather.ultraDust} 
                        />
                    </div>
                </header>

                <section className={styles.summary}>
                    <div className={styles.weatherIcon}>{renderWeatherIcon(weather.icon)}</div>
                    <div className={styles.weatherText}>{weather.sky}</div>
                    <div className={styles.tipText}>
                        {weather.location}의 미세먼지는 <strong>{weather.dust}</strong>, 초미세는 <strong>{weather.ultraDust}</strong> 상태예요. 🐾
                    </div>
                </section>

            </div>

            <section className={styles.hero}>
                <img className={styles.dog} src="/dog.png" alt="dog" />
            </section>

            <section className={styles.bottom}>
                <Button variant="dark" onClick={() => navigate("/map")}>
                    산책 시작하기
                </Button>
            </section>

            <BottomNav />
        </div>
    );
}
