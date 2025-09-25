// src/components/Location.jsx
import { motion, useAnimation } from "framer-motion";
import { useInView } from "framer-motion";
import { useEffect, useRef } from "react";

export default function Location() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <section ref={ref} style={styles.section}>
      <div style={styles.container}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6 },
            },
          }}
          style={styles.heading}
        >
          Время и место
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { delay: 0.3, duration: 0.6 },
            },
          }}
          style={styles.text}
        >
          <p style={styles.time}>
            <strong>Сбор:</strong> с 13:00
            <br />
            <strong>Начало:</strong> в 14:00
          </p>
          <p style={styles.address}>
            1-й Красногвардейский проезд, 19, второй этаж
            <br />
            <strong>Ресторан Made In Georgia</strong>
          </p>
        </motion.div>

        {/* Карта Яндекс */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { delay: 0.5, duration: 0.6 },
            },
          }}
          style={styles.mapContainer}
        >
          <iframe
            src="https://yandex.ru/map-widget/v1/?ll=37.536690%2C55.750857&mode=whatshere&whatshere%5Bpoint%5D=37.536690%2C55.750857&whatshere%5Bzoom%5D=17&z=17"
            width="100%"
            height="350"
            frameBorder="0"
            style={styles.map}
            allowFullScreen
            title="Место проведения свадьбы"
          ></iframe>
        </motion.div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "80px 20px",
    background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
    textAlign: "center",
    overflow: "hidden",
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    borderRadius: "var(--border-radius)",
  },
  heading: {
    fontSize: "1.9rem",
    fontWeight: "500",
    color: "#333",
    marginBottom: "30px",
  },
  text: {
    fontSize: "1.1rem",
    color: "#444",
    marginBottom: "30px",
    lineHeight: "1.6",
  },
  time: {
    marginBottom: "15px",
    fontWeight: "500",
  },
  address: {
    fontWeight: "400",
    color: "#555",
  },
  mapContainer: {
    marginTop: "20px",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
  },
  map: {
    borderRadius: "12px",
    border: "none",
  },
};