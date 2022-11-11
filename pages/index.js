import Head from "next/head";
import Image from "next/image";
import Layout from "../components/layouts/main";
import IconBox from "../components/iconbox";
import Section from "../components/section";
import IconStack from "../components/iconstack";
import profile from "../public/profile.jpg";
import { getFeaturedBlogs } from "../lib/notion";
import Link from "next/link";

export default function Home({ featuredBlogs }) {
  return (
    <Layout>
      <Head>
        <title>Andrew Lamichhane</title>
      </Head>
      <section className="text-heading-light dark:text-para  h-full pt-28 p-4 flex flex-col items-center gap-10 lg:w-6/12">
        <Section>
          <h1 className="dark:text-heading font-extrabold text-2xl mb-4">
            Andrew Lamichhane
            <span className="block dark:text-para text-lg text-center font-normal">
              (Full Stack Developer)
            </span>
          </h1>
          <Image
            src={profile}
            alt="profile image"
            className="rounded-full border-2 border-white w-44 h-44"
          />
        </Section>
        <Section>
          <h3 className="dark:text-heading font-semibold text-xl w-9/12 underline">
            About Me:
          </h3>
          <p className="text-left w-9/12 text-lg">
            I'm a Full Stack Developer based in India. I have a passion for
            learning everything and tinkering around a lot. My hobbies include
            watching anime, reading manga, reading books of any kind that I can
            find and coming up with new ideas to cure my boredom.
          </p>
        </Section>
        <div className="w-9/12">
          <h3 className="dark:text-heading font-semibold text-xl w-9/12 pb-4 underline">
            Technologies I Use:
          </h3>
          <IconStack>
            <IconBox id="devicon-javascript-plain colored" />
            <IconBox id="devicon-react-original-wordmark colored" />
            <IconBox id="devicon-tailwindcss-original-wordmark colored" />
            <IconBox id="devicon-css3-plain-wordmark colored" />
            <IconBox id="devicon-html5-plain-wordmark colored" />
            <IconBox id="devicon-python-plain-wordmark colored" />
            <IconBox id="devicon-nextjs-original-wordmark" />
            <IconBox id="devicon-cplusplus-plain-wordmark" />
          </IconStack>
        </div>
        <section className="w-10/12 lg:w-9/12">
          <h3 className="text-xl font-bold text-heading-light dark:text-heading underline">
            Featured Posts
          </h3>
          {featuredBlogs.map((singlePost) => {
            return (
              <div key={singlePost.id} className="mt-4 border p-2">
                <h3 className="text-lg font-extrabold pb-1">
                  {singlePost.title}
                </h3>
                <p>
                  {singlePost.description}
                </p>
                <Link href={`/post/${singlePost.id}`} className="text-center text-orange-400 pt-1">
                  Read More
                </Link>
              </div>
            );
          })}
          <div className="w-full flex justify-center">
            <Link href={"/blogs"} className="p-4 mt-6 bg-orange-400 rounded-md">
              Read More Posts
            </Link>
          </div>
        </section>
      </section>
    </Layout>
  );
}

// Change it to static props later
export async function getServerSideProps() {
  const featuredBlogs = await getFeaturedBlogs();

  return {
    props: { featuredBlogs },
  };
}
