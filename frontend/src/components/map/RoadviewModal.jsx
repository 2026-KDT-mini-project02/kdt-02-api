import { useEffect, useRef } from "react";

export default function RoadviewModal({ spot, onClose }) {
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const roadviewRef = useRef(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    if (!spot || !containerRef.current) return;
    if (!window.kakao?.maps) return;

    const { kakao } = window;

    const rv = new kakao.maps.Roadview(containerRef.current);
    roadviewRef.current = rv;
    const rvClient = new kakao.maps.RoadviewClient();
    const position = new kakao.maps.LatLng(spot.lat, spot.lng);

    const relayoutRoadview = () => {
      if (!roadviewRef.current) return;
      roadviewRef.current.relayout();
    };

    requestAnimationFrame(() => {
      relayoutRoadview();
      requestAnimationFrame(relayoutRoadview);
    });

    rvClient.getNearestPanoId(position, 50, (panoId) => {
      if (!panoId) {
        console.warn("No roadview panoId nearby");
        return;
      }
      rv.setPanoId(panoId, position);
      requestAnimationFrame(relayoutRoadview);
    });

    const makeOverlay = () => {
      if (overlayRef.current) overlayRef.current.setMap(null);

      const wrap = document.createElement("div");
      wrap.style.transform = "translate(-50%, -50%)";
      wrap.style.pointerEvents = "none";

      const img = document.createElement("img");
      img.src = spot.imgUrl;
      img.alt = "my photo in roadview";
      img.style.width = "140px";
      img.style.height = "140px";
      img.style.borderRadius = "16px";
      img.style.objectFit = "cover";
      img.style.border = "3px solid white";
      img.style.boxShadow = "0 10px 24px rgba(0,0,0,0.35)";
      img.style.pointerEvents = "none";

      wrap.appendChild(img);

      const ov = new kakao.maps.CustomOverlay({
        position,
        content: wrap,
        xAnchor: 0.5,
        yAnchor: 0.5,
        clickable: false,
      });

      ov.setMap(rv);
      overlayRef.current = ov;

      // 중앙에 가깝게 시점 보정(가능할 때만)
      try {
        const projection = rv.getProjection();
        const viewpoint = projection.viewpointFromCoords(ov.getPosition(), ov.getAltitude());
        rv.setViewpoint(viewpoint);
      } catch {}
    };

    kakao.maps.event.addListener(rv, "init", makeOverlay);
    window.addEventListener("resize", relayoutRoadview);

    return () => {
      window.removeEventListener("resize", relayoutRoadview);
      kakao.maps.event.removeListener(rv, "init", makeOverlay);
      if (overlayRef.current) overlayRef.current.setMap(null);
      overlayRef.current = null;
      roadviewRef.current = null;
    };
  }, [spot]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        style={{
          width: "min(900px, 100%)",
          height: "min(700px, 80vh)",
          background: "white",
          borderRadius: 16,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 10,
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "6px 10px",
            background: "white",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          닫기
        </button>

        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "100%",
            touchAction: "none",
            overscrollBehavior: "contain",
            WebkitUserSelect: "none",
            userSelect: "none",
          }}
        />
      </div>
    </div>
  );
}
