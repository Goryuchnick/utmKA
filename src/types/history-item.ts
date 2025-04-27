
// Interface for history items
export interface HistoryItem {
    id: string;
    url: string;
    date: Date | string; // Allow Date object or ISO string
}
