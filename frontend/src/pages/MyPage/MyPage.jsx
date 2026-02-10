import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/ui/BottomNav/BottomNav";
import styles from "./MyPage.module.css";
import { useState, useEffect } from "react";
import axios from "axios";

export default function MyPage() {
  const navigate = useNavigate();

  // ✅ 사용자 정보 상태
  const [user, setUser] = useState({ name: "", userid: "" });

  // ✅ 반려견 목록 상태
  const [dogs, setDogs] = useState([]);

  // ✅ 로딩 상태
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로그인 시 저장했던 'user' 객체를 가져옴
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser({
        name: userData.name,
        userid: userData.userid,
      });

      // ✅ 반려견 목록 불러오기
      fetchDogs(userData.userid);
    } else {
      // 로그인 정보가 없으면 로그인 페이지로 이동
      navigate("/");
    }
  }, [navigate]);

  // ✅ 반려견 목록 가져오기 함수
  const fetchDogs = async (userid) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/dog/list`, {
        params: { userid: userid },
      });
      setDogs(response.data);
      console.log("반려견 목록:", response.data);
    } catch (error) {
      console.error("반려견 목록 조회 실패:", error);
      alert("반려견 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 모달 상태
  const [openAddDog, setOpenAddDog] = useState(false);
  const [openEditDog, setOpenEditDog] = useState(false);

  // ✅ 입력 폼 상태
  const [form, setForm] = useState({
    id: null,
    name: "",
    breed: "",
    age: "",
    weight: "",
    description: "",
  });

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const closeAddModal = () => {
    setOpenAddDog(false);
    setForm({
      id: null,
      name: "",
      breed: "",
      age: "",
      weight: "",
      description: "",
    });
  };

  const closeEditModal = () => {
    setOpenEditDog(false);
    setForm({
      id: null,
      name: "",
      breed: "",
      age: "",
      weight: "",
      description: "",
    });
  };

  // ✅ 반려견 추가 함수
  const onSubmitDog = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("이름을 입력해주세요!");
      return;
    }

    if (!form.breed.trim()) {
      alert("품종을 입력해주세요!");
      return;
    }

    if (!form.age) {
      alert("나이를 입력해주세요!");
      return;
    }

    if (!form.weight) {
      alert("체중을 입력해주세요!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/dog/register",
        {
          userid: user.userid,
          name: form.name,
          breed: form.breed,
          age: parseInt(form.age),
          weight: parseFloat(form.weight),
          description: form.description || "건강 상태: 좋음",
        },
      );

      console.log("반려견 등록 성공:", response.data);
      alert("반려견이 추가되었습니다!");

      closeAddModal();
      fetchDogs(user.userid);
    } catch (error) {
      console.error("반려견 등록 실패:", error);
      alert("반려견 추가 중 오류가 발생했습니다.");
    }
  };

  // ✅ 반려견 수정 모달 열기
  const openEditModal = (dog) => {
    setForm({
      id: dog.id,
      name: dog.name,
      breed: dog.breed,
      age: dog.age.toString(),
      weight: dog.weight.toString(),
      description: dog.description || "",
    });
    setOpenEditDog(true);
  };

  // ✅ 반려견 수정 함수
  const onUpdateDog = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("이름을 입력해주세요!");
      return;
    }

    if (!form.breed.trim()) {
      alert("품종을 입력해주세요!");
      return;
    }

    if (!form.age) {
      alert("나이를 입력해주세요!");
      return;
    }

    if (!form.weight) {
      alert("체중을 입력해주세요!");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8080/api/dog/update/${form.id}`,
        {
          name: form.name,
          breed: form.breed,
          age: parseInt(form.age),
          weight: parseFloat(form.weight),
          description: form.description || "건강 상태: 좋음",
        },
      );

      console.log("반려견 수정 성공:", response.data);
      alert("반려견 정보가 수정되었습니다!");

      closeEditModal();
      fetchDogs(user.userid);
    } catch (error) {
      console.error("반려견 수정 실패:", error);
      alert("반려견 수정 중 오류가 발생했습니다.");
    }
  };

  // ✅ 반려견 삭제 함수
  const onDeleteDog = async (dogId, dogName) => {
    if (!window.confirm(`정말 ${dogName}을(를) 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:8080/api/dog/delete/${dogId}`,
      );
      console.log("반려견 삭제 성공:", response.data);
      alert("반려견 정보가 삭제되었습니다.");

      fetchDogs(user.userid);
    } catch (error) {
      console.error("반려견 삭제 실패:", error);
      alert("반려견 삭제 중 오류가 발생했습니다.");
    }
  };

  // ✅ 로그아웃 함수
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
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
              <div className={styles.userName}>{user.name || "사용자"}</div>
              <div className={styles.userEmail}>
                {user.userid || "로그인이 필요합니다"}
              </div>
            </div>
          </div>
        </section>

        {/* 내 반려견 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🐾</span>
            <span className={styles.sectionTitle}>내 반려견</span>
          </div>

          {/* ✅ 로딩 중일 때 */}
          {loading && (
            <div className={styles.card}>
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#6b7280",
                }}
              >
                로딩 중...
              </div>
            </div>
          )}

          {/* ✅ 반려견이 없을 때 */}
          {!loading && dogs.length === 0 && (
            <div className={styles.card}>
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#6b7280",
                }}
              >
                등록된 반려견이 없습니다.
              </div>
            </div>
          )}

          {/* ✅ 반려견 목록 표시 */}
          {!loading &&
            dogs.map((dog) => (
              <div
                key={dog.id}
                className={`${styles.card} ${styles.dogCard}`}
                style={{ marginBottom: "10px" }}
              >
                <div className={styles.dogRow}>
                  <img className={styles.dogImg} src="/dog.png" alt="dog" />
                  <div className={styles.dogText}>
                    <div className={styles.dogName}>{dog.name}</div>
                    <div className={styles.dogMeta}>
                      {dog.age}살 · {dog.weight}kg · {dog.breed}
                    </div>
                    <div className={styles.dogNote}>
                      ❤️ {dog.description || "건강 상태: 좋음"}
                    </div>
                  </div>
                </div>

                <div className={styles.buttonRow}>
                  <button
                    className={styles.subButton}
                    onClick={() => openEditModal(dog)}
                    type="button"
                  >
                    프로필 수정
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => onDeleteDog(dog.id, dog.name)}
                    type="button"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}

          {/* ✅ 반려견 추가 버튼 */}
          <button
            className={styles.addButton}
            onClick={() => setOpenAddDog(true)}
            type="button"
          >
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
              onClick={handleLogout}
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

      {/* ✅ 반려견 추가 모달 */}
      {openAddDog && (
        <div className={styles.overlay} onMouseDown={closeAddModal}>
          <div
            className={styles.modal}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={styles.modalTop}>
              <div className={styles.modalTitle}>반려견 추가</div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={closeAddModal}
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
                placeholder="품종 (예: 골든 리트리버)"
                value={form.breed}
                onChange={onChange("breed")}
              />

              <label className={styles.label}>나이</label>
              <input
                className={styles.input}
                type="number"
                placeholder="나이 (숫자만)"
                value={form.age}
                onChange={onChange("age")}
              />

              <label className={styles.label}>체중 (kg)</label>
              <input
                className={styles.input}
                type="number"
                step="0.1"
                placeholder="체중 (예: 12.5)"
                value={form.weight}
                onChange={onChange("weight")}
              />

              <label className={styles.label}>소개 (선택)</label>
              <input
                className={styles.input}
                placeholder="건강 상태나 특징 등"
                value={form.description}
                onChange={onChange("description")}
              />

              <button className={styles.submitBtn} type="submit">
                추가
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ✅ 반려견 수정 모달 */}
      {openEditDog && (
        <div className={styles.overlay} onMouseDown={closeEditModal}>
          <div
            className={styles.modal}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={styles.modalTop}>
              <div className={styles.modalTitle}>반려견 수정</div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={closeEditModal}
                aria-label="close"
              >
                ×
              </button>
            </div>

            <form className={styles.form} onSubmit={onUpdateDog}>
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
                placeholder="품종 (예: 골든 리트리버)"
                value={form.breed}
                onChange={onChange("breed")}
              />

              <label className={styles.label}>나이</label>
              <input
                className={styles.input}
                type="number"
                placeholder="나이 (숫자만)"
                value={form.age}
                onChange={onChange("age")}
              />

              <label className={styles.label}>체중 (kg)</label>
              <input
                className={styles.input}
                type="number"
                step="0.1"
                placeholder="체중 (예: 12.5)"
                value={form.weight}
                onChange={onChange("weight")}
              />

              <label className={styles.label}>소개 (선택)</label>
              <input
                className={styles.input}
                placeholder="건강 상태나 특징 등"
                value={form.description}
                onChange={onChange("description")}
              />

              <div className={styles.editButtonRow}>
                <button className={styles.updateBtn} type="submit">
                  수정
                </button>
                <button
                  className={styles.deleteModalBtn}
                  type="button"
                  onClick={() => {
                    closeEditModal();
                    onDeleteDog(form.id, form.name);
                  }}
                >
                  삭제
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}