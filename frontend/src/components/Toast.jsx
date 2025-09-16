// src/components/Toast.jsx
import { useEffect, useRef } from "react";

export default function Toast({ message, type, onClose }) {
  const toastRef = useRef(null);

  // Цвета в пастельной гамме
  const colors = {
    success: {
      bg: "linear-gradient(135deg, #b8e6d9, #a0c4b7)",
      text: "#2f6b5f",
    },
    error: {
      bg: "linear-gradient(135deg, #f9d8d8, #f2b8b8)",
      text: "#7a2c2c",
    },
    info: {
      bg: "linear-gradient(135deg, #d9e8f5, #bbc8db)",
      text: "#3a5a78",
    },
  };

  const style = colors[type] || colors.info;

  useEffect(() => {
    const element = toastRef.current;
    if (element) {
      // Плавное появление
      requestAnimationFrame(() => {
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
      });
    }

    // Авто-закрытие
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    const element = toastRef.current;
    if (element) {
      element.style.opacity = "0";
      element.style.transform = "translateY(-10px)";
      setTimeout(onClose, 300);
    }
  };

  return (
    <div
      ref={toastRef}
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        maxWidth: "300px",
        padding: "14px 18px",
        borderRadius: "12px",
        fontSize: "0.95rem",
        fontWeight: "500",
        color: style.text,
        background: style.bg,
        //boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
        cursor: "pointer",
        opacity: "0",
        transform: "translateY(-10px)",
        transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
        border: `1px solid ${style.text}20`,
        backdropFilter: "blur(4px)",
      }}
      onClick={handleClose}
    >
      {message}
    </div>
  );
}