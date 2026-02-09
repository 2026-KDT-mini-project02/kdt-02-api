import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/ui/BottomNav/BottomNav";
import styles from "./MyPage.module.css";

export default function MyPage() {
  const navigate = useNavigate();

  // 임시 데이터(나중에 API 연결)
  const user = { name: "김반려", email: "kimbanye@email.com" };
  const dog = { name: "초코", age: "3살", weight: "12kg", note: "건강 상태: 좋음" };

  // ✅ 모달 상태
  const [openAddDog, setOpenAddDog] = useState(false);

  // ✅ 입력 폼 상태
  const [form, setForm] = useState({
    name: "",
    breed: "",
    age: "",
    weight: "",
  });

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const closeModal = () => setOpenAddDog(false);

  const onSubmitDog = (e) => {
    e.preventDefault();

    if (!form.name.trim()) return alert("이름을 입력해줘");

    // TODO: API 연결해서 저장
    console.log("반려견 추가:", form);

    setForm({ name: "", breed: "", age: "", weight: "" });
    setOpenAddDog(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>프로필</h1>

        {/* 상단 유저 카드 */}
        <section className={styles.card}>
          <div className={styles.userRow}>
            <div className={styles.avatar}>👤</div>
            <div className={styles.userText}>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userEmail}>{user.email}</div>
            </div>
          </div>
        </section>

        {/* 내 반려견 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🐾</span>
            <span className={styles.sectionTitle}>내 반려견</span>
          </div>

          <div className={`${styles.card} ${styles.dogCard}`}>
            <div className={styles.dogRow}>
              <img className={styles.dogImg} src="/dog.png" alt="dog" />
              <div className={styles.dogText}>
                <div className={styles.dogName}>{dog.name}</div>
                <div className={styles.dogMeta}>
                  {dog.age} · {dog.weight}
                </div>
                <div className={styles.dogNote}>❤️ {dog.note}</div>
              </div>
            </div>

            <button
              className={styles.subButton}
              onClick={() => alert("프로필 수정(추후 연결)")}
              type="button"
            >
              프로필 수정
            </button>
          </div>

          {/* ✅ 모달 열기 */}
          <button className={styles.addButton} onClick={() => setOpenAddDog(true)} type="button">
            + 반려견 추가
          </button>
        </section>

        {/* 설정 리스트 */}
        <section className={styles.section}>
          <div className={styles.list}>
            <button className={styles.listItem} type="button">
              <span className={styles.liLeft}>
                <span className={styles.liIcon}>⚙️</span> 설정
              </span>
              <span className={styles.liRight}>›</span>
            </button>

            <button className={styles.listItem} type="button">
              <span className={styles.liLeft}>
                <span className={styles.liIcon}>🔔</span> 알림 설정
              </span>
              <span className={styles.liRight}>›</span>
            </button>

            <button className={styles.listItem} type="button">
              <span className={styles.liLeft}>
                <span className={styles.liIcon}>🩺</span> 건강 관리
              </span>
              <span className={styles.liRight}>›</span>
            </button>

            <button
              className={`${styles.listItem} ${styles.logout}`}
              onClick={() => navigate("/")}
              type="button"
            >
              <span className={styles.liLeft}>
                <span className={styles.liIcon}>🚪</span> 로그아웃
              </span>
              <span className={styles.liRight}>›</span>
            </button>
          </div>

          <div className={styles.version}>댕댕 산책 v1.0.0</div>
        </section>
      </div>

      {/* ✅ 오버레이 모달: 바깥 클릭 시 닫힘 */}
      {openAddDog && (
        <div className={styles.overlay} onMouseDown={closeModal}>
          <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
            <div className={styles.modalTop}>
              <div className={styles.modalTitle}>반려견 추가</div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={closeModal}
                aria-label="close"
              >
                ×
              </button>
            </div>

            <form className={styles.form} onSubmit={onSubmitDog}>
              <label className={styles.label}>이름</label>
              <input
                className={styles.input}
                placeholder="이름"
                value={form.name}
                onChange={onChange("name")}
              />

              <label className={styles.label}>품종</label>
              <input
                className={styles.input}
                placeholder="품종"
                value={form.breed}
                onChange={onChange("breed")}
              />

              <label className={styles.label}>나이</label>
              <input
                className={styles.input}
                placeholder="나이"
                value={form.age}
                onChange={onChange("age")}
              />

              <label className={styles.label}>체중</label>
              <input
                className={styles.input}
                placeholder="체중"
                value={form.weight}
                onChange={onChange("weight")}
              />

              <button className={styles.submitBtn} type="submit">
                추가
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
