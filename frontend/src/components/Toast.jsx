// src/components/Toast.jsx
import { useEffect, useRef } from "react";

export default function Toast({ message, type, onClose }) {
  const toastRef = useRef(null);

  // Анимация появления
  useEffect(() => {
    const element = toastRef.current;
    if (element) {
      // Запускаем анимацию после рендера
      requestAnimationFrame(() => {
        element.style.opacity = "1";
        element.style.transform = "translateX(0)";
      });
    }

    // Авто-закрытие
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Анимация исчезновения при закрытии
  const handleClose = () => {
    const element = toastRef.current;
    if (element) {
      element.style.opacity = "0";
      element.style.transform = "translateX(100%)";
      // Убираем из DOM после анимации
      setTimeout(onClose, 300); // Должно совпадать с duration в CSS
    }
  };

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
      opacity: "0", // Начальное состояние
      transform: "translateX(100%)", // Начинается справа
      transition: "opacity 0.3s ease, transform 0.3s ease",
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
      ref={toastRef}
      style={{ ...styles.base, ...(styles[type] || styles.info) }}
      onClick={handleClose}
    >
      {message}
    </div>
  );
}