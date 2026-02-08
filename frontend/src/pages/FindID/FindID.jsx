import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/authCommon.css";
import "./FindID.css";

import IconTile from "../../components/ui/IconTile/IconTile";
import TextField from "../../components/ui/TextField/TextField";
import Button from "../../components/ui/Button/Button";

export default function FindID() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  const onFindId = () => {
    setMsg("");
    if (!email || !name) {
      setMsg("이메일과 이름을 입력해주세요.");
      return;
    }
    setMsg("아이디 찾기 요청 준비 완료");
  };

  return (
    <div className="authPage">
      <div className="authTop">
        <IconTile src="/icon.png" alt="로고" />
        <h1 className="findIdTitle">아이디를 잊으셨나요?</h1>
        <p className="findIdSub">가입 시 입력한 정보로 아이디를 찾을 수 있습니다</p>
      </div>

      <div className="authForm">
        <TextField placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} />
        <TextField placeholder="이름" value={name} onChange={e => setName(e.target.value)} />
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
