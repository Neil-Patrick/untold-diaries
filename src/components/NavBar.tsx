import React from "react";
import Link from 'next/link'

const NavBar = () => 
{
    return (
        <nav className="relative z-20 flex items-center justify-between gap-4 px-4 py-6 sm:px-8 md:px-11 md:py-10 bg-transparent text-white font-primary text-lg sm:text-xl md:text-2xl">
            <Link href="/" className="shrink-0">Untold Diaries</Link>
            <div className="flex gap-4 sm:gap-8 md:gap-16">
                <Link className="hover:text-purple-500" href="/submit">Submit</Link>
                <Link className="hover:text-purple-500" href="/browse">Browse</Link>
            </div>
        </nav>
    )
}

export default NavBar;