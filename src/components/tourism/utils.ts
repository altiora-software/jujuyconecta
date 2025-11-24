// src/components/tourism/utils.ts
export function formatCategory(category: string) {
    switch (category) {
      case "naturaleza":
        return "Naturaleza";
      case "cultura":
        return "Cultura y patrimonio";
      case "gastronomia":
        return "Gastronomía";
      case "aventura":
        return "Aventura";
      case "urbano":
        return "Turismo urbano";
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }
  
  export function formatDifficulty(d: "facil" | "media" | "dificil") {
    if (d === "facil") return "Fácil";
    if (d === "media") return "Media";
    return "Difícil";
  }
  
  export function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("es-AR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  }
  