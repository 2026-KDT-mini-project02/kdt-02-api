import { useEffect, useState } from "react";
import styles from "./CommunityWrite.module.css";

const CATEGORIES = ["산책 친구", "모임", "나눔"];

export default function CommunityWrite({ isOpen, onClose, onSubmit }) {
  const [category, setCategory] = useState("산책 친구");
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [place, setPlace] = useState("");
  const [tags, setTags] = useState("");

  // 열릴 때 초기화(원하면 제거 가능)
  useEffect(() => {
    if (!isOpen) return;
    setCategory("산책 친구");
    setAuthor("");
    setTitle("");
    setContent("");
    setPlace("");
    setTags("");
  }, [isOpen]);

  // 배경 스크롤 막기(모바일 필수)
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // 오버레이 클릭하면 닫기
  const onOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      category,
      author: author.trim() || "익명",
      title: title.trim(),
      content: content.trim(),
      place: place.trim(),
      tags: tags
        .split(/[,\s]+/)
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => (t.startsWith("#") ? t : `#${t}`)),
    };

    if (!payload.title || !payload.content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    onSubmit?.(payload);

    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onOverlayClick}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.topbar}>
          <div className={styles.modalTitle}>게시글 작성</div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>카테고리</label>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label className={styles.label}>작성자</label>
          <input
            className={styles.input}
            placeholder="닉네임"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />

          <label className={styles.label}>제목</label>
          <input
            className={styles.input}
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className={styles.label}>내용</label>
          <textarea
            className={styles.textarea}
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <label className={styles.label}>위치 (선택)</label>
          <input
            className={styles.input}
            placeholder="예: 민주구 창천동"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />

          <label className={styles.label}>태그 (선택)</label>
          <input
            className={styles.input}
            placeholder="#태그를 입력하세요"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={styles.submitBtn}>
              작성하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
