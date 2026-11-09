export default function Header() {
    return <header className="w-full min-h-16 text-white text-2xl">
        <div className="w-full h-full flex justify-between items-center">
            <p className='min-w-11 h-1'></p>
            {/* <UI.button onClick={handleMenuOpen}>
                <MenuIcon fontSize={"large"} />
            </UI.button> */}
            <p>Lina's pet list</p>
            <p className='min-w-11 h-1'></p>
        </div>
    </header>
}
