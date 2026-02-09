import styles from "./FilterChips.module.css";

/**
 * 재사용 칩(필터/탭) 컴포넌트
 * items: ["전체","산책 친구",...]
 * value: 현재 선택값
 * onChange: 클릭 시 선택값 변경
 */
export default function FilterChips({ items = [], value, onChange }) {
  return (
    <div className={styles.chips}>
      {items.map((item) => (
        <button
          key={item}
          type="button"
          className={`${styles.chip} ${value === item ? styles.active : ""}`}
          onClick={() => onChange?.(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
