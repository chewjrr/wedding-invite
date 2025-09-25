// src/components/Gifts.jsx
import { motion } from "framer-motion";

export default function Gifts() {
  return (
    <section id="gifts" style={styles.section}>
      <div style={styles.container}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={styles.icon}
        >
          💍
        </motion.div>

        <h2 style={styles.title}>Подарки</h2>
        <p style={styles.text}>
          Мы будем признательны за вклад в бюджет нашей молодой семьи.
        </p>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "60px 20px",
    background: "var(--color-bg-alt, #f9f7fa)",
    textAlign: "center",
    fontFamily: "Poppins, sans-serif",
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
  },
  icon: {
    fontSize: "3rem",
    marginBottom: "16px",
  },
  title: {
    fontSize: "2rem",
    fontFamily: "--font-primary",
    color: "var(--color-text, #333)",
    marginBottom: "16px",
    fontWeight: "500",
  },
  text: {
    fontSize: "1.1rem",
    color: "#444",
    lineHeight: "1.6",
    marginBottom: "12px",
  },
  subtext: {
    fontSize: "0.95rem",
    color: "#666",
    fontStyle: "italic",
    lineHeight: "1.6",
  },
};