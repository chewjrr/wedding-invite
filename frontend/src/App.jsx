// src/App.jsx
import { useEffect, useRef, useState } from "react";
import "./index.css";
import GuestbookForm from "./components/GuestbookForm";

export default function App() {
  const titleRef = useRef(null);
  const [wishes, setWishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Анимация главного экрана
  const isInView = useInView(titleRef, { once: true, threshold: 0.5 });

  const API_URL = import.meta.env.VITE_API_URL;

  // Загружаем пожелания
  const fetchWishes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/wishes`);
      if (res.ok) {
        const data = await res.json();
        setWishes(data);
      }
    } catch (err) {
      console.error("Ошибка загрузки пожеланий:", err);
    }
  };

  useEffect(() => {
    fetchWishes(); // Первичная загрузка
    const interval = setInterval(fetchWishes, 30000); 
    setIsLoading(false);
    return () => clearInterval(interval);
  }, []);

  // Бегущая строка
  const marqueeText = wishes
    .slice(0, 10)
    .map((w) => w.message)
    .join(" • ");

  return (
    <div style={styles.page}>
      {/* 🔝 Главный экран */}
      <main ref={titleRef} style={styles.hero}>
        <h1 style={{ ...styles.title, opacity: isInView ? 1 : 0 }}>
          Екатерина
          <span style={styles.heart}> & </span>
          Всеволод
        </h1>

        <p style={{ ...styles.date, opacity: isInView ? 1 : 0 }}>11.11.2025</p>

        <div
          style={{
            ...styles.underline,
            transform: isInView ? "scaleX(1)" : "scaleX(0)",
          }}
        />

        <p style={{ ...styles.subtitle, opacity: isInView ? 1 : 0 }}>
          Приглашаем вас разделить с нами этот особенный день
        </p>

        {/* 🌸 Бегущая строка — только пожелания */}
        <div style={styles.marqueeContainer}>
          <div style={styles.marquee}>
            <p style={styles.marqueeText}>{marqueeText}</p>
          </div>
        </div>
      </main>

      {/* 📝 Гостевая книга */}
      <GuestbookForm onNewWish={(newWish) => setWishes([newWish, ...wishes])} />
    </div>
  );
}

// Кастомный хук useInView
const useInView = (ref, options) => {
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);
  return isInView;
};

// Стили
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
    fontFamily: "Poppins, sans-serif",
    color: "#333",
    overflow: "hidden",
  },
  hero: {
    paddingTop: "80px",
    textAlign: "center",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: "2.8rem",
    fontWeight: "500",
    margin: "0",
    transition: "opacity 0.8s ease-out",
    lineHeight: "1.3",
  },
  heart: {
    color: "var(--color-accent)",
    fontWeight: "600",
  },
  date: {
    fontSize: "1.6rem",
    color: "#555",
    margin: "15px 0 20px",
    fontWeight: "400",
    transition: "opacity 0.6s ease-out",
  },
  underline: {
    height: "2px",
    width: "60px",
    background: "var(--color-accent)",
    margin: "0 auto",
    borderRadius: "2px",
    transformOrigin: "center",
    transition: "transform 1s ease-out 0.8s",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#5a5a5a",
    maxWidth: "350px",
    margin: "20px auto 0",
    fontStyle: "italic",
    transition: "opacity 0.6s ease-out 1.2s",
  },
  marqueeContainer: {
    width: "100%",
    overflow: "hidden",
    whiteSpace: "nowrap",
    padding: "10px 0",
    marginTop: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  marquee: {
    display: "inline-block",
    animation: "marquee 30s linear infinite",
    whiteSpace: "nowrap",
  },
  marqueeText: {
    fontSize: "1rem",
    color: "#555",
    margin: "0",
    padding: "0 20px",
    fontWeight: "400",
    letterSpacing: "0.5px",
  },
};