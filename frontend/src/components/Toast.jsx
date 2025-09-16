// src/components/Toast.jsx
import { useEffect, useRef, useState } from "react";

export default function Toast({ message, type, onClose }) {
  const toastRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentStyle, setCurrentStyle] = useState({});

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

  const baseStyle = {
    position: "fixed",
    top: "20px",
    right: "20px",
    maxWidth: "300px",
    padding: "14px 18px",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: "500",
    zIndex: 1000,
    cursor: "pointer",
    backdropFilter: "blur(4px)",
    transition: "all 0.5s cubic-bezier(0.33, 1, 0.68, 1)",
    opacity: "0",
    transform: "translateY(-20px) scale(0.95)",
    border: "1px solid transparent",
  };

  useEffect(() => {
    // Устанавливаем стиль в зависимости от типа
    const style = colors[type] || colors.info;
    setCurrentStyle({
      ...baseStyle,
      color: style.text,
      background: style.bg,
      borderColor: `${style.text}20`,
    });

    // Запускаем анимацию появления
    setTimeout(() => {
      setIsVisible(true);
      if (toastRef.current) {
        setCurrentStyle(prev => ({
          ...prev,
          opacity: "1",
          transform: "translateY(0) scale(1)",
        }));
      }
    }, 10);

    // Авто-закрытие
    const timer = setTimeout(() => {
      handleClose();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [type]);

  const handleClose = () => {
    setIsVisible(false);
    if (toastRef.current) {
      setCurrentStyle(prev => ({
        ...prev,
        opacity: "0",
        transform: "translateY(-20px) scale(0.95)",
      }));
      
      // Ждем завершения анимации перед вызовом onClose
      setTimeout(onClose, 500);
    }
  };

  const handleMouseEnter = () => {
    if (toastRef.current && isVisible) {
      const style = colors[type] || colors.info;
      setCurrentStyle(prev => ({
        ...prev,
        transform: "translateY(0) scale(1.05)",
        //boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
        borderColor: `${style.text}40`,
      }));
    }
  };

  const handleMouseLeave = () => {
    if (toastRef.current && isVisible) {
      setCurrentStyle(prev => ({
        ...prev,
        transform: "translateY(0) scale(1)",
        //boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)",
        borderColor: `${colors[type]?.text || colors.info.text}20`,
      }));
    }
  };

  return (
    <div
      ref={toastRef}
      style={currentStyle}
      onClick={handleClose}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {message}
    </div>
  );
}