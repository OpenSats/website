import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import useSWR from "swr";
import { fetchPostJSON } from "../utils/api-helpers";
import logo from "../public/logo3.svg";
import Link from "next/link";
import ProjectList from "../components/ProjectList";
import PaymentModal from "../components/PaymentModal";

const Header = () => {
    return (
        <header className="bg-white p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <div className="flex items-center w-[200px] py-4 pr-8">
                    <Link href="/" passHref>
                        <Image alt="OpenSats logo" src={logo} className="cursor-pointer" />
                    </Link>
                </div>
                <nav>
                    <ul className="flex flex-col sm:flex-row gap-4">
                        <li><Link href="/projects"><a>Projects</a></Link></li>
                        <li>List Your Project</li>
                        <li><Link href="/faq"><a>FAQ</a></Link></li>
                        <li><Link href="/about"><a>About Us</a></Link></li>
                    </ul>
                </nav>
            </div>

            {/* <div className="space-x-2">
                <span>Developers: </span>
                <button>Register</button>
            </div> */}
        </header>
    )
}

export default Header
