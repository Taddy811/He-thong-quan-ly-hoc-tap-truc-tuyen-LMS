"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";

  const storedTheme = window.localStorage.getItem("theme");
  if (storedTheme === "dark" || storedTheme === "light") return storedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyTheme = (theme: Theme) => {
  const isDark = theme === "dark";

  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.body?.classList.toggle("dark", isDark);
  if (document.body) document.body.dataset.theme = theme;

  document.querySelectorAll(".dashboard-theme").forEach((element) => {
    element.classList.toggle("dark-theme", isDark);
    element.setAttribute("data-theme", theme);
  });
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      className="theme-toggle h-10 w-10 rounded-lg border border-white/30 bg-white/15 text-white shadow-sm backdrop-blur-sm transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/60"
    >
      <span className="text-base leading-none">{theme === "dark" ? "☀️" : "🌙"}</span>
    </button>
  );
}
