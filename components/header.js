import Link from "next/link";
import Toggle from "./toggle";
import { IoClose } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";

export default function Navigation() {
  const handleClose = () => {
    let nav = document.getElementById("mobile-nav");
    nav.classList.add("hidden");
  };

  const handleClick = () => {
    let nav = document.getElementById("mobile-nav");
    nav.classList.remove("hidden");
  };

  return (
    <header className="w-screen shadow-sm backdrop-blur-lg backdrop-filter flex justify-center fixed">
      <div className="w-full p-4 flex items-center justify-between bg-transparent lg:w-6/12">
        <Link  href={"/"} className="text-lg font-cassannet font-extrabold">
          Andrew Lamichhane
        </Link>

        {/* ------------- Mobile Navigation ------------- */}
        <div
          id="mobile-nav"
          className="hidden ease-in absolute inset-0 h-screen dark:bg-dark-mode bg-yellow-50 lg:hidden"
        >
          <nav
            onClick={handleClose}
            className="relative h-full flex flex-col items-center justify-center gap-10 font-cassannet"
          >
            <IoClose
              size={"2rem"}
              className="absolute top-10 right-10 cursor-pointer hover:bg-white/50 hover:backdrop-blur-lg hover:rounded-full hover:p-1"
            />
            <Link href="/" className="font-bold text-3xl">
              Home
            </Link>
            <Link href="/blogs" className="font-bold text-3xl">
              Blog
            </Link>
            <Link
              href="https://github.com/Andrew-LC/MyBlog"
              className="font-bold text-3xl"
            >
              Source Code
            </Link>
          </nav>
        </div>

        {/* ------------- Desktop Navigation -------------*/}
        <nav className="hidden relative lg:flex w-1/2 items-center justify-end gap-4 ">
          <Link href="/blogs">Blog</Link>
          <Link href="https://github.com/Andrew-LC/MyBlog">Source Code</Link>
        </nav>

        <div className="flex items-center justify-center gap-4">
          <Toggle className="cursor-pointer" />
          <GiHamburgerMenu
            onClick={handleClick}
            size={"1.5rem"}
            className="cursor-pointer lg:hidden"
          />
        </div>
      </div>
    </header>
  );
}
