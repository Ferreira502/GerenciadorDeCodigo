export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function languageExtension(language: string) {
  const map: Record<string, string> = {
    JavaScript: "js",
    TypeScript: "ts",
    Python: "py",
    Java: "java",
    "C++": "cpp",
    "C#": "cs",
    PHP: "php",
    Ruby: "rb",
    Go: "go",
    Rust: "rs",
    HTML: "html",
    CSS: "css",
    SQL: "sql"
  };

  return map[language] ?? "txt";
}
