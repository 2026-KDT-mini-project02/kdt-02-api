import styles from "./AirAlertBar.module.css";

function gradePm10(v) {
  if (v == null) return "na";
  if (v <= 30) return "good";
  if (v <= 80) return "normal";
  if (v <= 150) return "bad";
  return "verybad";
}
function gradePm25(v) {
  if (v == null) return "na";
  if (v <= 15) return "good";
  if (v <= 35) return "normal";
  if (v <= 75) return "bad";
  return "verybad";
}

// 경보 단계 (예: 없음/주의보/경보)
function gradeDustAlert(level) {
  if (!level) return "none";
  if (level.includes("경보")) return "danger";
  if (level.includes("주의")) return "warn";
  return "none";
}

function Chip({ tone, children }) {
  return <div className={`${styles.chip} ${styles[tone]}`}>{children}</div>;
}

export default function AirAlertBar({
  pm10,
  pm25,
  dustAlert,
  weatherAlerts = [],
}) {
  const pm10Tone = gradePm10(pm10);
  const pm25Tone = gradePm25(pm25);
  const dustTone = gradeDustAlert(dustAlert);

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <Chip tone={pm10Tone}>미세 {pm10 ?? "-"}</Chip>
        <Chip tone={pm25Tone}>초미세 {pm25 ?? "-"}</Chip>
      </div>

      <div className={styles.row}>
        <Chip tone={dustTone}>{dustAlert ? dustAlert : "미세먼지 경보 없음"}</Chip>
      </div>

      <div className={styles.rowCol}>
        {weatherAlerts.length === 0 ? (
          <Chip tone="blue">기상특보 없음</Chip>
        ) : (
          weatherAlerts.map((t, i) => (
            <Chip key={`${t}-${i}`} tone="blue">
              {t}
            </Chip>
          ))
        )}
      </div>
    </div>
  );
}
