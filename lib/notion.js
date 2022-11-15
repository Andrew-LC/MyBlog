import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { remark } from "remark";
import html from "remark-html";


const authKey = process.env.AUTH_KEY;
const databaseId = process.env.DATABASE_ID;

const notion = new Client({ auth: authKey });
const n2m = new NotionToMarkdown({ notionClient: notion });

// Get all the blog details
export const getBlogs = async () => {
  const response = await notion.databases.query({
    database_id: databaseId,
  });

  const newData = response.results.map((post) => {
    return {
      title: post.properties.Name.title[0].plain_text,
      url: post.url,
      id: post.id.replace(/-/g, ""),
      post_time: post.created_time,
      cover: coverReturn(post.cover),
    };
  });

  return newData;
};

const coverReturn = (page) => {
  let cover = page;
  if(!cover){
    cover = ""; 
  } else if(cover.type == "external"){
    cover = page.external.url;
  } else if(cover.type == "file") {
    cover = page.file;
  }

  return cover;
}

export const getFeaturedBlogs = async () => {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      or: [
        {
          property: "Tags",
          multi_select: {
            contains: "featured post",
          },
        },
      ],
    },
    sorts: [
      {
        property: "Date",
        direction: "ascending",
      },
    ],
  });

  const newData = response.results.map((post) => {
    return {
      title: post.properties.Name.title[0].plain_text,
      url: post.url,
      id: post.id.replace(/-/g, ""),
      description: post.properties.Description.rich_text[0].plain_text,
    };
  });

  return newData;
};

// Get all the ids for the blogs
export const getAllIds = async () => {
  const data = await getBlogs();

  return data.map((ids) => {
    return {
      params: {
        id: ids.id,
      },
    };
  });
};

export const getSingleBlogPage = async (id) => {
  const response = await notion.pages.retrieve({ page_id: id });
  const title = response.properties.Name.title[0].plain_text;
  const date = response.properties.Date.date.start;

  const mdblocks = await n2m.pageToMarkdown(id);
  const mdstring = n2m.toMarkdownString(mdblocks);

  const processedContent = await remark()
    .data('settings', {fragment: true})
    .use(html)
    .process(mdstring);

  const contentHtml = processedContent.toString();

  const data = {
    title,
    date,
    contentHtml,
  };

  return data;
};
