import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "../../../components/ui/BottomNav/BottomNav";
import styles from "./CommunityDetail.module.css";

const MOCK_POSTS = [
  {
    id: 1,
    type: "산책 친구",
    title: "같이 저녁 산책하실 분 구해요 🐶",
    content:
      "저희 용이(골든리트리버, 3살)랑 같이 산책할 친구 구합니다!\n매일 저녁 7시쯤 근처 공원에서 산책해요.\n관심 있으시면 댓글 주세요!",
    tags: ["#골든리트리버", "#저녁산책"],
    place: "민주구 창천동",
    timeAgo: "10분 전",
    likes: 12,
    author: "강아지러버",
  },
  {
    id: 2,
    type: "모임",
    title: "주말 소형견 모임 참여하실 분!",
    content:
      "이번 주말 토요일 오전 10시에 반려견 공원에서 소형견 모임 있어요.\n강아지들 사회성 기르기 좋아요!",
    tags: ["#소형견", "#주말"],
    place: "민주구 호차동",
    timeAgo: "1시간 전",
    likes: 24,
    author: "댕댕모임장",
  },
  {
    id: 3,
    type: "나눔",
    title: "강아지 옷 나눔합니다",
    content:
      "사이즈 M 위주로 몇 벌 있어요.\n깨끗하고 상태 좋아요! 필요하신 분 댓글 주세요.",
    tags: ["#나눔", "#강아지옷"],
    place: "민주구 창천동",
    timeAgo: "2시간 전",
    likes: 7,
    author: "나눔천사",
  },
];

export default function CommunityDetail() {
  const nav = useNavigate();
  const { id } = useParams();
  const postId = Number(id);

  const post = useMemo(() => MOCK_POSTS.find((p) => p.id === postId), [postId]);

  const [commentText, setCommentText] = useState("");
  const [commentList, setCommentList] = useState([
    { id: 1, name: "댕댕이집사", time: "2시간 전", text: "저도 관심있어요! 연락 주세요~" },
    { id: 2, name: "강아지사랑", time: "5시간 전", text: "좋은 정보 감사합니다!" },
  ]);

  const onAddComment = () => {
    const t = commentText.trim();
    if (!t) return;
    setCommentList((prev) => [{ id: Date.now(), name: "나", time: "방금", text: t }, ...prev]);
    setCommentText("");
  };

  if (!post) {
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
        </div>

        <div className={styles.body}>
          <div className={styles.badge}>{post.type}</div>
          <div className={styles.title}>{post.title}</div>

          <div className={styles.profileRow}>
            <div className={styles.avatar}>{post.author?.[0] || "댕"}</div>
            <div className={styles.profileText}>
              <div className={styles.author}>{post.author}</div>
              <div className={styles.meta}>
                📍 {post.place} · ⏱ {post.timeAgo}
              </div>
            </div>
          </div>

          <div className={styles.content}>{post.content}</div>

          <div className={styles.tagRow}>
            {post.tags.map((t) => (
              <span key={t} className={styles.tag}>
                {t}
              </span>
            ))}
          </div>

          <div className={styles.actions}>
            <div className={styles.actionItem}>♡ 좋아요 {post.likes}</div>
            <div className={styles.actionItem}>💬 댓글 {commentList.length}</div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.commentTitle}>댓글 {commentList.length}</div>

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
