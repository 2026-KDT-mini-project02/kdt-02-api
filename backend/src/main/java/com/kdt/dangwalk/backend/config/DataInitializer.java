package com.kdt.dangwalk.backend.config;

import com.kdt.dangwalk.backend.entity.CommunityPost;
import com.kdt.dangwalk.backend.repository.CommunityPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CommunityPostRepository postRepository;

    @Override
    public void run(String... args) {
        if (postRepository.count() > 0) {
            return;
        }

        CommunityPost post1 = new CommunityPost();
        post1.setCategory("산책 친구");
        post1.setTitle("같이 저녁 산책하실 분 구해요 🐶");
        post1.setContent("저희 용이(골든리트리버, 3살)랑 같이 산책할 친구 구합니다!\n매일 저녁 7시쯤 근처 공원에서 산책해요.\n관심 있으시면 댓글 주세요!");
        post1.setAuthor("강아지러버");
        post1.setUserId("seed_user");
        post1.setPlace("민주구 창천동");
        post1.setTags(List.of("#골든리트리버", "#저녁산책"));
        post1.setLikes(12);

        CommunityPost post2 = new CommunityPost();
        post2.setCategory("모임");
        post2.setTitle("주말 소형견 모임 참여하실 분!");
        post2.setContent("이번 주말 토요일 오전 10시에 반려견 공원에서 소형견 모임 있어요.\n강아지들 사회성 기르기 좋아요!");
        post2.setAuthor("댕댕모임장");
        post2.setUserId("seed_user");
        post2.setPlace("민주구 호차동");
        post2.setTags(List.of("#소형견", "#주말"));
        post2.setLikes(24);

        CommunityPost post3 = new CommunityPost();
        post3.setCategory("나눔");
        post3.setTitle("강아지 옷 나눔합니다");
        post3.setContent("사이즈 M 위주로 몇 벌 있어요.\n깨끗하고 상태 좋아요! 필요하신 분 댓글 주세요.");
        post3.setAuthor("나눔천사");
        post3.setUserId("seed_user");
        post3.setPlace("민주구 창천동");
        post3.setTags(List.of("#나눔", "#강아지옷"));
        post3.setLikes(7);

        postRepository.saveAll(List.of(post1, post2, post3));
    }
}
