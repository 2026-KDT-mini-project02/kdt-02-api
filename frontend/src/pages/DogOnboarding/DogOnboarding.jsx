import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "../../styles/authCommon.css";
import "./DogOnboarding.css";

import IconTile from "../../components/ui/IconTile/IconTile";
import TextField from "../../components/ui/TextField/TextField";
import Button from "../../components/ui/Button/Button";

export default function DogOnboarding() {
  const navigate = useNavigate();
  const location = useLocation();

  const userIdFromSignup = location.state?.userId || ""; // 👈 3. 데이터 추출
  const [dogName, setDogName] = useState("");
  const [breed, setBreed] = useState("");

  // ✅ 이제 필수
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");

  // ✅ 선택(소개글)
  const [intro, setIntro] = useState("");

  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const onSaveDog = async () => {
    setMsg("");

    // 필수: 이름/견종/나이/몸무게
    if (!dogName.trim() || !breed.trim() || !age.trim() || !weight.trim()) {
      setMsg("필수 항목을 모두 입력해주세요.");
      return;
    }

    // 숫자 변환(필수)
    const ageNum = Number(age);
    const weightNum = Number(weight);

    if (Number.isNaN(ageNum) || ageNum < 0) {
      setMsg("나이는 0 이상 숫자로 입력해주세요.");
      return;
    }

    if (Number.isNaN(weightNum) || weightNum <= 0) {
      setMsg("몸무게는 0보다 큰 숫자로 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      // 1. 주소 확인: 아까 Controller에서 @RequestMapping("/api/dog")으로 만들었으므로 주소를 맞춰야 합니다.
      await fetch("http://localhost:8080/api/dog/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userid: userIdFromSignup,
          name: dogName, // 👈 dogName이 아니라 name (Entity 필드명)
          breed: breed,
          age: ageNum,
          weight: weightNum,
          description: intro.trim(), // 👈 intro가 아니라 description (Entity 필드명)
        }),
      });

      setMsg("반려견 정보 저장 완료!");
      navigate("/home");
    } catch (e) {
      setMsg("서버에 연결할 수 없습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authTop">
        <IconTile src="/icon.png" alt="로고" />
        <h1 className="dogTitle">반려견 정보 입력</h1>
        <p className="dogSub">함께 산책할 강아지를 소개해주세요</p>
      </div>

      <div className="dogForm">
        <label className="dogLabel">
          반려견 이름 <span className="req">*</span>
        </label>
        <TextField
          placeholder="예) 뽀삐"
          value={dogName}
          onChange={(e) => setDogName(e.target.value)}
        />

        <label className="dogLabel">
          견종 <span className="req">*</span>
        </label>
        <TextField
          placeholder="푸들, 시츄, 말티즈 등"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
        />

        <label className="dogLabel">
          나이 <span className="req">*</span>
        </label>
        <TextField
          placeholder="3"
          inputMode="numeric"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
        <p className="hint">세 단위로 입력해주세요</p>

        <label className="dogLabel">
          몸무게 <span className="req">*</span>
        </label>
        <TextField
          placeholder="5.5"
          inputMode="decimal"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <p className="hint">kg 단위로 입력해주세요</p>

        <label className="dogLabel">소개글 (선택)</label>
        <TextField
          placeholder="예) 사람을 좋아하고 활발해요"
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
        />
      </div>

      {msg && <p className="authMsg">{msg}</p>}

      <div className="authBtns">
        <Button onClick={onSaveDog} disabled={saving}>
          {saving ? "저장중..." : "시작하기"}
        </Button>
      </div>

      <p className="dogFoot">나중에 프로필에서 수정할 수 있습니다</p>
      <p className="authFooter">© 2026 KDT 2조 All rights reserved.</p>
    </div>
  );
}
