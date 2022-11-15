import { getSingleBlogPage, getAllIds } from "../../lib/notion";
import Layout from "../../components/layouts/main";
import { motion } from "framer-motion";
import Head from "next/head";
import { useEffect } from "react";


export default function Post({ data }) {
  useEffect(() => {
    Prism.highlightAll();
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
        <div className="mx-auto max-w-[74ch]">
          <h1 className="font-extrabold pb-3 text-3xl lg:text-4xl">{data.title}</h1>
          <span className="block text-black-100 font-light pb-4">
            {data.date}
          </span>
        </div>
        <hr className="pb-4" />
        <section
          className="mx-auto prose prose-lg  prose-stone prose-p:text-justify prose-img:rounded-md dark:prose-invert"
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
