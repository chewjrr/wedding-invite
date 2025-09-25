import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { FaPlus, FaMinus } from "react-icons/fa";
import { useAnimation } from "framer-motion";

const photos = [
  { src: "/images/photo11.jpg", alt: "Первое свидание" },
  { src: "/images/photo8.jpg", alt: "Первое знакомство с родителями" },
  { src: "/images/photo9.jpg", alt: "Первая совместная аватарка" },
  { src: "/images/photo10.jpg", alt: "В аквапарке реально обалденно" },
  { src: "/images/photo7.jpg", alt: "Крутые в очках 😎" },
  { src: "/images/photo2.jpg", alt: "Были на концерте Cream Soda" },
  { src: "/images/photo12.jpg", alt: "Отметили масленицу" },
  { src: "/images/photo17.jpg", alt: "ДЕНЬ РОЖДЕНИЯ КАТИ 🎉" },
  { src: "/images/photo1.jpg", alt: "Снова на ВДНХ" },
  { src: "/images/photo13.jpg", alt: "Ждали салют на День России" },
  { src: "/images/photo4.jpg", alt: "Купались в Долгопрудном" },
  { src: "/images/photo14.jpg", alt: "Пенная вечеринка пидиди" },
  { src: "/images/photo5.jpg", alt: "Отмечали день рождения мамы" },
  { src: "/images/photo15.jpg", alt: "Отмечали 30 лет брака (не нашего) (пока)" },
  { src: "/images/photo6.jpg", alt: "Предложение!!!" },
  { src: "/images/photo16.jpg", alt: "И еще немного после предложения 😊" },
];

export default function Gallery() {
  const titleRef = useRef(null);
  const isInView = useInView(titleRef, { once: true, threshold: 0.5 });
  const controls = useAnimation();

  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const handleClick = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section style={styles.section}>
      <motion.h2
        ref={titleRef}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        style={styles.heading}
      >
        Наша история
      </motion.h2>

      <div style={styles.grid}>
        {photos.map((photo, index) => (
          <PhotoItem
            key={index}
            photo={photo}
            index={index}
            isActive={activeIndex === index}
            onClick={() => handleClick(index)}
            controls={controls}
          />
        ))}
      </div>
    </section>
  );
}

// Компонент для одного фото
function PhotoItem({ photo, index, isActive, onClick, controls }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { delay: index * 0.1, duration: 0.5 }, // плавнее
        },
      }}
      initial="hidden"
      animate={controls}
      style={{
        ...styles.photoWrapper,
        ...(isExpanded && styles.expanded),
      }}
      onClick={onClick}
      tabIndex="0"
      role="button"
      aria-label={`Посмотреть подпись: ${photo.alt}`}
    >
      {/* Квадратный контейнер */}
      <div style={styles.square}>
        <img src={photo.src} alt={photo.alt} style={styles.img} loading="lazy" />

        {/* Подпись */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              style={styles.caption}
            >
              {photo.alt}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Кнопка увеличения */}
        <button
          type="button"
          aria-label={isExpanded ? "Уменьшить фото" : "Увеличить фото"}
          style={styles.expandButton}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? <FaMinus size={16} /> : <FaPlus size={16} />}
        </button>
      </div>
    </motion.div>
  );
}

// Стили
const styles = {
  section: {
    padding: "80px 20px",
    textAlign: "center",
    background: "var(--color-bg)",
    overflow: "hidden",
  },
  heading: {
    fontSize: "1.9rem",
    fontWeight: "500",
    color: "var(--color-text)",
    marginBottom: "40px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    maxWidth: "600px",
    margin: "0 auto",
    padding: "0 10px",
    boxSizing: "border-box",
  },
  photoWrapper: {
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
    cursor: "pointer",
    userSelect: "none",
    transition: "all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)", // ✅ Плавная анимация
  },
  expanded: {
    gridColumn: "span 2",
    gridRow: "span 2",
    transform: "scale(1.08)", // ✅ Плавное увеличение
    boxShadow: "0 15px 30px rgba(0,0,0,0.15)", // Усиливаем тень
    zIndex: 10,
  },
  square: {
    position: "relative",
    width: "100%",
    height: 0,
    paddingBottom: "100%",
    backgroundColor: "#f0f0f0",
  },
  img: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  caption: {
    fontSize: "0.9rem",
    padding: "12px 10px",
    color: "#ffffff",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderRadius: "0 0 12px 12px",
    textAlign: "center",
    fontFamily: "Poppins",
    fontWeight: "400",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  expandButton: {
    position: "absolute",
    top: "8px",
    left: "8px",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    color: "var(--color-accent)",
    border: "2px solid var(--color-accent)",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
    backdropFilter: "blur(2px)",
    transition: "all 0.3s ease",
    //transform: "translateY(50%)",
  },
};