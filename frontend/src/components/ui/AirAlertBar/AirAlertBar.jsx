import styles from "./AirAlertBar.module.css";

function getToneByStatus(status) {
    if (!status) return "na";
    if (status.includes("매우 나쁨")) return "verybad";
    if (status.includes("나쁨")) return "bad";
    if (status.includes("보통")) return "normal";
    if (status.includes("좋음")) return "good";
    return "na";
}

function Chip({ tone, children }) {
    return <div className={`${styles.chip} ${styles[tone]}`}>{children}</div>;
}

// 🌟 수정완료: Home.jsx에서 보내준 이름과 정확히 일치시켰습니다.
export default function AirAlertBar({ dust, ultraDust }) {
    console.log("AirAlertBar 최종 수신 데이터:", { dust, ultraDust });

    return (
        <div className={styles.wrap}>
            <div className={styles.row} style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                <Chip tone={getToneByStatus(dust)}>
                    미세 {dust || "정보없음"}
                </Chip>
                <Chip tone={getToneByStatus(ultraDust)}>
                    초미세 {ultraDust || "정보없음"}
                </Chip>
            </div>
        </div>
    );
}