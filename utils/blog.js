import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import rehypeSlug from "rehype-slug";

const RootDirectory = path.join(process.cwd(), "content", "blog");

const GetAllPosts = () => {
  return fs.readdirSync(RootDirectory);
};

const GetPostMeta = (currentSlug) => {
  const slug = currentSlug.replace(/\.mdx$/, "");
  const filePath = path.join(RootDirectory, `${slug}.mdx`);
  const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });

  const { data, content } = matter(fileContent);

  return {
    meta: {
      ...data,
      slug,
    },
    content,
  };
};

export const GetNoteBySlug = async (slug) => {
  const meta = GetPostMeta(slug);
  const { content } = meta;

  const mdxSource = await serialize(content, {
    mdxOptions: {
      rehypePlugins: [rehypeSlug],
    },
  });

  return {
    ...meta,
    source: mdxSource,
  };
};


export const GetAllPostsMeta = () => {
  return GetAllPosts().map((file) => GetPostMeta(file));
};

export const GetAllSlugs = () => {
  return GetAllPosts().map((file) => file.replace(/\.mdx$/, ""));
};