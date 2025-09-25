// src/components/Footer.jsx
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <section style={styles.footer}>
      <div style={styles.container}>
        {/* 📞 Контактная информация */}
        <div style={styles.contactSection}>
          <h2 style={styles.title}>Контакты</h2>
          <p style={styles.subtitle}>
            По всем вопросам, касающимся торжества, вы можете написать или позвонить
          </p>
          <div style={styles.phoneContainer}>
            <div style={styles.phoneItem}>
              <span style={styles.phone}>8 (905) 548-97-03</span>
              <span style={styles.name}>Всеволод</span>
            </div>
            <div style={styles.phoneItem}>
              <span style={styles.phone}>8 (915) 236-63-46</span>
              <span style={styles.name}>Екатерина</span>
            </div>
          </div>
          <p style={styles.invitation}>
            Мы будем очень рады, если вы будете в этот день с нами и разделите наше счастье!
          </p>
        </div>

        {/* 💬 Блок с вопросами */}
        <div style={styles.questionsSection}>
          <h3 style={styles.questionsTitle}>Пожалуйста, дайте нам знать</h3>
          <ul style={styles.questionsList}>
            <li>Если не сможете посетить нас</li>
            <li>Если опоздаете — не переживайте, главное — прийти!</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

const styles = {
  footer: {
    padding: "60px 20px",
    background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))", // ✅ Градиентный фон
    textAlign: "center",
    fontFamily: "--font-secondary",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    color: "#fff", 
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  contactSection: {
    marginBottom: "40px",
  },
  title: {
    fontSize: "2rem",
    color: "#333",
    marginBottom: "10px",
    fontWeight: "500",
    lineHeight: "1.2",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#333",
    marginBottom: "15px",
    lineHeight: "1.6",
  },
  phoneContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  phoneItem: {
    textAlign: "center",
  },
  phone: {
    fontSize: "1.2rem",
    fontWeight: "500",
    color: "#f49fc7ff",
    display: "block",
    marginBottom: "5px",
  },
  name: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#333",
    display: "block",
  },
  invitation: {
    fontSize: "1.1rem",
    color: "#333",
    fontStyle: "italic",
    lineHeight: "1.6",
    marginTop: "15px",
  },
  questionsSection: {
    padding: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Полупрозрачный белый
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    backdropFilter: "blur(10px)", // Эффект стекла
  },
  questionsTitle: {
    fontSize: "1.3rem",
    color: "#333",
    marginBottom: "15px",
    fontWeight: "500",
  },
  questionsList: {
    margin: "0",
    padding: "0",
    listStyle: "none",
    textAlign: "left",
    fontSize: "0.95rem",
    lineHeight: "1.6",
    color: "#333",
  },
};