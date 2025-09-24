import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Компоненты
import Gallery from "./components/Gallery";
import Location from "./components/Location";
import GuestbookForm from "./components/GuestbookForm";
import Schedule from "./components/Schedule";
import ColorPalette from "./components/ColorPalette";

// Константы
const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const titleRef = useRef(null);
  const isInView = useInView(titleRef, { once: true, threshold: 0.5 });
  const controls = useAnimation();
  const [wishes, setWishes] = useState([]);
  const [activeSection, setActiveSection] = useState("");
  const [tickerWishes, setTickerWishes] = useState("");
  const [tickerError, setTickerError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Функция для загрузки пожеланий
  const fetchWishes = async () => {
    try {
      console.log("🔄 Загрузка пожеланий из БД...");
      console.log("📡 URL запроса:", `${API_URL}/api/wishes`);
      
      const res = await fetch(`${API_URL}/api/wishes`);
      
      console.log("📊 Статус ответа:", res.status, res.statusText);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const responseText = await res.text();
      console.log("📝 Текст ответа:", responseText);
      
      let wishesData;
      try {
        wishesData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Ошибка парсинга JSON:", parseError);
        throw new Error("Invalid JSON response");
      }
      
      console.log("✅ Пожелания успешно загружены:", wishesData);
      
      if (!wishesData) {
        console.warn("⚠️ Получен null или undefined");
        wishesData = [];
      }
      
      if (!Array.isArray(wishesData)) {
        console.warn("⚠️ Получены некорректные данные (не массив):", typeof wishesData);
        wishesData = [];
      }
      
      const formattedWishes = wishesData
        .map(wish => `\t|\t${wish.message}\t|\t`)
        .join("");
        
      setTickerWishes(formattedWishes);
      setTickerError(false);
    } catch (error) {
      console.error("❌ Ошибка загрузки пожеланий:", error);
      setTickerError(true);
      
      const sampleWishes = [
        "Счастья и радости!",
        "Любви и взаимопонимания!",
        "Крепкого здоровья!",
        "Процветания и успехов!",
        "Вечной романтики!",
        "Мира и гармонии в семье!"
      ];
      
      const formattedSample = sampleWishes
        .map(wish => `\t|\t${wish}\t|\t`)
        .join("");
        
      setTickerWishes(formattedSample);
    }
  };

  useEffect(() => {
    fetchWishes();
    
    const intervalId = setInterval(() => {
      console.log("🔄 Автоматическое обновление пожеланий...");
      fetchWishes();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const handleNewWish = (newWish) => {
    setWishes(prevWishes => [newWish, ...prevWishes]);
    console.log("🔄 Обновление бегущей строки новым пожеланием");
    setTickerWishes(prev => `\t|\t${newWish.message}\t|\t${prev}`);
  };

  // ИСПРАВЛЕННЫЙ КОД: Правильное отслеживание активной секции
  useEffect(() => {
  const handleScroll = () => {
    const sections = [
      { id: "gallery", element: document.getElementById("gallery") },
      { id: "location", element: document.getElementById("location") },
      { id: "schedule", element: document.getElementById("schedule") },
      { id: "guestbook", element: document.getElementById("guestbook") }
    ].filter(section => section.element); // Фильтруем только существующие элементы

    if (sections.length === 0) return;

    const scrollPos = window.scrollY; // Центр экрана

    // Находим секцию, которая находится ближе всего к центру экрана
    let closestSection = sections[0];
    let minDistance = Math.abs(sections[0].element.offsetTop - scrollPos);

    for (let i = 1; i < sections.length; i++) {
      const distance = Math.abs(sections[i].element.offsetTop - scrollPos);
      if (distance < minDistance) {
        minDistance = distance;
        closestSection = sections[i];
      }
    }

    // Устанавливаем активную секцию только если мы прокрутили достаточно далеко от hero-section
    if (scrollPos > sections[0].element.offsetTop - 100) {
      setActiveSection(closestSection.id);
    } else {
      setActiveSection(""); // В hero-section - никакая кнопка не активна
    }
  };

  window.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", handleScroll);
  handleScroll(); // Вызываем сразу для установки начального состояния

  return () => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleScroll);
  };
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
    <div style={{ overflowX: 'hidden', width: '100%' }}>
      {/* 🔝 Фиксированный навбар */}
      <nav style={styles.nav}>
        <div style={{
          ...styles.container,
          ...(isMobile && styles.containerMobile)
        }}>
          <button
            onClick={() => scrollTo("gallery")}
            style={{
              ...styles.button,
              ...(isMobile && styles.buttonMobile),
              ...(activeSection === "gallery" && styles.active),
            }}
            className="no-select" // Добавляем класс для отключения выделения
          >
            {isMobile ? "Фото" : "Галерея"}
          </button>
          <button
            onClick={() => scrollTo("location")}
            style={{
              ...styles.button,
              ...(isMobile && styles.buttonMobile),
              ...(activeSection === "location" && styles.active),
            }}
            className="no-select"
          >
            {isMobile ? "Карта" : "Место"}
          </button>
          <button
            onClick={() => scrollTo("guestbook")}
            style={{
              ...styles.button,
              ...(isMobile && styles.buttonMobile),
              ...(activeSection === "guestbook" && styles.active),
            }}
            className="no-select"
          >
            {isMobile ? "Пожелания" : "Гостевая"}
          </button>
          <button
            onClick={() => scrollTo("schedule")}
            style={{
              ...styles.button,
              ...(isMobile && styles.buttonMobile),
              ...(activeSection === "schedule" && styles.active),
            }}
            className="no-select"
          >
            {isMobile ? "Время" : "Расписание"}
          </button>
        </div>
      </nav>

      {/* Остальной код без изменений */}
      <main style={styles.heroSection}>
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={styles.heroContent}
        >
          <h1 style={{
            ...styles.title,
            ...(isMobile && styles.titleMobile)
          }}>
            Екатерина
            <span style={styles.heart}> & </span>
            Всеволод
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{
              ...styles.date,
              ...(isMobile && styles.dateMobile)
            }}
          >
            11.11.2025
          </motion.p>

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
            style={{
              ...styles.subtitle,
              ...(isMobile && styles.subtitleMobile)
            }}
          >
            Приглашаем вас разделить с нами этот особенный день
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            style={styles.tickerContainer}
          >
            <div style={styles.tickerWrapper}>
              <motion.div
                style={{
                  ...styles.tickerContent,
                  ...(isMobile && styles.tickerContentMobile)
                }}
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 120,
                    ease: "linear",
                  },
                }}
              >
                {tickerWishes ? tickerWishes.repeat(2) : "\t|\tЗагрузка пожеланий...\t|\t".repeat(2)}
              </motion.div>
            </div>
            {tickerError && (
              <p style={styles.errorNote}>
                Используются примеры пожеланий (ошибка загрузки)
              </p>
            )}
          </motion.div>
        </motion.div>
      </main>

      <section id="gallery">
        <Gallery />
      </section>

      <section id="location">
        <Location />
      </section>

      <section id="guestbook">
        <GuestbookForm onNewWish={handleNewWish} />
      </section>

      <section id="schedule">
        <Schedule />
      </section>

      <section id="colotpalette">
        <ColorPalette />
      </section>

      {/* Глобальные стили для отключения выделения */}
      <style jsx global>{`
        /* Отключаем выделение при нажатии на всех интерактивных элементах */
        button, 
        .no-select,
        [onClick] {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          outline: none;
        }
        
        /* Для элементов, которые должны быть доступны для выделения текста */
        input, textarea {
          -webkit-user-select: text;
          -khtml-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }
        
        /* Убираем стандартное выделение при активном состоянии */
        button:active, 
        button:focus {
          outline: none;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}

// Стили с адаптивностью
const styles = {
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(10px)",
    zIndex: 1000,
    padding: "10px 0",
    boxSizing: 'border-box',
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    fontFamily: "Poppins, sans-serif",
    padding: "0 20px",
    boxSizing: 'border-box',
  },
  containerMobile: {
    maxWidth: "100%",
    gap: "15px",
    padding: "0 15px",
  },
  button: {
    background: "none",
    border: "none",
    fontSize: "1rem",
    color: "#555",
    cursor: "pointer",
    padding: "8px 8px",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    whiteSpace: 'nowrap',
    minWidth: 'auto',
    // Добавляем стили для отключения выделения
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
  },
  buttonMobile: {
    fontSize: "0.85rem",
    padding: "6px 6px",
    borderRadius: "6px",
    flex: 1,
    textAlign: 'center',
  },
  active: {
    color: "var(--color-accent)",
    background: "rgba(244, 194, 217, 0.2)",
    fontWeight: "500",
  },
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
    boxSizing: 'border-box',
    overflow: 'hidden',
    width: '100%',
  },
  heroContent: {
    maxWidth: "500px",
    width: '100%',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: "2.8rem",
    fontWeight: "500",
    color: "#333",
    margin: "0",
    lineHeight: "1.3",
  },
  titleMobile: {
    fontSize: "2.2rem",
    lineHeight: "1.2",
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
  dateMobile: {
    fontSize: "1.3rem",
    margin: "10px 0 15px",
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
  subtitleMobile: {
    fontSize: "1rem",
    maxWidth: "300px",
    margin: "15px auto 0",
  },
  tickerContainer: {
    width: "100%",
    overflow: "hidden",
    marginTop: "30px",
    padding: "0 20px",
    boxSizing: 'border-box',
    position: 'relative',
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
  tickerContentMobile: {
    fontSize: "0.85rem",
    padding: "6px 0",
  },
  errorNote: {
    fontSize: "0.7rem",
    color: "#999",
    marginTop: "5px",
    fontStyle: "italic",
    textAlign: 'center',
  },
};

// Кастомный хук useInView без изменений
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