import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/authCommon.css";
import "./Signup.css";

import IconTile from "../../components/ui/IconTile/IconTile";
import TextField from "../../components/ui/TextField/TextField";
import Button from "../../components/ui/Button/Button";

const API = "http://localhost:8080"; // 한 곳에서만 관리

export default function Signup() {
  const navigate = useNavigate();

  // 폼 값들
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [phone, setPhone] = useState("");

  // 약관
  const [agreeService, setAgreeService] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  // 화면 메시지
  const [msg, setMsg] = useState("");

  // 아이디 중복확인 상태
  const [idChecked, setIdChecked] = useState(false);
  const [idOk, setIdOk] = useState(false);
  const [idMsg, setIdMsg] = useState("");
  const [checking, setChecking] = useState(false);

  // 가입 처리 로딩(중복 제출 방지)
  const [signing, setSigning] = useState(false);

  const bind = (setter) => (e) => setter(e.target.value);

  // 아이디 유효성: 4~16자, 영문/숫자/_
  const isValidUserId = (v) => /^[a-zA-Z0-9_]{4,16}$/.test(v.trim());

  // 버튼 활성 조건
  const canCheckId = isValidUserId(userId) && !checking;

  const requiredOk = [name, userId, email, pw, pw2].every((v) => v.trim());
  const canSignup =
    requiredOk &&
    idChecked &&
    idOk &&
    pw.length >= 8 &&
    pw === pw2 &&
    agreeService &&
    agreePrivacy &&
    !signing;

  // 아이디 입력 변경 (중복확인 결과 초기화)
  const onChangeUserId = (e) => {
    setUserId(e.target.value);
    setIdChecked(false);
    setIdOk(false);
    setIdMsg("");
  };

  // 중복확인 API 호출
  const checkUserId = async () => {
    const v = userId.trim();
    setIdMsg("");

    if (!v) {
      setIdChecked(true);
      setIdOk(false);
      setIdMsg("아이디를 입력해주세요.");
      return;
    }

    if (!isValidUserId(v)) {
      setIdChecked(true);
      setIdOk(false);
      setIdMsg("아이디는 4~16자, 영문/숫자/_ 만 가능합니다.");
      return;
    }

    setChecking(true);
    try {
      const res = await fetch(
        `${API}/api/auth/check-id?userId=${encodeURIComponent(v)}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!res.ok) {
        setIdChecked(true);
        setIdOk(false);
        setIdMsg("중복확인 실패(서버 오류)");
        return;
      }

      // 1. JSON 값을 가져오되, 실패하면 null을 반환하게 합니다.
      const data = await res.json().catch(() => null);

      // 2. data가 null이 아니고, 값이 정확히 false일 때만 '사용 가능'으로 판단합니다.
      // 백엔드가 준 false(중복없음)를 받았을 때 available이 true가 됩니다.
      const available = data === false;

      setIdChecked(true);
      setIdOk(available);
      setIdMsg(
        available
          ? "사용 가능한 아이디입니다."
          : "이미 사용 중인 아이디입니다.",
      );
    } catch (e) {
      setIdChecked(true);
      setIdOk(false);
      setIdMsg("서버에 연결할 수 없습니다.");
    } finally {
      setChecking(false);
    }
  };

  const onSignup = async () => {
    setMsg("");

    // 프론트 검증
    if (!requiredOk) return setMsg("필수 항목을 입력해주세요.");
    if (!idChecked || !idOk) return setMsg("아이디 중복확인을 해주세요.");
    if (pw.length < 8) return setMsg("비밀번호는 8자 이상 입력해주세요.");
    if (pw !== pw2) return setMsg("비밀번호가 일치하지 않습니다.");
    if (!agreeService || !agreePrivacy)
      return setMsg("필수 약관에 동의해주세요.");

    setSigning(true);
    try {
      const res = await fetch(`${API}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ 세션 쿠키 받기
        body: JSON.stringify({
          name,
          userid: userId,
          email,
          password: pw,
          phonenumber: phone,
          agreeservice: agreeService,
          agreeprivacy: agreePrivacy,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMsg(data.message || "회원가입 실패");
        return;
      }

      // ✅ 백엔드에서 자동 로그인된 사용자 정보 받기
      const data = await res.json().catch(() => ({}));
      
      console.log("회원가입 성공:", data);

      // ✅ localStorage에 사용자 정보 저장 (백업용)
      localStorage.setItem("user", JSON.stringify({
        userid: data.userid || userId,
        name: data.name || name
      }));

      // ✅ 가입 완료 → 반려견 등록 페이지로 이동
      // 세션이 생성되었으므로 state로 전달할 필요 없음
      navigate("/dogOnboarding");
      
    } catch (e) {
      console.error("회원가입 에러:", e);
      setMsg("서버에 연결할 수 없습니다.");
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authTop">
        <IconTile src="/icon.png" alt="로고이미지" />
        <h1 className="signupTitle">환영합니다!</h1>
        <p className="signupSub">댕댕산책과 함께 행복한 산책을 시작해보세요</p>
      </div>

      <div className="authForm">
        <TextField placeholder="이름" value={name} onChange={bind(setName)} />

        <div className="idRow">
          <div className="idInput">
            <TextField
              placeholder="아이디"
              value={userId}
              onChange={onChangeUserId}
            />
          </div>

          <button
            className={`idCheckBtn ${canCheckId ? "on" : "off"}`}
            type="button"
            onClick={checkUserId}
            disabled={!canCheckId}
          >
            {checking ? "확인중" : "중복확인"}
          </button>
        </div>

        {idMsg && <p className={idOk ? "idMsgOk" : "idMsgBad"}>{idMsg}</p>}

        <TextField
          placeholder="이메일"
          value={email}
          onChange={bind(setEmail)}
        />
        <TextField
          placeholder="비밀번호 (8자 이상)"
          type="password"
          value={pw}
          onChange={bind(setPw)}
        />
        <TextField
          placeholder="비밀번호 확인"
          type="password"
          value={pw2}
          onChange={bind(setPw2)}
        />
        <TextField
          placeholder="휴대폰 번호 (-없이 입력)"
          value={phone}
          onChange={bind(setPhone)}
        />
      </div>

      <div className="agreeBox">
        <label className="agreeRow">
          <input
            type="checkbox"
            checked={agreeService}
            onChange={(e) => setAgreeService(e.target.checked)}
          />
          <span>
            <b>[필수]</b> 서비스 이용약관 동의
          </span>
        </label>

        <label className="agreeRow">
          <input
            type="checkbox"
            checked={agreePrivacy}
            onChange={(e) => setAgreePrivacy(e.target.checked)}
          />
          <span>
            <b>[필수]</b> 개인정보 수집 및 이용 동의
          </span>
        </label>
      </div>

      {msg && <p className="authMsg">{msg}</p>}

      <div className="authBtns">
        <Button onClick={onSignup} disabled={!canSignup}>
          {signing ? "가입중..." : "회원가입"}
        </Button>
      </div>

      <div className="signupBottom">
        <span className="muted">이미 계정이 있으신가요?</span>
        <button
          className="signupLink"
          type="button"
          onClick={() => navigate("/")}
        >
          로그인하기
        </button>
      </div>

      <p className="authFooter">© 2026 KDT 2조 All rights reserved.</p>
    </div>
  );
}