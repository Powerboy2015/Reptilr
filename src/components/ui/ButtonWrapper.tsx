
interface ButtonWrapperProps extends React.HTMLAttributes<HTMLButtonElement> {
}

export default function ButtonWrapper({ children, ...props }: ButtonWrapperProps) {
    return <button className="hover:bg-white/5 active:bg-white/10 rounded aspect-square min-w-11" {...props}>
        {children}
    </button>
}