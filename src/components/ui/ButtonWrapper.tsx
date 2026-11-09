
interface ButtonWrapperProps extends React.HTMLAttributes<HTMLButtonElement> {
}

export default function ButtonWrapper({ children, ...props }: ButtonWrapperProps) {
    return <button className="rounded aspect-square min-w-11 hover:bg-[#FF9F9F]/15 active:bg-[#FF9F9F]/25 focus-visible:outline-2 focus-visible:outline-[#FF9F9F]" {...props}>
        {children}
    </button>
}
