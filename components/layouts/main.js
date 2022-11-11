import Head from "next/head";
import Navigation from "../header";
import Footer from "../footer";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Layout({ children }) {

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
      document.body.className = 'bg-dark-mode';
    } else {
      document.documentElement.classList.remove('dark')
      document.body.className = 'bg-yellow-50';
    }
  })

  return(
    <motion.main 
    initial={{opacity: 0}}
    animate={{opacity: 1}}
    transition={{duration: 0.6}}
    className="font-sans min-h-full bg-yellow-50 dark:bg-dark-mode dark:text-white relative scroll-smooth overflow-y-hidden  lg:flex flex-col items-center"
    id="main" 
    >
      <Head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Navigation />
      {children}
      <Footer />
    </motion.main>
  );
}