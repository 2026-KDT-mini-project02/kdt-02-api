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
