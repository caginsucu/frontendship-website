import fs from 'fs';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import path from 'path';
import readingTime from 'reading-time';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';

const RootDirectory = path.join(process.cwd(), 'src', 'content', 'blog');

const GetAllPosts = () => {
  return fs.readdirSync(RootDirectory);
};

const GetPostMeta = currentSlug => {
  const slug = currentSlug.replace(/\.mdx$/, '');
  const filePath = path.join(RootDirectory, `${slug}.mdx`);
  const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });

  const { data, content } = matter(fileContent);
  const readTime = readingTime(content).text;

  return {
    meta: {
      ...data,
      slug,
      readTime
    },
    content
  };
};

const prettyCodeOptions = {
  theme: 'github-light',
  onVisitLine(node) {
    if (node.children.length === 0) {
      node.children = [{ type: 'text', value: ' ' }];
    }
  },
  onVisitHighlightedLine(node) {
    node.properties.className.push('highlighted');
  },
  onVisitHighlightedWord(node) {
    node.properties.className = ['highlighted', 'word'];
  }
};

export const GetNoteBySlug = async slug => {
  const meta = GetPostMeta(slug);
  const { content } = meta;

  const mdxSource = await serialize(content, {
    mdxOptions: {
      rehypePlugins: [rehypeSlug, [rehypePrettyCode, prettyCodeOptions]]
    }
  });

  return {
    ...meta,
    source: mdxSource
  };
};

export const GetAllPostsMeta = () => {
  return GetAllPosts().map(file => GetPostMeta(file));
};

export const GetAllSlugs = () => {
  return GetAllPosts().map(file => file.replace(/\.mdx$/, ''));
};
