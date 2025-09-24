// src/components/ColorPalette.jsx
import { useState } from "react";

export default function ColorPalette() {
  const [hoveredColor, setHoveredColor] = useState(null);

  // Чистая палитра: удалены #F5F5F5, #FFFFFF, дубли серого и бежевого
  // Оставлен один основной синий (#5A6D7C) и один серый (#9E9E9E)
  const colors = [
    "#5A6D7C", // 🟦 Темно-серо-синий — основной акцент
    "#2E2E3F", // ⚫ Тёмный фиолетовый
    "#8B7C9E", // 🟣 Лавандовый
    "#9fb5a8", // 🌫 Серо-голубой
    "#8FB3C4", // 🔷 Мягкий синий
    "#3A7BA8", // 🔵 Глубокий синий
    "#9E9E9E", // 🟤 Серый (единственный оставленный серый)
    "#5555a5ff", // 🟪 Фиолетовый
    "#E8C8D0", // 🌸 Нежно-розовый (единственный розовый)
    "#8B5E3C", // 🟫 Коричневый
    "#B8A08B", // 🟫 Тёплый бежевый
    "#2A1E1E", // 🟤 Тёмно-коричневый
  ];

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.title}>Цветовая палитра</h2>
        {/* 🎨 Чистая сетка цветов */}
        <div style={styles.grid}>
          {colors.map((color, index) => (
            <div
              key={index}
              style={{
                ...styles.colorBox,
                backgroundColor: color,
                boxShadow:
                  hoveredColor === color
                    ? `0 0 0 2px white, 0 0 0 4px ${color}`
                    : "none",
              }}
              onMouseEnter={() => setHoveredColor(color)}
              onMouseLeave={() => setHoveredColor(null)}
            >
              {hoveredColor === color && (
                <span style={styles.tooltip}>{color.toUpperCase()}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "60px 20px",
    background: "#f8f9fa", // Очень светлый фон, не белый
    textAlign: "center",
    fontFamily: "Poppins, sans-serif",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  title: {
    fontSize: "2rem",
    color: "#2E2E3F",
    marginBottom: "8px",
    fontWeight: "500",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#666",
    fontStyle: "italic",
    marginBottom: "30px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
    gap: "12px",
  },
  colorBox: {
    height: "80px",
    borderRadius: "12px",
    cursor: "pointer",
    position: "relative",
    transition: "box-shadow 0.2s ease",
    border: "1px solid rgba(0,0,0,0.05)",
  },
  tooltip: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    color: "#333",
    fontSize: "0.75rem",
    fontWeight: "500",
    padding: "4px 8px",
    borderRadius: "6px",
    whiteSpace: "nowrap",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    backdropFilter: "blur(4px)",
  },
};