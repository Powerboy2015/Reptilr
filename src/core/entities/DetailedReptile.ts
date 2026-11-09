import type { DetailedReptileDTO, FeedingEntry, GrowthEntry } from "../../types";

interface CreateReptileProps {
    id: string;
    name: string;
    birth_date: string;
    species: string;
    weight_grams: number;
    length_cm: number;
    last_shed: string;
    feedings: FeedingEntry[];
    growth: GrowthEntry[];
}

export default class DetailedReptile {
    readonly id: string;
    readonly name: string;
    readonly birth_date: string;
    readonly species: string;
    readonly weight_grams: number;
    readonly length_cm: number;
    readonly last_shed: string;
    readonly feedings: FeedingEntry[];
    readonly growth: GrowthEntry[];

    constructor({ id, name, birth_date, species, weight_grams, length_cm, last_shed, feedings, growth }: CreateReptileProps) {
        this.id = id;
        this.name = name;
        this.birth_date = birth_date;
        this.species = species;
        this.weight_grams = weight_grams;
        this.length_cm = length_cm;
        this.last_shed = last_shed;
        this.feedings = feedings;
        this.growth = growth;
    }

    static fromDTO(dto: DetailedReptileDTO): DetailedReptile {
        return new DetailedReptile({
            id: dto.id,
            name: dto.name,
            birth_date: dto.birth_date,
            species: dto.species,
            weight_grams: dto.weight_grams,
            length_cm: dto.length_cm,
            last_shed: dto.last_shed,
            feedings: dto.feedings,
            growth: dto.growth,
        });
    }
}
