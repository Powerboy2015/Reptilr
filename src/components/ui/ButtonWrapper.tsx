
interface ButtonWrapperProps extends React.HTMLAttributes<HTMLButtonElement> {
}

export default function ButtonWrapper({ children, ...props }: ButtonWrapperProps) {
    return <button className="rounded aspect-square min-w-11 hover:bg-[#89CFF0]/15 active:bg-[#89CFF0]/25 focus-visible:outline-2 focus-visible:outline-[#89CFF0]" {...props}>
        {children}
    </button>
}
