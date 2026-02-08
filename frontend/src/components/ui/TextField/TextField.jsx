import styles from "./TextField.module.css";

export default function TextField({ placeholder, type = "text", value, onChange }) {
  return (
    <input
      className={styles.input}
      placeholder={placeholder}
      type={type}
      {...(value !== undefined ? { value } : {})}
      {...(onChange ? { onChange } : {})}
    />
  );
}
