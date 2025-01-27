export interface Styling {
    text_color: string;
    text_bold: boolean;
    background_color: string;
    indents: number;
    border: string;
}

export interface FinancialData {
    metrics: Array<{
        section: {
            name: string;
            order: number;
            styling: Styling;
            empty_row_after: boolean;
        };
        category: {
            name: string;
            order: number;
            styling: Styling;
            empty_row_after: boolean;
        };
        subcategory: {
            name: string;
            order: number;
            styling: Styling;
            empty_row_after: boolean;
        };
        subsubcategory: {
            name: string;
            order: number;
            styling: Styling;
            empty_row_after: boolean;
        };
        name: {
            name: string;
            order: number;
            link?: string; // Optional as not all names have links
            styling: Styling;
            empty_row_after: boolean;
        };
        unit: string;
        source: {
            value: string;
            link?: string; // Optional source link
            styling: Styling;
        };
        tag_id: string;
        values: Array<{
            period: string;
            fiscal: string;
            fiscal_date: string;
            value: string | number | null; // Include null for missing values
            formula?: string | null; // Optional formula field
            comment?: string | null; // Optional comment field
            link?: string | null; // Optional link field
            styling: Styling;
        }>;
    }>;
}


export interface TransformedData {
    rows: any[]
    columns: {
        key: string
        name: string
        width: number
    }[]
}

export interface RowData {
    id: string
    type: string
    name: string
    unit?: string
    source?: {
        value: string;
        link?: string; // Optional source link
    };
    tag_id?: string
    styling?: {
        text_bold?: boolean
        text_color?: string
        background_color?: string
        indents?: number
        border?: string
        comment?: string
        link?: string
    }
    [key: string]: any // For dynamic period columns
}