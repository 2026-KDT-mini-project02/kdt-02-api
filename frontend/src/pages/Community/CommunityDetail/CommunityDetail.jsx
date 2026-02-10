import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "../../../components/ui/BottomNav/BottomNav";
import styles from "./CommunityDetail.module.css";


export default function CommunityDetail() {
  const nav = useNavigate();
  const { id } = useParams();
  const postId = Number(id);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editCategory, setEditCategory] = useState("산책 친구");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editPlace, setEditPlace] = useState("");
  const [editTags, setEditTags] = useState("");
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentList, setCommentList] = useState([]);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/community/${postId}`);
        if (!res.ok) throw new Error("게시글 조회 실패");
        const data = await res.json();
        setPost(data);
        setCommentList(data.comments || []);
        setEditCategory(data.type || "산책 친구");
        setEditTitle(data.title || "");
        setEditContent(data.content || "");
        setEditPlace(data.place || "");
        setEditTags((data.tags || []).join(" "));
      } catch (error) {
        console.error(error);
        setPost(null);
        setCommentList([]);
      } finally {
        setLoading(false);
      }
    };

    if (Number.isFinite(postId)) {
      fetchDetail();
    }
  }, [postId]);

  const onAddComment = async () => {
    const name = commentName.trim() || "익명";
    const text = commentText.trim();
    if (!text) return;
    try {
      const res = await fetch(`/api/community/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, text }),
      });
      if (!res.ok) throw new Error("댓글 작성 실패");
      const created = await res.json();
      setCommentList((prev) => [created, ...prev]);
      setCommentText("");
    } catch (error) {
      console.error(error);
      alert("댓글 작성에 실패했습니다.");
    }
  };

  const onLike = async () => {
    try {
      const res = await fetch(`/api/community/${postId}/like`, { method: "POST" });
      if (!res.ok) throw new Error("좋아요 실패");
      const data = await res.json();
      setPost(data);
      setCommentList(data.comments || []);
    } catch (error) {
      console.error(error);
    }
  };

  const onDeletePost = async () => {
    if (!window.confirm("게시글을 삭제할까요?")) return;
    try {
      const res = await fetch(`/api/community/${postId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제 실패");
      nav(-1);
    } catch (error) {
      console.error(error);
      alert("삭제에 실패했습니다.");
    }
  };

  const onDeleteComment = async (commentId) => {
    if (!window.confirm("댓글을 삭제할까요?")) return;
    try {
      const res = await fetch(`/api/community/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("댓글 삭제 실패");
      setCommentList((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error(error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  const onSaveEdit = async () => {
    try {
      const payload = {
        category: editCategory,
        title: editTitle.trim(),
        content: editContent.trim(),
        place: editPlace.trim(),
        tags: editTags
          .split(/[\s,]+/)
          .map((tag) => tag.trim())
          .filter(Boolean),
      };
      if (!payload.title || !payload.content) {
        alert("제목과 내용을 입력해주세요.");
        return;
      }
      const res = await fetch(`/api/community/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("수정 실패");
      const updated = await res.json();
      setPost(updated);
      setCommentList(updated.comments || []);
      setEditMode(false);
    } catch (error) {
      console.error(error);
      alert("수정에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.topbar}>
            <button className={styles.backBtn} onClick={() => nav(-1)}>←</button>
            <div className={styles.topTitle}>게시글</div>
          </div>
          <div className={styles.notFound}>불러오는 중...</div>
          <BottomNav />
        </div>
      </div>
    );
  }

  if (!post && !loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.topbar}>
            <button className={styles.backBtn} onClick={() => nav(-1)}>←</button>
            <div className={styles.topTitle}>게시글</div>
          </div>
          <div className={styles.notFound}>게시글을 찾을 수 없어요.</div>
          <BottomNav />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topbar}>
          <button className={styles.backBtn} onClick={() => nav(-1)} aria-label="뒤로">
            ←
          </button>
          <div className={styles.topTitle}>게시글</div>
          <button
            className={styles.editBtn}
            onClick={() => setEditMode((prev) => !prev)}
          >
            {editMode ? "취소" : "수정"}
          </button>
          <button className={styles.deleteBtn} onClick={onDeletePost}>
            삭제
          </button>
        </div>

        <div className={styles.body}>
          {editMode ? (
            <div className={styles.editBox}>
              <select
                className={styles.editSelect}
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              >
                <option value="산책 친구">산책 친구</option>
                <option value="모임">모임</option>
                <option value="나눔">나눔</option>
              </select>
              <input
                className={styles.editInput}
                placeholder="제목"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
          ) : (
            <>
              <div className={styles.badge}>{post.type}</div>
              <div className={styles.title}>{post.title}</div>
            </>
          )}

          <div className={styles.profileRow}>
            <div className={styles.avatar}>{post.author?.[0] || "댕"}</div>
            <div className={styles.profileText}>
              <div className={styles.author}>{post.author}</div>
              <div className={styles.meta}>
                📍 {post.place} · ⏱ {post.timeAgo}
              </div>
            </div>
          </div>

          {editMode ? (
            <textarea
              className={styles.editTextarea}
              placeholder="내용"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
          ) : (
            <div className={styles.content}>{post.content}</div>
          )}

          {editMode && (
            <div className={styles.editExtra}>
              <input
                className={styles.editInput}
                placeholder="위치 (선택)"
                value={editPlace}
                onChange={(e) => setEditPlace(e.target.value)}
              />
              <input
                className={styles.editInput}
                placeholder="태그 (띄어쓰기/콤마 구분)"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
              />
              <button className={styles.saveBtn} onClick={onSaveEdit}>
                수정 저장
              </button>
            </div>
          )}

          <div className={styles.tagRow}>
            {post.tags.map((t) => (
              <span key={t} className={styles.tag}>
                {t}
              </span>
            ))}
          </div>

          <div className={styles.actions}>
            <button className={styles.actionItem} onClick={onLike}>
              ♡ 좋아요 {post.likes}
            </button>
            <div className={styles.actionItem}>💬 댓글 {commentList.length}</div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.commentTitle}>댓글 {commentList.length}</div>

          <div className={styles.commentInputRow}>
            <input
              className={styles.commentInput}
              placeholder="닉네임"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
            />
          </div>
          <div className={styles.commentInputRow}>
            <input
              className={styles.commentInput}
              placeholder="댓글을 입력하세요"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onAddComment();
              }}
            />
            <button className={styles.commentBtn} onClick={onAddComment}>
              작성
            </button>
          </div>

          <div className={styles.commentList}>
            {commentList.map((c) => (
              <div key={c.id} className={styles.commentItem}>
                <div className={styles.cAvatar}>{c.name[0]}</div>
                <div className={styles.cBody}>
                  <div className={styles.cTop}>
                    <span className={styles.cName}>{c.name}</span>
                    <span className={styles.cTime}>{c.time}</span>
                    <button
                      className={styles.commentDelete}
                      onClick={() => onDeleteComment(c.id)}
                    >
                      삭제
                    </button>
                  </div>
                  <div className={styles.cText}>{c.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
