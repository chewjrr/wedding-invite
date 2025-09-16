// src/components/GuestbookForm.jsx
import { useState } from "react";

export default function GuestbookForm({ onNewWish }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Получаем URL из .env (через Vite)
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSubmitting(true);

    const newWish = { name: name.trim(), message: message.trim() };

    console.log("📤 Отправка пожелания:", newWish);

    try {
      const res = await fetch(`${API_URL}/api/wish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newWish),
      });

      console.log("📡 Статус ответа:", res.status, res.statusText);

      // Если сервер вернул 201 — всё ок
      if (res.ok) {
        let savedWish;
        try {
          savedWish = await res.json(); // Пытаемся распарсить JSON
          console.log("✅ Успешно сохранено в базу:", savedWish);
        } catch (parseError) {
          console.warn("⚠️ Не удалось распарсить JSON. Возможно, проблема с CORS", parseError);
          // Если JSON не пришёл (из-за CORS), используем локальные данные
          savedWish = { ...newWish, id: Date.now(), createdAt: new Date().toISOString() };
        }

        // Добавляем в список на фронтенде
        onNewWish(savedWish);

        // Очищаем форму
        setName("");
        setMessage("");

        alert("Спасибо за тёплое слово! 💕");
      } else {
        // Сервер вернул ошибку
        const errorText = await res.text();
        console.error("❌ Ошибка от сервера:", res.status, errorText);
        alert(`Ошибка ${res.status}: ${errorText}`);
      }
    } catch (err) {
      console.error("🔴 Ошибка сети/запроса:", err);
      // Даже если ошибка — возможно, сервер получил данные
      const confirm = window.confirm(
        "Пожелание могло быть отправлено, но произошла ошибка.\n" +
        "Хотите считать, что оно доставлено? (для отображения в интерфейсе)"
      );
      if (confirm) {
        const optimisticWish = {
          ...newWish,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        };
        onNewWish(optimisticWish);
        setName("");
        setMessage("");
        alert("Пожелание добавлено в список (возможно, уже в базе).");
      }
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
          name="name"
          disabled={isSubmitting}
        />
        <textarea
          placeholder="Ваше тёплое пожелание"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={formStyles.textarea}
          name="message"
          disabled={isSubmitting}
        />
        <button type="submit" style={formStyles.button} disabled={isSubmitting}>
          {isSubmitting ? "Отправляется..." : "Отправить"}
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