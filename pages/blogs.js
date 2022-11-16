import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import Layout from "../components/layouts/main";
import { getBlogs } from "../lib/notion";
import imageNotFound from "../public/picutures/image-not-found.png";

export default function Blogs({ blogs }) {
  return (
    <Layout>
      <Head>
        <title>Blogs</title>
      </Head>
      <section className="h-full pt-28 flex flex-col items-center">
        <h1 className="font-bold text-xl shadow-xl p-4">
          Check out my posts 👇
        </h1>
        <ul className="w-full p-7 grid grid-cols-1 auto-rows-auto gap-6 mb-6 lg:w-9/12 lg:grid-cols-2 md:grid-cols-2">
          {blogs.map((post) => {
            return (
              <li
                className="w-full h-64 flex flex-col items-center mb-4 lg:mb-6"
                key={post.id}
              >
                {post.cover == "" ? (
                  <Image
                    src={imageNotFound}
                    alt={post.title}
                    width={500}
                    height={450}
                    className="h-4/5 rounded-md"
                  />
                ) : (
                  <Image
                    src={post.cover}
                    alt={post.title}
                    width={500}
                    height={450}
                    className="h-4/5 rounded-md"
                  />
                )}

                <Link
                  href={`/post/${post.id}`}
                  className="text-[1.1rem] text-justify font-semibold pt-4 lg:text-md"
                  scroll={true}
                >
                  {post.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </Layout>
  );
}

export async function getServerSideProps() {
  const blogs = await getBlogs();

  return {
    props: { blogs },
  };
}
