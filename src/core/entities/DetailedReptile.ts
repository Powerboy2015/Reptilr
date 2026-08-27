import { DetailedReptileDTO, FeedingEntry } from "../../types";

interface CreateReptileProps {
    id: string;
    name: string;
    birth_date: string;
    feedings: FeedingEntry[];
}
export default class DetailedReptile {
    readonly id: string;
    readonly name: string;
    readonly birth_date: string;
    feedings: FeedingEntry[];

    constructor({ id, name, birth_date, feedings }: CreateReptileProps) {
        this.id = id;
        this.name = name;
        this.birth_date = birth_date;
        this.feedings = feedings;
    }

    static fromDTO(dto: DetailedReptileDTO): DetailedReptile {
        return new DetailedReptile({
            id: dto.id,
            name: dto.name,
            birth_date: dto.birth_date,
            feedings: dto.feedings,
        });
    }
}
