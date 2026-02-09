import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button/Button";
import BottomNav from "../../components/ui/BottomNav/BottomNav";
import AirAlertBar from "../../components/ui/AirAlertBar/AirAlertBar";
import styles from "./Home.module.css";

export default function Home() {
    const navigate = useNavigate();

    // 임시 데이터 (나중에 API 연결)
    const dayLabel = "오늘";
    const dayText = "2월 8일";

    const tempNow = -7;
    const tempMin = -10;
    const tempMax = 3;

    const weatherSummary = "흐림";
    const weatherTip = "민주구 창천동 구름이 많지만 산책하기 좋은 날씨예요 🐾";

    const airData = {
        pm10: 45,
        pm25: 22,
        dustAlert: "미세먼지 경보",
        weatherAlerts: ["자외선"],
    };

    const onStartWalk = () => {
        navigate("/map");
    };

    return (
        <div className={styles.page}>
            <div className={styles.topArea}>
                <header className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.date}>
                    <span className={styles.today}>{dayLabel}</span>
                    <span className={styles.dayText}>{dayText}</span>
                    </div>

                    <div className={styles.tempRow}>
                    <div className={styles.tempNow}>
                        {tempNow}
                        <span className={styles.degree}>°</span>
                    </div>

                    <div className={styles.minMax}>
                        <span className={styles.min}>{tempMin}</span>
                        <span className={styles.max}>{tempMax}</span>
                    </div>
                    </div>
                </div>

                <div className={styles.right}>
                    <AirAlertBar {...airData} />
                </div>
                </header>

                <section className={styles.summary}>
                <div className={styles.weatherIcon}>☁️</div>
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
