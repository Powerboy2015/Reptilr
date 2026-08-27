import {ReptileDTO} from "../../types.ts";

interface CreateReptileProps {
    id: string,
    name: string,
    birth_date: string
}
export default class Reptile {
    readonly id: string
    readonly name: string
    readonly birth_date: string
    constructor({id,name,birth_date}:CreateReptileProps)
    {
        this.id = id;
        this.name = name;
        this.birth_date = birth_date;
    }

    static fromDTO(dto:ReptileDTO): Reptile
    {
        return new Reptile({
            id: dto.id,
            name: dto.name,
            birth_date:dto.birth_date,
        });
    }
}