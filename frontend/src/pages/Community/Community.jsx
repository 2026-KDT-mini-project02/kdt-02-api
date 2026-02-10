import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BottomNav from "../../components/ui/BottomNav/BottomNav";
import SearchBar from "../../components/ui/SearchBar/SearchBar";
import FilterChips from "../../components/ui/FilterChips/FilterChips";
import CommunityWrite from "./CommunityWrite/CommunityWrite";
import styles from "./Community.module.css";

const TABS = ["전체", "산책 친구", "모임", "나눔"];

const SUGGESTIONS = [
  "산책 친구",
  "모임",
  "나눔",
  "근처 공원",
  "강아지 옷 나눔",
  "댕친구",
];


function typeBadgeClass(type, styles) {
  if (type === "산책 친구") return styles.badgeWalk;
  if (type === "모임") return styles.badgeMeet;
  return styles.badgeShare;
}

export default function Community() {
  const nav = useNavigate();
  const location = useLocation();

  const [keyword, setKeyword] = useState("");
  const [tab, setTab] = useState("전체");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 글쓰기 모달 on/off
  const [openWrite, setOpenWrite] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab && tab !== "전체") params.set("category", tab);
      if (keyword.trim()) params.set("keyword", keyword.trim());

      const res = await fetch(`http://localhost:8080/api/community?${params.toString()}`);
      if (!res.ok) throw new Error("게시글 조회 실패");
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [keyword, tab]);

  // keyword, tab 변경 또는 페이지 복귀(location.key 변화) 시 자동 재조회
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, location.key]);

  // SSE 실시간 구독: 다른 세션에서 변경이 발생하면 즉시 UI 반영
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8080/api/community/subscribe", {
      withCredentials: true,
    });

    // 새 글 작성 → 목록 맨 위에 추가
    eventSource.addEventListener("post-created", (e) => {
      const newPost = JSON.parse(e.data);
      setPosts((prev) => [newPost, ...prev]);
    });

    // 글 수정 → 해당 항목 교체
    eventSource.addEventListener("post-updated", (e) => {
      const updated = JSON.parse(e.data);
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    });

    // 글 삭제 → 목록에서 제거
    eventSource.addEventListener("post-deleted", (e) => {
      const { id } = JSON.parse(e.data);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    });

    // 좋아요/취소 → 해당 게시글 좋아요 수 즉시 반영
    eventSource.addEventListener("post-liked", (e) => {
      const { id, likes } = JSON.parse(e.data);
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes } : p)));
    });
    eventSource.addEventListener("post-unliked", (e) => {
      const { id, likes } = JSON.parse(e.data);
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes } : p)));
    });

    // 댓글 추가 → 댓글 수 +1
    eventSource.addEventListener("comment-added", (e) => {
      const { postId } = JSON.parse(e.data);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p))
      );
    });

    // 댓글 삭제 → 댓글 수 -1
    eventSource.addEventListener("comment-deleted", (e) => {
      const { postId } = JSON.parse(e.data);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: Math.max((p.comments || 0) - 1, 0) } : p
        )
      );
    });

    eventSource.onerror = () => {
      console.log("SSE 연결 끊김, 재연결 시도 중...");
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleSearch = (text) => setKeyword(text);

  // 페이지 이동 X → 모달 열기
  const onCreate = () => setOpenWrite(true);

  // 작성 완료 payload 받는 곳
  const handleSubmitPost = async (payload) => {
    try {
      const res = await fetch("http://localhost:8080/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("게시글 작성 실패");
      
      // 모달 닫기
      setOpenWrite(false);
      
      // 게시글 목록 즉시 재조회
      await fetchPosts();
    } catch (error) {
      console.error(error);
      alert("게시글 작성에 실패했습니다.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* 상단 */}
        <div className={styles.topArea}>
          <div className={styles.header}>
            <div className={styles.title}>우리 동네 댕댕이</div>
            <div className={styles.sub}>반려견 친구를 찾고 정보를 나눠요</div>
          </div>

          <SearchBar
            value={keyword}
            onChange={setKeyword}
            onSearch={handleSearch}
            placeholder="검색어를 입력하세요"
            suggestions={SUGGESTIONS}
            storageKey="dangwalk_recent_community"
          />

          <FilterChips items={TABS} value={tab} onChange={setTab} />
        </div>

        {/* 리스트 */}
        <div className={styles.list}>
          {loading && <div className={styles.empty}>불러오는 중...</div>}
          {!loading && posts.length === 0 && (
            <div className={styles.empty}>게시글이 없습니다.</div>
          )}
          {!loading && posts.map((post) => (
            <div
              key={post.id}
              className={styles.card}
              role="button"
              tabIndex={0}
              onClick={() => nav(`/community/${post.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter") nav(`/community/${post.id}`);
              }}
            >
              <div className={styles.cardTop}>
                <span
                  className={`${styles.badge} ${typeBadgeClass(post.type, styles)}`}
                >
                  {post.type}
                </span>
              </div>

              <div className={styles.cardTitle}>{post.title}</div>
              <div className={styles.cardContent}>{post.content}</div>

              <div className={styles.tagRow}>
                {post.tags.map((t) => (
                  <span key={t} className={styles.tag}>
                    {t}
                  </span>
                ))}
              </div>

              <div className={styles.metaRow}>
                <div className={styles.metaLeft}>
                  <span className={styles.metaItem}>📍 {post.place}</span>
                  <span className={styles.dot}>•</span>
                  <span className={styles.metaItem}>⏱ {post.timeAgo}</span>
                </div>
                <div className={styles.metaRight}>
                  <span className={styles.metaIcon}>♡ {post.likes}</span>
                  <span className={styles.metaIcon}>💬 {post.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 글쓰기 FAB */}
        <button className={styles.fab} onClick={onCreate} aria-label="글쓰기">
          +
        </button>

        <CommunityWrite
          isOpen={openWrite}
          onClose={() => setOpenWrite(false)}
          onSubmit={handleSubmitPost}
        />

        <BottomNav />
      </div>
    </div>
  );
}
