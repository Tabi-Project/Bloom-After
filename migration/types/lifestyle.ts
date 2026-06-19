export interface Tip {
    title: string;
    desc: string;
    description?: string; //legacy support
};

export interface Lifestyle {
    id: string;
    title: string;
    category: string;
    subtitle: string;
    summary: string;
    foundation: string[];
    tips: Tip[];
    evidence: string[];
    status: string;
    published: boolean;
    createdAt: Date | string | null;
    updatedAt: Date | string | null;
}

// Raw shape returned by the API. Every field is optional because the payload is
// untrusted — `normalizeLifestyle` supplies defaults for anything missing.
export interface LifestyleApiData {
    id?: string;
    _id?: string;
    slug?: string;
    title?: string;
    category?: string;
    subtitle?: string;
    summary?: string;
    foundation?: string[];
    tips?: Tip[];
    evidence?: string[];
    status?: string;
    published?: boolean;
    createdAt?: Date | string | null;
    updatedAt?: Date | string | null;
}

export interface FetchLifestyleParams {
    page?: number;
    limit?: number;
    category?: string;
    q?: string;
    published?: boolean;
}

export interface Pagination {
    totalResources: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

// Envelopes the API wraps responses in.
export interface LifestyleListResponse {
    data?: LifestyleApiData[];
    pagination?: Pagination;
}

export interface LifestyleItemResponse {
    data?: LifestyleApiData;
}