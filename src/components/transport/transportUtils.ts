export const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive" as const;
      case "medium":
        return "outline" as const;
      case "low":
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };
  
  export const getSeverityText = (severity: string) => {
    switch (severity) {
      case "high":
        return "Alta";
      case "medium":
        return "Media";
      case "low":
        return "Baja";
      default:
        return "Media";
    }
  };
  