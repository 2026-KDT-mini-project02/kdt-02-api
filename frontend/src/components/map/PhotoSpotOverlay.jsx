import { useEffect, useRef } from "react";

export default function PhotoSpotOverlay({ map, spots, onClickSpot }) {
  const overlaysRef = useRef([]);

  useEffect(() => {
    if (!map || !window.kakao?.maps) return;

    overlaysRef.current.forEach((ov) => ov.setMap(null));
    overlaysRef.current = [];

    const { kakao } = window;

    spots.forEach((spot) => {
      if (typeof spot?.lat !== "number" || typeof spot?.lng !== "number") return;

      const el = document.createElement("button");
      el.type = "button";
      el.style.border = "0";
      el.style.padding = "0";
      el.style.background = "transparent";
      el.style.cursor = "pointer";

      const img = document.createElement("img");
      img.src = spot.imgUrl;
      img.alt = "photo spot";
      img.style.width = "56px";
      img.style.height = "56px";
      img.style.borderRadius = "12px";
      img.style.objectFit = "cover";
      img.style.border = "2px solid white";
      img.style.boxShadow = "0 6px 16px rgba(0,0,0,0.25)";

      el.appendChild(img);
      el.addEventListener("click", () => onClickSpot?.(spot));

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(spot.lat, spot.lng),
        content: el,
        yAnchor: 1.0,
        clickable: true,
      });

      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });

    return () => {
      overlaysRef.current.forEach((ov) => ov.setMap(null));
      overlaysRef.current = [];
    };
  }, [map, spots, onClickSpot]);

  return null;
}
