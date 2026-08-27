import useAddReptile from "../../hooks/useAddReptile.ts";
import {useState} from "react";
import {UI} from "../ui";

export default function AddReptile() {
    const [name,setName] = useState<string>("");
    const [birthday,setBirthday] = useState<string>("");

    const updateBirthday = (birthday:string) => {
        setBirthday(birthday)
    }

    const updateName = (name:string) => {
        setName(name);
    }

    const { mutate, isPending } = useAddReptile();

    const handleAdd= () => {
        mutate({name, birth_date: birthday});
    }

    return <div>
        <div className={"flex gap-4 w-fit h-fit"}>
        <UI.input.text inputName={"name"} defaultValue={name} onChange={updateName}/>
        <UI.input.text inputName={"birthday"} defaultValue={birthday} onChange={updateBirthday} />
        </div>

        <button onClick={handleAdd} disabled={isPending} >Add reptile</button>
    </div>
}