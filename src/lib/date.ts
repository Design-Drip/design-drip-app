export function formatOrderDate(dateString: string | Date): string {
  const date = new Date(dateString);

  // Format: Jan 01, 2023
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function formatOrderDateTime(dateString: string | Date): string {
  const date = new Date(dateString);

  // Format: Jan 01, 2023, 13:45
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
