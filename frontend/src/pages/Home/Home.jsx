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
    
    // 상태 관리: 날씨 데이터와 로딩 상태
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initialCache = readWeatherCache();

        // 캐시가 있으면 먼저 화면 반영
        if (initialCache?.data) {
            setWeather(initialCache.data);
            setLoading(false);
        }

        // 1. 캐시 상태와 현재 위치 기준으로 필요한 경우에만 API 호출
        const getWeatherData = async (lat, lon) => {
            const cache = readWeatherCache();
            if (!shouldRefetch(cache, lat, lon)) {
                if (cache?.data) {
                    setWeather(cache.data);
                    setLoading(false);
                }
                return;
            }

            if (inFlightRef.current) return;
            inFlightRef.current = true;

            try {
                const response = await axios.get(`${API_BASE}/api/weather`, {
                    params: { lat, lon },
                    withCredentials: true,
                });

                setWeather(response.data);
                writeWeatherCache(lat, lon, response.data);
                setLoading(false);
            } catch (error) {
                if (error?.response?.status === 401) {
                    localStorage.removeItem("user");
                    navigate("/");
                    return;
                }
                console.error("백엔드 연결 실패:", error);
                if (!cache?.data) {
                    setLoading(false);
                }
            } finally {
                inFlightRef.current = false;
            }
        };

        // 2. 사용자의 현재 GPS 위치 가져오기
        const fetchLocationAndWeather = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        await getWeatherData(latitude, longitude);
                    },
                    async () => {
                        console.error("위치 권한 거부: 기본 위치(천안) 데이터를 불러옵니다.");
                        await getWeatherData(36.8151, 127.1138);
                    }
                );
            } else {
                getWeatherData(36.8151, 127.1138);
            }
        };

        fetchLocationAndWeather();
    }, [navigate]);

    if (loading) return <div className={styles.loading}>로딩 중... 🐾</div>;
    if (!weather) return <div className={styles.error}>데이터를 불러올 수 없습니다.</div>;

    // 아이콘 매핑 함수
    const renderWeatherIcon = (iconName) => {
        const iconSize = 90; 
        switch(iconName) {
            case "sun":   return <WiDaySunny size={iconSize} color="#FFB800" />;
            case "rain":  return <WiRain size={iconSize} color="#4A90E2" />;
            case "snow":  return <WiSnow size={iconSize} color="#A5D8FF" />;
            case "sleet": return <WiSleet size={iconSize} color="#74C0FC" />;
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
                        {/* 🌟 핵심: 백엔드의 weather.dust("좋음" 등)를 바로 전달 */}
                        <AirAlertBar 
                            dustAlert={weather.dust} 
                            weatherAlerts={["자외선"]} 
                        />
                    </div>
                </header>

                <section className={styles.summary}>
                    <div className={styles.weatherIcon}>
                        {renderWeatherIcon(weather.icon)}
                    </div>
                    <div className={styles.weatherText}>{weather.sky}</div>
                    <div className={styles.tipText}>
                        {weather.location}의 미세먼지는 <strong>{weather.dust}</strong> 상태예요. 🐾
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
