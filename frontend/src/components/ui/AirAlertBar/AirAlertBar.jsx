import styles from "./AirAlertBar.module.css";

// 백엔드 텍스트("좋음", "보통" 등)에 따라 색상 클래스를 결정
function getToneByStatus(status) {
  if (!status) return "na";
  if (status.includes("좋음")) return "good";
  if (status.includes("보통")) return "normal";
  if (status.includes("나쁨")) return "bad";
  if (status.includes("매우 나쁨")) return "verybad";
  return "na";
}

function Chip({ tone, children }) {
  return <div className={`${styles.chip} ${styles[tone]}`}>{children}</div>;
}

export default function AirAlertBar({ dustAlert }) {
  const statusTone = getToneByStatus(dustAlert); // 여기서 "good", "normal" 등이 나옴

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        {/* styles[statusTone]이 styles.good 등이 되어 CSS 색상이 입혀짐 */}
        <Chip tone={statusTone}>
          미세먼지 {dustAlert || "정보 없음"}
        </Chip>
      </div>
    </div>
  );
}