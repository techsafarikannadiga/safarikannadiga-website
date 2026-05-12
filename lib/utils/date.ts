/**
 * Formats visit date string safely into "MMM YYYY" format
 * Handles inputs like "2025-01" (YYYY-MM) or "2025-01-15" (YYYY-MM-DD)
 */
export function formatVisitDate(visitDate: string): string {
    if (!visitDate) return "";

    try {
        // Check if it's already in ISO YYYY-MM-DD format
        // If it's YYYY-MM (e.g., length 7 like "2025-01"), append "-01"
        const dateString = visitDate.length === 7 ? `${visitDate}-01` : visitDate;
        
        const date = new Date(dateString);
        
        // Return original if failed to parse
        if (isNaN(date.getTime())) return visitDate;

        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
        });
    } catch (error) {
        console.error("Date format error:", error);
        return visitDate;
    }
}
