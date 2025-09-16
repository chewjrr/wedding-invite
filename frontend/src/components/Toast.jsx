// src/components/Toast.jsx
import { useEffect } from "react";

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // Авто-закрытие через 3 сек
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    base: {
      position: "fixed",
      top: "20px",
      right: "20px",
      maxWidth: "300px",
      padding: "12px 16px",
      borderRadius: "8px",
      fontSize: "0.95rem",
      fontWeight: "500",
      color: "#fff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      zIndex: 1000,
      cursor: "pointer",
      opacity: 1,
      transform: "translateX(0)",
      transition: "all 0.3s ease",
    },
    success: {
      background: "linear-gradient(135deg, #4ade80, #22c55e)",
    },
    error: {
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
    },
    info: {
      background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    },
  };

  return (
    <div
      style={{ ...styles.base, ...(styles[type] || styles.info) }}
      onClick={onClose}
    >
      {message}
    </div>
  );
}