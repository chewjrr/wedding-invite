// src/components/Schedule.jsx
import { motion } from "framer-motion";

export default function Schedule() {
  // Анимация для контейнера с задержкой по элементам
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  // Анимация отдельного блока
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  // Подкомпонент: один блок расписания (перемещен внутрь Schedule)
  const TimelineItem = ({ time, title, children }) => {
    return (
      <motion.div variants={itemVariants} style={styles.item}>
        <div style={styles.time}>{time}</div>
        <div style={styles.content}>
          <h3 style={styles.blockTitle}>{title}</h3>
          {children}
        </div>
      </motion.div>
    );
  };

  return (
    <section id = " schedule" style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.title}>План свадьбы</h2>
        <p style={styles.subtitle}>Каждый момент — часть нашей истории</p>

        {/* Основная временная шкала */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={styles.timeline}
        >
          {/* Блок 1: Welcome-зона */}
          <TimelineItem time="13:00 – 14:00" title="Приветствие гостей и Welcome-зона">
            <ul style={styles.list}>
              <li>Гости прибывают, их встречают молодожёны или координатор</li>
              <li>Работает зона с напитками и закусками</li>
              <li>«Полароид» — мгновенные снимки на память</li>
            </ul>
          </TimelineItem>

          {/* Блок 2: Церемония */}
          <TimelineItem time="14:00 – 14:30" title="Выездная церемония бракосочетания">
            <ul style={styles.list}>
              <li>Начало церемонии. Гости занимают свои места</li>
              <li>Обмен кольцами.</li>
              <li>Первые поздравления и общая фотосессия</li>
            </ul>
          </TimelineItem>

          {/* Блок 3: Первый банкет */}
          <TimelineItem time="14:30 – 15:20" title="Первый банкетный блок: знакомство и атмосфера">
            <ul style={styles.list}>
              <li>Приветственный тост родителей</li>
              <li>Первый тост молодожёнов</li>
              <li>Объявление правил свадьбы (в шуточной форме)</li>
              <li>Интерактив на сплочение</li>
              <li>«Смешной квиз о паре»</li>
            </ul>
          </TimelineItem>

          {/* Блок 4: Музыкальная пауза */}
          <TimelineItem time="15:20 – 15:40" title="Музыкальная пауза">
            <p style={styles.text}>Гости общаются, танцуют, продолжают трапезу</p>
          </TimelineItem>

          {/* Блок 5: Второй банкет */}
          <TimelineItem time="15:40 – 16:30" title="Второй банкетный блок: развлечения и энергия">
            <ul style={styles.list}>
              <li><strong>Первый танец молодожёнов</strong> — романтичный выход пары</li>
              <li>Интерактивные игры: «Кто лучше знает молодожёнов?»</li>
              <li>«Своя игра» с музыкальным сопровождением</li>
              <li><strong>Общая ламбада!</strong> Все в танец!</li>
            </ul>
          </TimelineItem>

          {/* Блок 6: Пауза */}
          <TimelineItem time="16:30 – 16:50" title="Музыкальная пауза">
            <p style={styles.text}>Свободное время для гостей</p>
          </TimelineItem>

          {/* Блок 7: Развлечения */}
          <TimelineItem time="16:50 – 18:30" title="Танцевально-развлекательная программа">
            <ul style={styles.list}>
              <li>Конкурсы: весёлые и подвижные игры</li>
              <li>Музыкальное бинго — угадывай мелодии и выигрывай призы</li>
              <li><strong>Букет и бутоньерка</strong> — в оригинальной форме (револьвер, алкотестер)</li>
              <li><strong>Создание семейного очага</strong> — ритуал объединения огней двух семей</li>
            </ul>
          </TimelineItem>

          {/* Блок 8: Свободные танцы */}
          <TimelineItem time="17:50 – 18:30" title="Свободные танцы">
            <p style={styles.text}>Гости отдыхают, общаются и танцуют</p>
          </TimelineItem>

          {/* Блок 9: Финал */}
          <TimelineItem time="18:30 – 19:40" title="Финальная часть праздника">
            <ul style={styles.list}>
              <li><strong>Вынос и разрезание торта</strong> — торжественный момент</li>
              <li>«Продажа» первого куска на удачу (средства — в копилку молодых)</li>
              <li>Второй и третий кусок — в подарок мамам</li>
              <li>Народные танцы: «Кадышева», хоровод — все вместе!</li>
            </ul>
          </TimelineItem>

          {/* Блок 10: Финальный аккорд */}
          <TimelineItem time="19:40 - 20:00" title="Финальный аккорд">
            <ul style={styles.list}>
              <li>Общий финальный танец или салют (по желанию)</li>
              <li>Благодарственное слово молодожёнов</li>
              <li>Официальная программа завершена. Начинается вечеринка для желающих продолжить!</li>
            </ul>
          </TimelineItem>
        </motion.div>
      </div>
    </section>
  );
}

// Стили
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
  blockTitle: {
    fontSize: "1.3rem",
    color: "#333",
    margin: "0 0 10px 0",
    fontWeight: "500",
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