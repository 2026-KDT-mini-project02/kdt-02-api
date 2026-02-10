package com.kdt.dangwalk.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@Slf4j
@Service
public class SseService {

    private final Sinks.Many<SseEvent> sink = Sinks.many().multicast().onBackpressureBuffer();

    /**
     * 클라이언트가 구독하면 Flux<ServerSentEvent> 스트림을 반환.
     * Sink에 데이터가 emit되면 즉시 모든 구독자에게 push됨.
     */
    public Flux<ServerSentEvent<Object>> subscribe() {
        return Flux.concat(
                // 연결 즉시 더미 이벤트 전송 (연결 확인용)
                Flux.just(ServerSentEvent.<Object>builder()
                        .event("connect")
                        .data("connected")
                        .build()),
                // 이후 실시간 이벤트 스트림
                sink.asFlux().map(event -> ServerSentEvent.<Object>builder()
                        .event(event.name())
                        .data(event.data())
                        .build())
        );
    }

    public void broadcast(String eventName, Object data) {
        Sinks.EmitResult result = sink.tryEmitNext(new SseEvent(eventName, data));
        log.debug("SSE 브로드캐스트: event={}, result={}", eventName, result);
    }

    private record SseEvent(String name, Object data) {}
}
