import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Компоненты
import Gallery from "./components/Gallery";
import Location from "./components/Location";
import GuestbookForm from "./components/GuestbookForm";

// Константы
const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const titleRef = useRef(null);
  const isInView = useInView(titleRef, { once: true, threshold: 0.5 });
  const controls = useAnimation();
  const [wishes, setWishes] = useState([]);
  const [activeSection, setActiveSection] = useState("");
  const [tickerWishes, setTickerWishes] = useState("");

  // Загрузка пожеланий для бегущей строки
  useEffect(() => {
    const fetchWishes = async () => {
      try {
        const res = await fetch(`${API_URL}/api/wishes`);
        const wishesData = await res.json();
        
        // Форматируем пожелания в нужный формат
        const formattedWishes = wishesData
          .map(wish => `\t|\t${wish.message}\t|\t`)
          .join("");
          
        setTickerWishes(formattedWishes);
      } catch (error) {
        console.error("Ошибка загрузки пожеланий:", error);
      }
    };

    fetchWishes();
  }, []);

  // Анимация главного экрана
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const handleNewWish = (newWish) => {
    setWishes(prevWishes => [newWish, ...prevWishes]);
    
    // Обновляем бегущую строку при добавлении нового пожелания
    setTickerWishes(prev => `\t|\t${newWish.message}\t|\t${prev}`);
  };

  // Отслеживаем, какой блок в зоне видимости
  useEffect(() => {
    const handleScroll = () => {
      const gallery = document.getElementById("gallery");
      const location = document.getElementById("location");
      const guestbook = document.getElementById("guestbook");

      const scrollPos = window.scrollY + 100;

      if (guestbook && scrollPos >= guestbook.offsetTop) {
        setActiveSection("guestbook");
      } else if (location && scrollPos >= location.offsetTop) {
        setActiveSection("location");
      } else if (gallery && scrollPos >= gallery.offsetTop) {
        setActiveSection("gallery");
      } else {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Плавная прокрутка к блоку
  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {/* 🔝 Фиксированный навбар */}
      <nav style={styles.nav}>
        <div style={styles.container}>
          <button
            onClick={() => scrollTo("gallery")}
            style={{
              ...styles.button,
              ...(activeSection === "gallery" && styles.active),
            }}
          >
            Галерея
          </button>
          <button
            onClick={() => scrollTo("location")}
            style={{
              ...styles.button,
              ...(activeSection === "location" && styles.active),
            }}
          >
            Карта
          </button>
          <button
            onClick={() => scrollTo("guestbook")}
            style={{
              ...styles.button,
              ...(activeSection === "guestbook" && styles.active),
            }}
          >
            Пожелания
          </button>
        </div>
      </nav>

      {/* 🎉 Главная секция */}
      <main style={styles.heroSection}>
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={styles.heroContent}
        >
          <h1 style={styles.title}>
            Екатерина
            <span style={styles.heart}> & </span>
            Всеволод
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={styles.date}
          >
            11.11.2025
          </motion.p>

          {/* 🌸 Розовая полоска с анимацией */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              delay: 0.8,
              duration: 1,
              ease: "easeOut",
            }}
            style={styles.underline}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            style={styles.subtitle}
          >
            Приглашаем вас разделить с нами этот особенный день
          </motion.p>

          {/* 🎠 Бегущая строка с пожеланиями */}
          {tickerWishes && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              style={styles.tickerContainer}
            >
              <div style={styles.tickerWrapper}>
                <motion.div
                  style={styles.tickerContent}
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{
                    x: {
                      repeat: Infinity,
                      repeatType: "loop",
                      duration: 60, // Низкая скорость для чтения
                      ease: "linear",
                    },
                  }}
                >
                  {tickerWishes.repeat(2)} {/* Дублируем для плавного перехода */}
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* 🖼️ Галерея */}
      <section id="gallery">
        <Gallery />
      </section>

      {/* 📍 Карта */}
      <section id="location">
        <Location />
      </section>

      {/* 📝 Гостевая книга */}
      <section id="guestbook">
        <GuestbookForm onNewWish={handleNewWish} />
      </section>
    </>
  );
}

// ✨ Стили
const styles = {
  // Навбар
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(10px)",
    zIndex: 1000,
    padding: "10px 0",
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    fontFamily: "Poppins, sans-serif",
  },
  button: {
    background: "none",
    border: "none",
    fontSize: "1rem",
    color: "#555",
    cursor: "pointer",
    padding: "8px 12px",
    borderRadius: "8px",
    transition: "all 0.3s ease",
  },
  active: {
    color: "var(--color-accent)",
    background: "rgba(244, 194, 217, 0.2)",
    fontWeight: "500",
  },

  // Главная секция
  heroSection: {
    paddingTop: "80px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "20px",
    background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
    position: "relative",
    zIndex: 1,
  },
  heroContent: {
    maxWidth: "500px",
  },
  title: {
    fontSize: "2.8rem",
    fontWeight: "500",
    color: "#333",
    margin: "0",
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
  },
  underline: {
    height: "2px",
    width: "60px",
    background: "var(--color-accent)",
    margin: "0 auto",
    borderRadius: "2px",
    transformOrigin: "center",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#5a5a5a",
    maxWidth: "350px",
    margin: "20px auto 0",
    fontStyle: "italic",
  },
  
  // Бегущая строка
  tickerContainer: {
    width: "100%",
    overflow: "hidden",
    marginTop: "30px",
    padding: "0 20px", // Отступы по бокам для мобильных устройств
  },
  tickerWrapper: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  tickerContent: {
    whiteSpace: "nowrap",
    display: "inline-block",
    color: "var(--color-accent)",
    fontSize: "0.95rem",
    fontWeight: "500",
    padding: "8px 0",
  },
};

// 🧩 Кастомный хук useInView
const useInView = (ref, options) => {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenViewed, setHasBeenViewed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        if (!hasBeenViewed) setHasBeenViewed(true);
      } else {
        setIsInView(false);
      }
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options, hasBeenViewed]);

  return isInView;
};