import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "../../styles/authCommon.css";
import "./FindID.css";

import IconTile from "../../components/ui/IconTile/IconTile";
import TextField from "../../components/ui/TextField/TextField";
import Button from "../../components/ui/Button/Button";

import { API_BASE } from "../../api/api";

export default function FindID() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  const onFindId = async () => {
    setMsg("");

    if (!email || !name) {
      setMsg("이메일과 이름을 입력해주세요.");
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/api/auth/find-id`, {
        params: { name, email },
        withCredentials: true, // 세션/쿠키 흐름이면 맞춰두는 게 안전(필요없으면 제거 가능)
      });

      setMsg(`찾으시는 아이디는 [ ${response.data} ] 입니다.`);
    } catch (error) {
      if (error.response?.status === 404) {
        setMsg("일치하는 회원 정보가 없습니다.");
      } else {
        setMsg("서버 통신 중 오류가 발생했습니다.");
      }
      console.error(error);
    }
  };

  return (
    <div className="authPage">
      <div className="authTop">
        <IconTile src="/icon.png" alt="로고" />
        <h1 className="findIdTitle">아이디를 잊으셨나요?</h1>
        <p className="findIdSub">
          가입 시 입력한 정보로 아이디를 찾을 수 있습니다
        </p>
      </div>

      <div className="authForm">
        <TextField
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {msg && <p className="authMsg">{msg}</p>}

      <div className="authBtns">
        <Button onClick={onFindId}>아이디 찾기</Button>
      </div>

      <div className="findIdLinks">
        <span className="muted">비밀번호가 기억나지 않으신가요?</span>
        <button className="linkBtn" onClick={() => navigate("/find-pw")}>
          비밀번호 찾기
        </button>
      </div>

      <div className="backRow">
        <button className="linkBtn" onClick={() => navigate("/")}>
          로그인 화면
        </button>
        <span className="backText">으로 돌아가기</span>
      </div>

      <p className="authFooter">© 2026 KDT 2조</p>
    </div>
  );
}
