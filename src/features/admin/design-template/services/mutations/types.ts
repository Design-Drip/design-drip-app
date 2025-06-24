export interface IDesignTemplatesPayload {
    name: string,
    imageUrl: string,
    category: "logo" | "banner" | "poster" | "business-card" | "flyer" | "social-media" | "brochure" | "presentation" | "invitation" | "certificate",
}

export interface IUpdateDesignTemplate extends IDesignTemplatesPayload {
    designTemplateId: string;
}

export interface IUpdateActiveStatusDesignTemplate {
    designTemplateId: string;
    isActive: boolean
}