import { getSingleBlogPage, getAllIds } from "../../lib/notion";
import Layout from "../../components/layouts/main";
import { motion } from "framer-motion";
import Head from "next/head";

export default function Post({ data }) {
  return(
    <Layout>
      <Head>
        <title>{data.title}</title>
      </Head>
     <motion.div initial={{ opacity: 0}} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="pt-28 lg:pt-40 p-6 lg:w-6/12">
      <h1 className="font-extrabold pb-3 text-2xl">{data.title}</h1>
      <span className="block text-black-100 font-light pb-4">{data.date}</span>
      <hr className="pb-4"/>
      <section className="prose prose-stone dark:prose-invert lg:prose-lg" dangerouslySetInnerHTML={{__html: data.contentHtml}}></section> 
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
  const data = await getSingleBlogPage(params.id)

  return {
    props: {data}
  }
}