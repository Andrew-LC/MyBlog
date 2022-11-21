import { getSingleBlogPage, getAllIds } from "../../lib/notion";
import Layout from "../../components/layouts/main";
import Head from "next/head";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { gruvboxDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';


const CodeBlock = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={gruvboxDark}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

export default function Post({ data }) {
  return (
    <Layout>
      <Head>
        <title>{data.title}</title>
      </Head>
      <div className="pt-28 lg:pt-24 p-6 lg:w-6/12">
        <div className="mx-auto max-w-[74ch]">
          <h1 className="font-extrabold pb-3 text-3xl lg:text-4xl">
            {data.title}
          </h1>
          <span className="block text-black-100 font-light pb-4">
            {data.date}
          </span>
        </div>
        <hr className="pb-4" />
        <section className="mx-auto prose prose-lg  prose-stone prose-h1:font-bold prose-h1:text-3xl  prose-h2:text-2xl prose-h2:font-bold prose-h3:text-xl prose-h3:font-bold prose-pre:p-0 prose-pre:bg-transparent prose-code:p-0 prose-p:text-justify prose-a:text-orange-400  prose-a:no-underline prose-img:mx-auto prose-img:rounded-md dark:prose-invert">
          <ReactMarkdown rehypePlugins={[rehypeRaw]} components={CodeBlock}>
            {data.mdstring}
          </ReactMarkdown>
        </section>
      </div>
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
