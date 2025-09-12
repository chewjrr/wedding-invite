import { useState } from "react";

export default function GuestbookForm({ onNewWish }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !message) return;

    setIsSubmitting(true);

    const newWish = { name, message };

    try {
      const res = await fetch(`${API_URL}/api/wish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWish),
      });

      if (res.ok) {
        const saved = await res.json();
        onNewWish(saved);
        setName("");
        setMessage("");
        alert("Спасибо за тёплое слово! 💕");
      } else {
        alert("Ошибка при отправке.");
      }
    } catch (err) {
      alert("Не удалось подключиться к серверу.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section style={formStyles.section}>
      <h2 style={formStyles.heading}>Оставить пожелание</h2>
      <form onSubmit={handleSubmit} style={formStyles.form}>
        <input
          type="text"
          placeholder="Ваше имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={formStyles.input}
          disabled={isSubmitting}
        />
        <textarea
          placeholder="Ваше тёплое пожелание"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={formStyles.textarea}
          disabled={isSubmitting}
        />
        <button type="submit" style={formStyles.button} disabled={isSubmitting}>
          {isSubmitting ? "Отправляем..." : "Отправить"}
        </button>
      </form>
    </section>
  );
}

const formStyles = {
  section: {
    padding: "60px 20px",
    textAlign: "center",
    background: "var(--color-bg)",
  },
  heading: {
    fontSize: "1.8rem",
    marginBottom: "20px",
    color: "var(--color-text)",
  },
  form: {
    maxWidth: "500px",
    margin: "0 auto 30px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "1rem",
  },
  textarea: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "1rem",
    minHeight: "80px",
    resize: "vertical",
  },
  button: {
    padding: "12px",
    backgroundColor: "var(--color-accent)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: "500",
  },
};