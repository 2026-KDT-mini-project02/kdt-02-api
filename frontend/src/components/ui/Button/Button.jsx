import styles from "./Button.module.css";

export default function Button({
  children,
  variant = "primary", // "primary" | "outline" | "dark"
  onClick,
  type = "button",
  disabled = false,
}) {
  const cls =
    variant === "outline"
      ? styles.outline
      : variant === "dark"
      ? styles.dark
      : styles.primary;

  return (
    <button
      className={`${styles.base} ${cls}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
