import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "../../styles/authCommon.css";
import "../FindID/FindID.css";

import IconTile from "../../components/ui/IconTile/IconTile";
import TextField from "../../components/ui/TextField/TextField";
import Button from "../../components/ui/Button/Button";

import { API_BASE } from "../../api/api";

export default function FindPW() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [userid, setUserid] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const onResetPassword = async () => {
    setMsg("");

    if (!email || !userid || !newPassword) {
      setMsg("모든 정보를 입력해주세요.");
      return;
    }

    if (newPassword.length < 8) {
      setMsg("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/api/auth/reset-pw`,
        {
          userid,
          email,
          newPassword,
        },
        {
          withCredentials: true,
        },
      );

      if (response.status === 200) {
        alert("비밀번호가 성공적으로 재설정되었습니다. 다시 로그인해주세요!");
        navigate("/");
      }
    } catch (error) {
      setMsg(error.response?.data || "일치하는 회원 정보가 없습니다.");
    }
  };

  return (
    <div className="authPage">
      <div className="authTop">
        <IconTile src="/icon.png" alt="로고" />
        <h1 className="findIdTitle">비밀번호 재설정</h1>
        <p className="findIdSub">
          본인 확인 후 새로운 비밀번호를 설정할 수 있습니다
        </p>
      </div>

      <div className="authForm">
        <TextField
          placeholder="아이디"
          value={userid}
          onChange={(e) => setUserid(e.target.value)}
        />
        <TextField
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          placeholder="새 비밀번호 (8자 이상)"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      {msg && <p className="authMsg">{msg}</p>}

      <div className="authBtns">
        <Button onClick={onResetPassword}>비밀번호 변경하기</Button>
      </div>

      <div className="findIdLinks">
        <span className="muted">아이디가 기억나지 않으신가요?</span>
        <button className="linkBtn" onClick={() => navigate("/find-id")}>
          아이디 찾기
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
