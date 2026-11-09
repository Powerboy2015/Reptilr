interface TextInputProps {
    inputName: string,
    defaultValue: string,
    onChange: (value: string) => void
}
export default function TextInput({ inputName, defaultValue, onChange }: TextInputProps) {
    return <div>
        <label className="font-bold text-white/85" htmlFor={inputName}>{inputName}</label>
        <div className="relative mt-1 rounded border border-white/20 bg-[#252525] px-2 py-1 focus-within:border-[#FF9F9F]">
            <input className="reset w-full! h-full! inset-0! text-white!"
                name={inputName}
                type={"text"}
                defaultValue={defaultValue}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    </div>
}
