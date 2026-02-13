import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import axios from "axios";
import PhotoSpotOverlay from "./PhotoSpotOverlay";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const DEFAULT_RADIUS_METER = 1000;

function loadKakaoMapScript() {
  return new Promise((resolve, reject) => {
    const key = process.env.REACT_APP_KAKAO_JS_KEY;
    if (!key) {
      reject(new Error("Missing REACT_APP_KAKAO_JS_KEY"));
      return;
    }

    if (window.kakao?.maps) {
      resolve();
      return;
    }

    const existingScript = document.querySelector("script[data-kakao-map='1']");
    if (existingScript) {
      existingScript.addEventListener("load", () => window.kakao.maps.load(resolve), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Kakao SDK")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.dataset.kakaoMap = "1";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
    script.async = true;
    script.onload = () => window.kakao.maps.load(resolve);
    script.onerror = () => reject(new Error("Failed to load Kakao SDK"));
    document.head.appendChild(script);
  });
}

function getMapCenter(map) {
  const center = map.getCenter();
  return { lat: center.getLat(), lng: center.getLng() };
}

const MapView = forwardRef(function MapView(
  { keyword, activeCat, location, photoSpots, onClickPhotoSpot, mapClassName },
  ref
) {
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef(null);
  const mapObjRef = useRef(null);

  const myMarkerRef = useRef(null);
  const placeMarkersRef = useRef([]);
  const placeInfoRef = useRef([]);
  const fetchInFlightRef = useRef(false);

  useImperativeHandle(ref, () => ({
    getCenter: () => {
      if (!mapObjRef.current) return null;
      return getMapCenter(mapObjRef.current);
    },
  }));

  const clearPlaceMarkers = useCallback(() => {
    placeMarkersRef.current.forEach((marker) => marker.setMap(null));
    placeMarkersRef.current = [];
    placeInfoRef.current.forEach((infoWindow) => infoWindow.close());
    placeInfoRef.current = [];
  }, []);

  const renderPlaceMarkers = useCallback(
    (places) => {
      if (!mapObjRef.current || !window.kakao?.maps) return;

      const map = mapObjRef.current;
      const { kakao } = window;

      clearPlaceMarkers();

      places.forEach((place) => {
        if (typeof place?.lat !== "number" || typeof place?.lng !== "number") return;

        const position = new kakao.maps.LatLng(place.lat, place.lng);
        const marker = new kakao.maps.Marker({ position, map });
        const info = new kakao.maps.InfoWindow({
          content: `<div style="padding:6px 10px;font-size:12px;">${place.name ?? "Place"}</div>`,
        });

        kakao.maps.event.addListener(marker, "click", () => {
          placeInfoRef.current.forEach((item) => item.close());
          info.open(map, marker);
        });

        placeMarkersRef.current.push(marker);
        placeInfoRef.current.push(info);
      });
    },
    [clearPlaceMarkers]
  );

  const fetchNearbyPlaces = useCallback(
    async (lat, lng) => {
      if (!mapObjRef.current || fetchInFlightRef.current) return;
      fetchInFlightRef.current = true;

      try {
        const response = await axios.get("/api/places/nearby", {
          params: {
            lat,
            lng,
            radius: DEFAULT_RADIUS_METER,
            keyword,
            category: activeCat,
          },
          withCredentials: true,
        });
        renderPlaceMarkers(Array.isArray(response.data) ? response.data : []);
      } catch (fetchError) {
        console.error("Failed to fetch nearby places:", fetchError);
      } finally {
        fetchInFlightRef.current = false;
      }
    },
    [activeCat, keyword, renderPlaceMarkers]
  );

  useEffect(() => {
    let cancelled = false;

    loadKakaoMapScript()
      .then(() => {
        if (cancelled || !mapRef.current) return;

        const { kakao } = window;
        const initialCenter = new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
        const map = new kakao.maps.Map(mapRef.current, {
          center: initialCenter,
          level: 4,
          draggable: true,
        });

        mapObjRef.current = map;
        setMapReady(true);

        setTimeout(() => {
          if (!cancelled) map.relayout();
        }, 0);
      })
      .catch(console.error);

    return () => {
      cancelled = true;
      clearPlaceMarkers();
      if (myMarkerRef.current) myMarkerRef.current.setMap(null);
    };
  }, [clearPlaceMarkers]);

  useEffect(() => {
    if (!mapReady || !mapObjRef.current || !location || !window.kakao?.maps) return;

    const map = mapObjRef.current;
    const { kakao } = window;
    const currentPosition = new kakao.maps.LatLng(location.lat, location.lng);

    map.setCenter(currentPosition);

    if (!myMarkerRef.current) {
      myMarkerRef.current = new kakao.maps.Marker({ position: currentPosition, map });
    } else {
      myMarkerRef.current.setPosition(currentPosition);
    }

    fetchNearbyPlaces(location.lat, location.lng);
  }, [fetchNearbyPlaces, location, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapObjRef.current || !window.kakao?.maps) return;

    const map = mapObjRef.current;
    const { kakao } = window;

    const onIdle = () => {
      const center = getMapCenter(map);
      fetchNearbyPlaces(center.lat, center.lng);
    };

    kakao.maps.event.addListener(map, "idle", onIdle);
    return () => kakao.maps.event.removeListener(map, "idle", onIdle);
  }, [fetchNearbyPlaces, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapObjRef.current) return;
    const center = getMapCenter(mapObjRef.current);
    fetchNearbyPlaces(center.lat, center.lng);
  }, [activeCat, keyword, fetchNearbyPlaces, mapReady]);

  return (
    <>
      <div ref={mapRef} className={mapClassName} />

      <PhotoSpotOverlay
        map={mapObjRef.current}
        spots={photoSpots}
        onClickSpot={onClickPhotoSpot}
      />
    </>
  );
});

export default MapView;