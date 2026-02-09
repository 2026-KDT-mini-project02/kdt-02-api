import { useMemo, useState } from "react";
import BottomNav from "../../components/ui/BottomNav/BottomNav";
import SearchBar from "../../components/ui/SearchBar/SearchBar";
import FilterChips from "../../components/ui/FilterChips/FilterChips";
import styles from "./Community.module.css";

const TABS = ["전체", "산책 친구", "모임", "나눔"];

const SUGGESTIONS = ["산책 친구", "모임", "나눔", "근처 공원", "강아지 옷 나눔", "댕친구"];

const MOCK_POSTS = [
  {
    id: 1,
    type: "산책 친구",
    title: "같이 저녁 산책하실 분 구해요 🐶",
    content:
      "저희 용이(골든리트리버, 3살)랑 같이 산책할 친구 구합니다! 매일 저녁 7시쯤 근처 공원에서 ...",
    tags: ["#골든리트리버", "#저녁산책"],
    place: "민주구 창천동",
    timeAgo: "10분 전",
    likes: 12,
    comments: 8,
  },
  {
    id: 2,
    type: "모임",
    title: "주말 소형견 모임 참여하실 분!",
    content:
      "이번 주말 토요일 오전 10시에 반려견 공원에서 소형견 모임 있어요. 강아지들 사회성 기르기 ...",
    tags: ["#소형견", "#주말"],
    place: "민주구 호차동",
    timeAgo: "1시간 전",
    likes: 24,
    comments: 15,
  },
  {
    id: 3,
    type: "나눔",
    title: "강아지 옷 나눔합니다",
    content:
      "사이즈 M 위주로 몇 벌 있어요. 깨끗하고 상태 좋아요! 필요하신 분 댓글 주세요.",
    tags: ["#나눔", "#강아지옷"],
    place: "민주구 창천동",
    timeAgo: "2시간 전",
    likes: 7,
    comments: 3,
  },
];

function typeBadgeClass(type) {
  if (type === "산책 친구") return styles.badgeWalk;
  if (type === "모임") return styles.badgeMeet;
  return styles.badgeShare;
}

export default function Community() {
  const [keyword, setKeyword] = useState("");
  const [tab, setTab] = useState("전체");

  const filtered = useMemo(() => {
    const q = keyword.trim();
    return MOCK_POSTS.filter((p) => {
      const matchTab = tab === "전체" ? true : p.type === tab;
      const matchQ =
        q === "" ? true : (p.title + p.content + p.tags.join(" ")).includes(q);
      return matchTab && matchQ;
    });
  }, [keyword, tab]);

  const handleSearch = (text) => {
    setKeyword(text);
  };

  const onCreate = () => {
    alert("글쓰기(추후 /community/write 로 이동)");
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
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
          {filtered.map((post) => (
            <div key={post.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={`${styles.badge} ${typeBadgeClass(post.type)}`}>
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

        <BottomNav />
      </div>
    </div>
  );
}
