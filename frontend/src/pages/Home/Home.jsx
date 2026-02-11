import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
// 날씨 전용 아이콘 임포트
import { WiDaySunny, WiRain, WiSnow, WiCloudy, WiSleet, WiNa } from "react-icons/wi";

import Button from "../../components/ui/Button/Button";
import BottomNav from "../../components/ui/BottomNav/BottomNav";
import AirAlertBar from "../../components/ui/AirAlertBar/AirAlertBar";
import styles from "./Home.module.css";

export default function Home() {
    const navigate = useNavigate();
    
    // 상태 관리: 날씨 데이터와 로딩 상태
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. 사용자의 현재 GPS 위치 가져오기
        const fetchLocationAndWeather = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        await getWeatherData(latitude, longitude);
                    },
                    async (error) => {
                        console.error("위치 권한 거부: 기본 위치(천안) 데이터를 불러옵니다.");
                        await getWeatherData(36.8151, 127.1138);
                    }
                );
            } else {
                getWeatherData(36.8151, 127.1138);
            }
        };

        // 2. 백엔드 API 호출 (병렬 처리된 최신 API)
        const getWeatherData = async (lat, lon) => {
            try {
                const response = await fetch(`http://localhost:8080/api/weather?lat=${lat}&lon=${lon}`);
                const data = await response.json();
                setWeather(data);
                setLoading(false);
            } catch (error) {
                console.error("백엔드 연결 실패:", error);
                setLoading(false);
            }
        };

        fetchLocationAndWeather();
    }, []);

    // 3. 백엔드 'icon' 문자열에 맞춰 React-icons 컴포넌트 매핑
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

    const onStartWalk = () => {
        navigate("/map");
    };

    if (loading) return <div className={styles.loading}>사용자 위치 확인 중... 🐾</div>;
    if (!weather) return <div className={styles.error}>날씨 데이터를 불러올 수 없습니다.</div>;

    // 백엔드 데이터를 화면용 변수로 변환
    const dayText = weather.date; // 예: 2026-02-11
    const tempNow = Math.round(weather.temp);
    const weatherSummary = weather.sky; // 예: 맑음
    const weatherTip = `${weather.location}은 현재 ${weather.sky} 상태예요. 산책하기 딱 좋은 날씨네요! 🐾`;

    return (
        <div className={styles.page}>
            <div className={styles.topArea}>
                <header className={styles.header}>
                    <div className={styles.left}>
                        <div className={styles.date}>
                            <span className={styles.today}>오늘</span>
                            <span className={styles.dayText}>{dayText}</span>
                        </div>

                        <div className={styles.tempRow}>
                            <div className={styles.tempNow}>
                                {tempNow}<span className={styles.degree}>°</span>
                            </div>

                            <div className={styles.minMax}>
                                <span className={styles.max}>{weather.location}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.right}>
                        {/* 백엔드 dust 값을 AirAlertBar에 전달 */}
                        <AirAlertBar 
                            dustAlert={weather.dust} 
                            pm10={0} 
                            pm25={0} 
                            weatherAlerts={["자외선"]} 
                        />
                    </div>
                </header>

                <section className={styles.summary}>
                    <div className={styles.weatherIcon}>
                        {renderWeatherIcon(weather.icon)}
                    </div>
                    <div className={styles.weatherText}>{weatherSummary}</div>
                    <div className={styles.tipText}>{weatherTip}</div>
                </section>
            </div>

            <section className={styles.hero}>
                <img className={styles.dog} src="/dog.png" alt="dog" />
            </section>

            <section className={styles.bottom}>
                <Button variant="dark" onClick={onStartWalk}>
                    산책 시작하기
                </Button>
            </section>

            <BottomNav />
        </div>
    );
}