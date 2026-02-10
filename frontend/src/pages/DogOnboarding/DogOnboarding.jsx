import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/authCommon.css";
import "./DogOnboarding.css";

import IconTile from "../../components/ui/IconTile/IconTile";
import TextField from "../../components/ui/TextField/TextField";
import Button from "../../components/ui/Button/Button";

export default function DogOnboarding() {
  const navigate = useNavigate();

  // ✅ 세션에서 가져온 사용자 정보
  const [user, setUser] = useState({ userid: "", name: "" });
  
  const [dogName, setDogName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [intro, setIntro] = useState("");

  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ 페이지 로드 시 세션 확인
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/session", {
        method: "GET",
        credentials: "include"
      });

      if (!res.ok) {
        alert("로그인이 필요합니다.");
        navigate("/");
        return;
      }

      const userData = await res.json();
      setUser({
        userid: userData.userid,
        name: userData.name
      });
      
      console.log("세션 확인 완료:", userData);
      setLoading(false);
    } catch (error) {
      console.error("세션 확인 실패:", error);
      alert("로그인이 필요합니다.");
      navigate("/");
    }
  };

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
      console.log("반려견 등록 시도:", {
        userid: user.userid,
        name: dogName,
        breed: breed,
        age: ageNum,
        weight: weightNum,
        description: intro.trim() || "건강 상태: 좋음"
      });

      const response = await fetch("http://localhost:8080/api/dog/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ 세션 쿠키 포함
        body: JSON.stringify({
          userid: user.userid, // ✅ 세션에서 가져온 userid
          name: dogName,
          breed: breed,
          age: ageNum,
          weight: weightNum,
          description: intro.trim() || "건강 상태: 좋음"
        }),
      });

      if (response.ok) {
        const result = await response.text();
        console.log("반려견 등록 성공:", result);

        // ✅ localStorage의 user 정보도 최신화 (백업용)
        localStorage.setItem("user", JSON.stringify({
          userid: user.userid,
          name: user.name
        }));

        setMsg("반려견 정보 저장 완료!");
        
        // 잠시 후 홈으로 이동
        setTimeout(() => {
          navigate("/home");
        }, 500);
      } else {
        const errorText = await response.text();
        console.error("저장 실패:", errorText);
        setMsg("저장에 실패했습니다: " + errorText);
      }
    } catch (e) {
      console.error("반려견 등록 에러:", e);
      setMsg("서버에 연결할 수 없습니다.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ 로딩 중일 때
  if (loading) {
    return (
      <div className="authPage">
        <div className="authTop">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

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