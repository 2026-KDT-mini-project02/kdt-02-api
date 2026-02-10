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

    // ✅ 유효성 검사 추가
    if (!userId.trim()) {
      setErrorMsg("아이디를 입력해주세요.");
      return;
    }

    if (!userPw.trim()) {
      setErrorMsg("비밀번호를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ 세션 쿠키를 받기 위해 필수!
        body: JSON.stringify({ userId, password: userPw }),
      });

      // 1. 서버 응답이 실패(400, 401, 404 등)했을 때
      if (!res.ok) {
        const errorText = await res.text(); // 서버가 보낸 에러 메시지 읽기
        setErrorMsg(errorText || "로그인 실패");
        return;
      }

      // 2. 서버 응답이 성공했을 때 (유저 객체 받기)
      const userData = await res.json(); 

      console.log("로그인 성공:", userData);

      // 3. 로컬 스토리지에 유저 정보 저장 (백업용, 세션이 메인)
      localStorage.setItem("user", JSON.stringify(userData));

      // 4. 성공 시 이동
      navigate("/home");
      
    } catch (e) {
      console.error("로그인 에러:", e);
      setErrorMsg("서버에 연결할 수 없습니다.");
    }
  };

  // ✅ Enter 키로 로그인 가능하게
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendToBackend();
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
          onKeyPress={handleKeyPress}
        />
        <TextField
          placeholder="비밀번호"
          type="password"
          value={userPw}
          onChange={(e) => setUserPw(e.target.value)}
          onKeyPress={handleKeyPress}
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