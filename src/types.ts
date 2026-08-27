export type ReptileDTO = {
    id: string;
    name: string;
    birth_date: string;
};

export type DetailedReptileDTO = {
    id: string;
    name: string;
    birth_date: string;
    feedings: FeedingEntry[];
};

export enum ENVIRONMENT {
    MOCK = 1,
    DEV = 0,
    RELEASE = 2,
}

export type FeedingEntry = {
    date: string;
    foodType: SnakeFood;
    amount: number;
    powdered: boolean;
    powderType: string;
};

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
