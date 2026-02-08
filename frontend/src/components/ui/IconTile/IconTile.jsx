import styles from "./IconTile.module.css";

export default function IconTile({ src, alt = "icon" }) {
  return (
    <div className={styles.tile}>
      <img className={styles.img} src={src} alt={alt} />
    </div>
  );
}