import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/authCommon.css";
import "./Signup.css";

import IconTile from "../../components/ui/IconTile/IconTile";
import TextField from "../../components/ui/TextField/TextField";
import Button from "../../components/ui/Button/Button";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [phone, setPhone] = useState("");

  const [agreeService, setAgreeService] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [msg, setMsg] = useState("");

  const [idChecked, setIdChecked] = useState(false);
  const [idOk, setIdOk] = useState(false);
  const [idMsg, setIdMsg] = useState("");
  const [checking, setChecking] = useState(false);

  const [signing, setSigning] = useState(false);

  const bind = (setter) => (e) => setter(e.target.value);

  const isValidUserId = (v) => /^[a-zA-Z0-9_]{4,16}$/.test(v.trim());

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

  const onChangeUserId = (e) => {
    setUserId(e.target.value);
    setIdChecked(false);
    setIdOk(false);
    setIdMsg("");
  };

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
        `/api/auth/check-id?userId=${encodeURIComponent(v)}`,
        { method: "GET", credentials: "include" },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setIdChecked(true);
        setIdOk(false);
        setIdMsg(data.message || "중복확인 실패(서버 오류)");
        return;
      }

      const exists = await res.json().catch(() => null);

      if (typeof exists !== "boolean") {
        setIdChecked(true);
        setIdOk(false);
        setIdMsg("중복확인 응답 형식 오류");
        return;
      }

      const available = exists === false;

      setIdChecked(true);
      setIdOk(available);
      setIdMsg(
        available ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다.",
      );
    } catch (e) {
      console.log("check-id error:", e);
      setIdChecked(true);
      setIdOk(false);
      setIdMsg("중복확인 실패(콘솔 확인)");
    } finally {
      setChecking(false);
    }
  };

  const onSignup = async () => {
    setMsg("");

    if (!requiredOk) return setMsg("필수 항목을 입력해주세요.");
    if (!idChecked || !idOk) return setMsg("아이디 중복확인을 해주세요.");
    if (pw.length < 8) return setMsg("비밀번호는 8자 이상 입력해주세요.");
    if (pw !== pw2) return setMsg("비밀번호가 일치하지 않습니다.");
    if (!agreeService || !agreePrivacy) return setMsg("필수 약관에 동의해주세요.");

    setSigning(true);
    try {
      const res = await fetch(`/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data.message || "회원가입 실패");
        return;
      }

      navigate("/dogOnboarding", {
        state: { userId: userId, userName: name },
      });
    } catch (e) {
      console.log("signup error:", e);
      setMsg("회원가입 실패(콘솔 확인)");
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
            <TextField placeholder="아이디" value={userId} onChange={onChangeUserId} />
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

        <TextField placeholder="이메일" value={email} onChange={bind(setEmail)} />
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
        <button className="signupLink" type="button" onClick={() => navigate("/")}>
          로그인하기
        </button>
      </div>

      <p className="authFooter">© 2026 KDT 2조 All rights reserved.</p>
    </div>
  );
}
