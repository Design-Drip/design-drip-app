export interface IDesignTemplatesPayload {
    title: string,
    description: string,
    imageUrl: string,
    category: "logo" | "banner" | "poster" | "business-card" | "flyer" | "social-media" | "brochure" | "presentation" | "invitation" | "certificate",
    isActive: boolean,
    createdBy: string,
}