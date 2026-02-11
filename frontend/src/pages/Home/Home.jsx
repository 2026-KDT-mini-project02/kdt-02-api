import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { WiDaySunny, WiRain, WiSnow, WiCloudy, WiSleet, WiNa } from "react-icons/wi";

import Button from "../../components/ui/Button/Button";
import BottomNav from "../../components/ui/BottomNav/BottomNav";
import AirAlertBar from "../../components/ui/AirAlertBar/AirAlertBar";
import styles from "./Home.module.css";

export default function Home() {
    const navigate = useNavigate();
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLocationAndWeather = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        await getWeatherData(latitude, longitude);
                    },
                    async (error) => {
                        await getWeatherData(36.8151, 127.1138); // 위치 거부 시 기본값
                    }
                );
            } else {
                getWeatherData(36.8151, 127.1138);
            }
        };

        const getWeatherData = async (lat, lon) => {
            try {
                const response = await fetch(`http://localhost:8080/api/weather?lat=${lat}&lon=${lon}`);
                const data = await response.json();
                setWeather(data);
                setLoading(false);
            } catch (error) {
                console.error("날씨 호출 실패:", error);
                setLoading(false);
            }
        };

        fetchLocationAndWeather();
    }, []);

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