import Head from 'next/head'
import Image from 'next/image'
import Layout from '../components/layouts/main'
import IconBox from '../components/iconbox';
import Section from '../components/section';
import IconStack from '../components/iconstack';
import profile from "../public/profile.jpg";

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Andrew Lamichhane</title>
      </Head>
      <section className="h-full pt-28 p-4 flex flex-col items-center gap-10 lg:w-6/12">
        <Section>
          <h1 className='font-extrabold text-2xl mb-4'>Andrew Lamichhane<span className='block text-lg text-center font-normal'>(Full Stack Developer)</span></h1>  
          <Image src={profile} alt="profile-image" className="rounded-full border-2 border-white w-44 h-44"/>
        </Section>
        <Section>
         <h3 className='font-semibold text-xl w-9/12 underline'>About Me:</h3>
         <p className='text-justify w-9/12 text-lg'>
          I'm a Full Stack Developer based in India. I have a passion for learning everything and tinkering around a lot.
          My hobbies include watching anime, reading manga, reading books of any kind that I can find and coming up with new ideas to cure my boredom.
         </p>
        </Section>
        <div className='w-9/12'>
         <h3 className='font-semibold text-xl  w-9/12 underline pb-4'>Technologies I Use:</h3>
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
      </section>
    </Layout>
  )
}
