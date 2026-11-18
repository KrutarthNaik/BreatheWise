export function formatTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMin = Math.round((now.getTime() - date.getTime()) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${Math.round(diffMin / 60)}h ago`;
  } catch {
    return 'Recently';
  }
}

export function formatAQILabel(category: string): string {
  switch (category.toLowerCase()) {
    case 'good': return 'Satisfactory';
    case 'moderate': return 'Moderate';
    case 'poor': return 'Poor';
    case 'unhealthy': return 'Very Unhealthy';
    case 'severe': return 'Severe';
    case 'hazardous': return 'Hazardous / Emergency';
    default: return category;
  }
}
