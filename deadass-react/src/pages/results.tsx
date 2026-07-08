import {
  useSearchParams,
} from "react-router-dom";

import { Link } from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import type {
  RagResponse,
} from "../types/rag";

import AnswerCard
from "../components/AnswerCard";

import SourceCard
from "../components/SourceCard";

import SearchBar 
from "../components/Searchbar";

import "../App.css";

function Results() {
  const [searchParams] =
    useSearchParams();

  const query =
    searchParams.get("q");

  const [question, setQuestion] = useState(query ?? "");
  const [data, setData] =
    useState<RagResponse | null>(
      null
    );

  useEffect(() => {
    async function fetchResults() {
      const res =
        await fetch(
          `https://racheljoseph-webdev-backend.azurewebsites.net/rag?query=${encodeURIComponent(
            query ?? ""
          )}`
        );

      const result:
        RagResponse =
        await res.json();

      setData(result);
    }

    if (query)
      fetchResults();
  }, [query]);

  if (!data)
    return(
    <div className="loading">
      Searching...
    </div>);

  return (
  <div className="results-page">
    <div className="results-container">
      <div className="results-search-row">
      <Link to="/search" className="logo results-d">
        <span>D</span>
      </Link>

      <SearchBar
        question={question}
        setQuestion={setQuestion}
      />
    </div>


      <AnswerCard answer={data.answer} />

      <h2 className="sources-title">
        Sources
      </h2>

      {data.sources.slice(0, 4).map((src, index) => (
        <SourceCard
          key={index}
          text={src.text}
        />
      ))}
    </div>
  </div>
);
}

export default Results;