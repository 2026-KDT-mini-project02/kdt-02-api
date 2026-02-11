import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "../../styles/authCommon.css";
import "./DogOnboarding.css";

import IconTile from "../../components/ui/IconTile/IconTile";
import TextField from "../../components/ui/TextField/TextField";
import Button from "../../components/ui/Button/Button";

import { API_BASE } from "../../api/api";

export default function DogOnboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const userIdFromSignup = location.state?.userId || "";
  const [dogName, setDogName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [intro, setIntro] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const onSaveDog = async () => {
    setMsg("");

    if (!dogName.trim() || !breed.trim() || !age.trim() || !weight.trim()) {
      setMsg("필수 항목을 모두 입력해주세요.");
      return;
    }

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
      const response = await fetch(`${API_BASE}/api/dog/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userid: userIdFromSignup,
          name: dogName,
          breed: breed,
          age: ageNum,
          weight: weightNum,
          description: intro.trim(),
        }),
      });

      if (response.ok) {
        // 1) 기존 user 제거
        localStorage.removeItem("user");

        // 2) 현재 가입 사용자 저장
        const newUser = {
          userid: userIdFromSignup,
          name: location.state?.userName || "새 사용자",
        };
        localStorage.setItem("user", JSON.stringify(newUser));

        setMsg("반려견 정보 저장 완료!");
        navigate("/home");
      } else {
        const errText = await response.text().catch(() => "");
        setMsg(errText || "저장에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
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
