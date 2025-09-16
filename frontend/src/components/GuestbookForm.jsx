// src/components/GuestbookForm.jsx
import { useState } from "react";
import Toast from "./Toast"; // Кастомное уведомление

export default function GuestbookForm({ onNewWish }) {
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;

    const closeToast = () => setToast(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim() || !message.trim()) return;

        if (typeof onNewWish !== "function") {
            console.error("❌ onNewWish is not a function", onNewWish);
            setToast({
                message: "Ошибка приложения. Перезагрузите страницу.",
                type: "error",
            });
            return;
        }

        setIsSubmitting(true);
        setToast({ message: "Отправляется...", type: "info" });

        const newWish = { name: name.trim(), message: message.trim() };
        console.log("📤 Отправка пожелания:", newWish);

        try {
            const res = await fetch(`${API_URL}/api/wish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newWish),
            });

            console.log("📡 Статус ответа:", res.status, res.statusText);

            if (res.status === 201) {
                const savedWish = await res.json();
                console.log("✅ Успешно сохранено в базу:", savedWish);

                const formattedWish = {
                    id: savedWish.id,
                    name: savedWish.name,
                    message: savedWish.message,
                    createdAt: savedWish.created_at || savedWish.createdAt,
                };

                onNewWish(formattedWish);
                setName("");
                setMessage("");
                setToast({ message: "Пожелание отправлено! 💕", type: "success" });
            } else {
                let errorData;
                const clonedRes = res.clone();

                try {
                    errorData = await res.json();
                } catch (e) {
                    try {
                        const text = await clonedRes.text();
                        errorData = { error: text || "Неизвестная ошибка" };
                    } catch {
                        errorData = { error: "Не удалось прочитать ответ сервера" };
                    }
                }

                const errorMsg = errorData.error || "Ошибка на сервере";
                console.error("❌ Ошибка от сервера:", res.status, errorMsg);
                setToast({ message: `Ошибка: ${errorMsg}`, type: "error" });
            }
        } catch (err) {
            console.error("🔴 Ошибка сети/запроса:", err);
            setToast({
                message: "Не удалось подключиться к серверу.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
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


            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />
            )}
        </>
    );
}

const formStyles = {
    section: {
        padding: "100px 20px",
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
        backgroundColor: "#f46fa2", // Яркий розовый
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "1rem",
        cursor: "pointer",
        fontWeight: "500",
        //boxShadow: "0 4px 12px rgba(244, 111, 162, 0.2)",
        transition: "background-color 0.3s ease, transform 0.2s ease",
    },
    
};