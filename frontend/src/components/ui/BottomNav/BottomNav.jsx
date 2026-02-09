import { NavLink } from "react-router-dom";
import styles from "./BottomNav.module.css";

function Item({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${styles.item} ${isActive ? styles.active : ""}`
      }
    >
      <div className={styles.icon}>{icon}</div>
      <div className={styles.label}>{label}</div>
    </NavLink>
  );
}

export default function BottomNav() {
  return (
    <nav className={styles.wrap}>
      <Item to="/home" label="홈" icon="🏠" />
      <Item to="/walkRecord" label="산책기록" icon="📍" />
      <Item to="/board" label="커뮤니티" icon="📰" />
      <Item to="/mypage" label="프로필" icon="👤" />
    </nav>
  );
}
