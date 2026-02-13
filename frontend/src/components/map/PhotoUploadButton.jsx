import { useRef } from "react";

export default function PhotoUploadButton({ onUpload, disabled, loading }) {
  const inputRef = useRef(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onUpload?.(file);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          inputRef.current?.click();
        }}
        style={{
          position: "absolute",
          right: 14,
          bottom: 86,
          zIndex: 10,
          padding: "10px 12px",
          borderRadius: 14,
          border: "1px solid #e5e7eb",
          background: "white",
          boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          fontSize: 12,
        }}
      >
        {loading ? "업로드 중..." : "사진 스팟 추가"}
      </button>
    </>
  );
}

