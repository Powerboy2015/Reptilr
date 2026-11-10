export type ReptileDTO = {
    id: string;
    name: string;
    birth_date: string;
    species: string;
    weight_grams: number;
    length_cm: number;
    last_shed: string;
};

export type AddReptileInput = {
    name: string;
    species: string;
    birth_date?: string;
    weight_grams?: number;
    length_cm?: number;
    last_shed?: string;
};

export type GrowthEntry = {
    id: string;
    date: string;
    weight_grams: number;
    length_cm: number;
};

export type DetailedReptileDTO = {
    id: string;
    name: string;
    birth_date: string;
    species: string;
    weight_grams: number;
    length_cm: number;
    last_shed: string;
    feedings: FeedingEntry[];
    growth: GrowthEntry[];
};

export enum ENVIRONMENT {
    MOCK = 1,
    DEV = 0,
    RELEASE = 2,
}

export type FeedingEntry = {
    id: string;
    date: string;
    foodType: SnakeFood;
    amount: number;
    powdered: boolean;
    powderType: string;
};

export type FeedingInput = Omit<FeedingEntry, "id">;

export enum SnakeFood {
    XS_PINKY = "Extra Small pinky",
    SM_PINKY = "Small pinky",
    LG_PINKY = "Large pinky",
    P_FUZZY = "P Fuzzy",
    FUZZY = "Fuzzy",
    SMALL = "Small mouse",
    MEDIUM = "Medium mouse",
    LARGE = "Large mouse",
    X_LARGE = "Extra large mouse",
}
