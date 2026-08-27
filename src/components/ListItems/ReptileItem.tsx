import Reptile from "../../core/entities/Reptile.ts";

interface ReptileListItemProps {
    reptile: Reptile;
    RouteToReptile?: () => void;
}

export default function ReptileItem({ reptile, RouteToReptile }: ReptileListItemProps) {

    const name = reptile.name !== "" ? reptile.name : "unNamed";
    const birthdate = reptile.birth_date !== "" ? reptile.birth_date : "no given date";

    return <div className="bg-[#8C5757] active:bg-[#8C5757]/80 border-2 border-[#AE8484] rounded p-2 flex flex-row justify-between items-center select-none" onClick={RouteToReptile}>
        <section className="flex flex-col ">
            <h2 className="text-2xl text-white/60">{name}</h2>
            <div>
                <div className="flex flex-row space-x-1">
                    <b>Birthdate: </b>
                    <p>{birthdate}</p>
                </div>
                <div className="flex flex-row space-x-1">
                    <b>Species: </b>
                    <p>{"sand boa"}</p>
                </div>
            </div>
        </section>
        <section className="h-full min-w-16">
            <img className="w-full h-full" src="https://placecats.com/64/64" alt="" />
        </section>
    </div>
}