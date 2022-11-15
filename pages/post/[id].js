import { getSingleBlogPage, getAllIds } from "../../lib/notion";
import Layout from "../../components/layouts/main";
import { motion } from "framer-motion";
import Head from "next/head";
import { useEffect } from "react";
import Prism from "prismjs";

require("prismjs/components/prism-javascript")

require("prismjs/components/prism-css")

require("prismjs/components/prism-jsx")

export default function Post({ data }) {
  useEffect(() => {
    Prism.highlightAll();
    const pre = document.querySelector("pre");
    if(pre !== null)
      pre.classList.add("language-javascript");
  }, []);

  return (
    <Layout>
      <Head>
        <title>{data.title}</title>
      </Head>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="pt-28 lg:pt-24 p-6 lg:w-6/12"
      >
        <div className="ml-0 md:ml-[6rem] lg:ml-[2.6rem]">
          <h1 className="font-extrabold pb-3 text-3xl">{data.title}</h1>
          <span className="block text-black-100 font-light pb-4">
            {data.date}
          </span>
        </div>
        <hr className="pb-4" />
        <section
          className="mx-auto text-justify prose prose-lg  prose-stone  prose-img:rounded-md dark:prose-invert lg:prose-lg"
          dangerouslySetInnerHTML={{ __html: data.contentHtml }}
        ></section>
      </motion.div>
    </Layout>
  );
}

//export async function getStaticPaths() {
//  const paths = await getAllIds();
//  return {
//    paths,
//    fallback: false,
//  }
//}

export async function getServerSideProps({ params }) {
  const data = await getSingleBlogPage(params.id);

  return {
    props: { data },
  };
}
