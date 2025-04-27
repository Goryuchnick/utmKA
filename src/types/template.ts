
// Interface for Template Groups
export interface TemplateGroup {
    id: string;
    name: string;
}

// Updated Template interface: Only name, source, and medium are main data points.
// Added createdAt for sorting/filtering and groupId for grouping.
export interface Template {
    id: string;
    name: string;
    utm_source?: string;
    utm_medium?: string;
    createdAt: Date; // Added creation timestamp
    groupId?: string; // Optional group ID
}
