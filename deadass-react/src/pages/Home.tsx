import { useState } from "react";

import Logo from "../components/logo";
import SearchBar from "../components/Searchbar";
import UploadBox from "../components/Uploadbox";
import UserMenu from "../components/UserMenu";

import "../App.css";

function Home() {
  const [question, setQuestion] = useState("");

  return (
    <div className="home-page">
      <UserMenu />

      <Logo />

      <SearchBar
        question={question}
        setQuestion={setQuestion}
      />
      <UploadBox />
    </div>
  );
}

export default Home;