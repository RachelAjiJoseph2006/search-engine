import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { MdHistory } from "react-icons/md";

interface SearchBarProps {
  question: string;
  setQuestion: React.Dispatch<React.SetStateAction<string>>;
}

function SearchBar({
  question,
  setQuestion,
}: SearchBarProps) {
  const navigate = useNavigate();

  const [showHistory, setShowHistory] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const history: string[] = JSON.parse(
    localStorage.getItem("searchHistory") || "[]"
  );

  const filteredHistory = history.filter((item) =>
    item.toLowerCase().includes(question.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowHistory(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  function saveSearch(query: string) {
    const history: string[] = JSON.parse(
      localStorage.getItem("searchHistory") || "[]"
    );

    const updated = [
      query,
      ...history.filter((item) => item !== query),
    ].slice(0, 10);

    localStorage.setItem(
      "searchHistory",
      JSON.stringify(updated)
    );
  }

  function handleSearch(query = question) {
    const trimmed = query.trim();

    if (!trimmed) return;

    saveSearch(trimmed);
    setShowHistory(false);

    navigate(
      `/results?q=${encodeURIComponent(trimmed)}`
    );
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <div
      className="search-wrapper"
      ref={wrapperRef}
    >
      <input
        className="search-input"
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onFocus={() => setShowHistory(true)}
        onKeyDown={handleKeyDown}
        placeholder="Ask something..."
      />

      <button
        className="search-button"
        onClick={() => handleSearch()}
      >
        🔍
      </button>

      {showHistory && filteredHistory.length > 0 && (
        <div className="history-dropdown">
          {filteredHistory.map((item) => (
            <button
              key={item}
              className="history-dropdown-item"
              onClick={() => {
                setQuestion(item);
                handleSearch(item);
              }}
            >
            <MdHistory className="history-icon" />
              <span>{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;