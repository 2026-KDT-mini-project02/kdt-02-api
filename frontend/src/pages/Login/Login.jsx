import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/authCommon.css";
import "./Login.css";

import TextField from "../../components/ui/TextField/TextField";
import Button from "../../components/ui/Button/Button";
import IconTile from "../../components/ui/IconTile/IconTile";

export default function Login() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const sendToBackend = async () => {
    setErrorMsg("");

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, password: userPw }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.message || "로그인 실패");
        return;
      }

      navigate("/home");
    } catch (e) {
      setErrorMsg("서버에 연결할 수 없습니다.");
    }
  };

  return (
    <div className="authPage">
      <div className="authTop">
        <IconTile src="/icon.png" alt="로고이미지" />
        <h1 className="loginTitle">댕산책</h1>
        <p className="loginSub">강아지와 함께하는 행복한 산책</p>
      </div>

      <div className="authForm">
        <TextField
          placeholder="아이디"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <TextField
          placeholder="비밀번호"
          type="password"
          value={userPw}
          onChange={(e) => setUserPw(e.target.value)}
        />
      </div>

      {errorMsg && <p className="authMsg">{errorMsg}</p>}

      <div className="authBtns">
        <Button onClick={sendToBackend}>로그인</Button>
        <Button variant="outline" onClick={() => navigate("/signup")}>
          회원가입
        </Button>
      </div>

      <div className="loginLinks">
        <button className="linkBtn" onClick={() => navigate("/find-id")}>
          아이디 찾기
        </button>
        <span className="sep">|</span>
        <button className="linkBtn" onClick={() => navigate("/find-pw")}>
          비밀번호 찾기
        </button>
      </div>

      <p className="authFooter">© 2026 KDT 2조 All rights reserved.</p>
    </div>
  );
}
