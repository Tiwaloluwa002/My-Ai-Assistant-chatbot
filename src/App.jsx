import { useState, useEffect } from "react";
import { Assistant } from "./assistants/deepseekai";
import { Loader } from "./components/Loader/Loader";
import { Chat } from "./components/Chat/Chat";
import { Controls } from "./components/Controls/Controls";
import styles from "./App.module.css";

function App() {
  const assistant = new Assistant();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  function updateLastMessageContent(content) {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      return [
        ...prevMessages.slice(0, -1),
        { ...lastMessage, content: lastMessage.content + content },
      ];
    });
  }

  function addMessage(message) {
    setMessages((prevMessages) => [...prevMessages, message]);
  }

  async function handleContentSend(content) {
    if (!content.trim()) return;

    addMessage({ content, role: "user" });
    setIsLoading(true);

    try {
      const result = await assistant.chatStream(content, messages);
      let isFirstChunk = false;

      for await (const chunk of result) {
        if (!isFirstChunk) {
          isFirstChunk = true;
          addMessage({ content: "", role: "assistant" });
          setIsLoading(false);
          setIsStreaming(true);
        }

        updateLastMessageContent(chunk);
      }

      setIsStreaming(false);
    } catch (error) {
      console.error("Error processing request:", error);
      addMessage({
        content: "Sorry, I couldn't process your request. Please try again!",
        role: "system",
      });
      setIsLoading(false);
      setIsStreaming(false);
    }
  }

  return (
    <div className={`${styles.App} ${isDarkMode ? styles.dark : ""}`}>
      {isLoading && <Loader />}
      <header className={styles.Header}>
        <img className={styles.Logo} src="/chat-bot.png" alt="Chatbot Logo" />
        <h2 className={styles.Title}>AI Chatbot</h2>
        <button
          className={styles.ThemeToggle}
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? "🌞" : "🌙"}
        </button>
      </header>
      <div className={styles.ChatContainer} aria-live="polite">
        <Chat messages={messages} />
        {isStreaming && (
          <div className={styles.typingIndicator}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>
      <div className={styles.Controls}>
        <Controls
          isDisabled={isLoading || isStreaming}
          onSend={handleContentSend}
        />
      </div>
    </div>
  );
}

export default App;