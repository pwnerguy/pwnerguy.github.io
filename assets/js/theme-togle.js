
(function() {
  const root = document.documentElement;
  const storedTheme = localStorage.getItem("theme");

  if (storedTheme) {
    root.setAttribute("data-theme", storedTheme);
  }

  document.getElementById("theme-toggle").addEventListener("click", function() {
    const currentTheme = root.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    root.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });
})();
