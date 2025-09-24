// src/components/Schedule.jsx
import React, { useState, useCallback, useMemo, memo } from "react";
import { motion } from "framer-motion";

// Анимации выносим за пределы компонента, чтобы они не пересоздавались
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

// Выносим TimelineItem за пределы основного компонента
const TimelineItem = memo(({ time, title, children, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Анимация для раскрытия/скрытия контента
  const contentVariants = {
    collapsed: { 
      height: 0, 
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    expanded: { 
      height: "auto", 
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  const toggleItem = useCallback((e) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  }, []);

  return (
    <motion.div 
      variants={itemVariants} 
      style={styles.item}
      layout
    >
      <div style={styles.time}>{time}</div>
      <div style={styles.content}>
        <div style={styles.header} onClick={toggleItem}>
          <h3 style={styles.blockTitle}>{title}</h3>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            style={styles.arrow}
          >
            ▼
          </motion.div>
        </div>
        
        <motion.div
          variants={contentVariants}
          initial="collapsed"
          animate={isOpen ? "expanded" : "collapsed"}
          style={styles.contentInner}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
});

// Основной компонент Schedule
const Schedule = () => {
  // Используем useMemo для данных расписания, чтобы они не пересоздавались при каждом рендере
  const scheduleData = useMemo(() => [
    {
      time: "13:00 – 14:00",
      title: "Приветствие гостей и Welcome-зона",
      content: (
        <ul style={styles.list}>
          <li>Гости прибывают, их встречают молодожёны или координатор</li>
          <li>Работает зона с напитками и закусками</li>
          <li>«Полароид» — мгновенные снимки на память</li>
        </ul>
      )
    },
    {
      time: "14:00 – 14:30",
      title: "Выездная церемония бракосочетания",
      content: (
        <ul style={styles.list}>
          <li>Начало церемонии. Гости занимают свои места</li>
          <li>Обмен кольцами.</li>
          <li>Первые поздравления и общая фотосессия</li>
        </ul>
      )
    },
    {
      time: "14:30 – 15:20",
      title: "Первый банкетный блок: знакомство и атмосфера",
      content: (
        <ul style={styles.list}>
          <li>Приветственный тост родителей</li>
          <li>Первый тост молодожёнов</li>
          <li>Объявление правил свадьбы (в шуточной форме)</li>
          <li>Интерактив на сплочение</li>
          <li>«Смешной квиз о паре»</li>
        </ul>
      )
    },
    {
      time: "15:20 – 15:40",
      title: "Музыкальная пауза",
      content: <p style={styles.text}>Гости общаются, танцуют, продолжают трапезу</p>
    },
    {
      time: "15:40 – 16:30",
      title: "Второй банкетный блок: развлечения и энергия",
      content: (
        <ul style={styles.list}>
          <li><strong>Первый танец молодожёнов</strong> — романтичный выход пары</li>
          <li>Интерактивные игры: «Кто лучше знает молодожёнов?»</li>
          <li>«Своя игра» с музыкальным сопровождением</li>
          <li><strong>Общая ламбада!</strong> Все в танец!</li>
        </ul>
      )
    },
    {
      time: "16:30 – 16:50",
      title: "Музыкальная пауза",
      content: <p style={styles.text}>Свободное время для гостей</p>
    },
    {
      time: "16:50 – 18:30",
      title: "Танцевально-развлекательная программа",
      content: (
        <ul style={styles.list}>
          <li>Конкурсы: весёлые и подвижные игры</li>
          <li>Музыкальное бинго — угадывай мелодии и выигрывай призы</li>
          <li><strong>Букет и бутоньерка</strong> — в оригинальной форме (револьвер, алкотестер)</li>
          <li><strong>Создание семейного очага</strong> — ритуал объединения огней двух семей</li>
        </ul>
      )
    },
    {
      time: "17:50 – 18:30",
      title: "Свободные танцы",
      content: <p style={styles.text}>Гости отдыхают, общаются и танцуют</p>
    },
    {
      time: "18:30 – 19:40",
      title: "Финальная часть праздника",
      content: (
        <ul style={styles.list}>
          <li><strong>Вынос и разрезание торта</strong> — торжественный момент</li>
          <li>«Продажа» первого куска на удачу (средства — в копилку молодых)</li>
          <li>Второй и третий кусок — в подарок мамам</li>
          <li>Народные танцы: «Кадышева», хоровод — все вместе!</li>
        </ul>
      )
    },
    {
      time: "19:40 - 20:00",
      title: "Финальный аккорд",
      content: (
        <ul style={styles.list}>
          <li>Общий финальный танец или салют (по желанию)</li>
          <li>Благодарственное слово молодожёнов</li>
          <li>Официальная программа завершена. Начинается вечеринка для желающих продолжить!</li>
        </ul>
      )
    }
  ], []);

  return (
    <section id="schedule" style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.title}>План свадьбы</h2>
        <p style={styles.subtitle}>Каждый момент — часть нашей истории</p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={styles.timeline}
        >
          {scheduleData.map((item, index) => (
            <TimelineItem
              key={index}
              time={item.time}
              title={item.title}
              index={index}
            >
              {item.content}
            </TimelineItem>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Экспортируем компонент с memo для предотвращения лишних рендеров
export default memo(Schedule);

// Стили (без изменений)
const styles = {
  section: {
    padding: "60px 20px",
    background: "var(--color-bg-alt, #f9f7fa)",
    textAlign: "center",
    fontFamily: "Poppins, sans-serif",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  title: {
    fontSize: "2.2rem",
    color: "var(--color-text, #333)",
    marginBottom: "10px",
    fontWeight: "500",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#666",
    fontStyle: "italic",
    marginBottom: "40px",
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  item: {
    display: "flex",
    alignItems: "flex-start",
    gap: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    cursor: "pointer",
  },
  time: {
    minWidth: "100px",
    fontSize: "1rem",
    fontWeight: "600",
    color: "var(--color-accent, #f46fa2)",
    textAlign: "right",
    paddingTop: "4px",
  },
  content: {
    flex: 1,
    textAlign: "left",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "0px",
  },
  blockTitle: {
    fontSize: "1.3rem",
    color: "#333",
    margin: "0 10px 0 0",
    fontWeight: "500",
    flex: 1,
  },
  arrow: {
    fontSize: "12px",
    color: "#999",
    marginTop: "5px",
  },
  contentInner: {
    overflow: "hidden",
  },
  list: {
    margin: "8px 0",
    paddingLeft: "20px",
    color: "#555",
    fontSize: "0.95rem",
    lineHeight: "1.6",
  },
  text: {
    margin: "8px 0",
    color: "#555",
    fontSize: "0.95rem",
    lineHeight: "1.6",
  },
};