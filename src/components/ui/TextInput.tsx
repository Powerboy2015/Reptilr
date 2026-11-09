interface TextInputProps {
    inputName: string,
    defaultValue: string,
    onChange: (value: string) => void
}
export default function TextInput({ inputName, defaultValue, onChange }: TextInputProps) {
    return <div>
        <label className="text-[#8C5757] font-bold" htmlFor={inputName}>{inputName}</label>
        <div className={"relative px-2 py-1 bg-[#8C5757] border rounded border-[#AE8484] mt-1"}>
            <input className={"reset text-[#E5E5E5]!  w-full! h-full! inset-0!"}
                name={inputName}
                type={"text"}
                defaultValue={defaultValue}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    </div>
}
