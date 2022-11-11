import { useState } from "react";
import { FaMoon } from "react-icons/fa";
import { FiSun } from "react-icons/fi";

export default function Toggle() {
  const [darkModeSet, setDarkMode] = useState();

  const handleClick = () => {
    let theme = localStorage.getItem("theme");

    // if theme is set on dark mode change it to light mode
    if (theme == "dark") {
      document.documentElement.classList.remove("dark");
      document.body.removeAttribute("class");
      document.body.className = "bg-yellow-50";
      localStorage.theme = "light";
      setDarkMode(true);
    } else {
      document.documentElement.classList.add("dark");
      document.body.removeAttribute("class");
      document.body.className = "bg-dark-mode";
      localStorage.theme = "dark";
      setDarkMode(false);
    }
  };

  return (
    <div onClick={() => handleClick()} className="cursor-pointer">
      {darkModeSet == true ? <FiSun /> : <FaMoon />}
    </div>
  );
}
