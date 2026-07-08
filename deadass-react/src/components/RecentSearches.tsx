import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface RecentSearchesProps {
  setQuestion: React.Dispatch<React.SetStateAction<string>>;
}

function RecentSearches({
  setQuestion,
}: RecentSearchesProps) {
  const navigate = useNavigate();
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("searchHistory") || "[]"
    );

    setHistory(saved);
  }, []);

  function handleClick(query: string) {
    setQuestion(query);

    navigate(
      `/results?q=${encodeURIComponent(query)}`
    );
  }

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="recent-searches">
      <h3>Recent Searches</h3>

      {history.map((query) => (
        <button
          key={query}
          className="history-item"
          onClick={() => handleClick(query)}
        >
          🕒 {query}
        </button>
      ))}
    </div>
  );
}

export default RecentSearches;