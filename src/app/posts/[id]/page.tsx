import Image from "next/image";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import NewPostForm from "@/components/NewPostForm";
import Post from "@/components/Post";

async function getOnePost(inID: number) {
  const post = await prisma.post.findUnique({
    where: {
      id: inID,
    },
  });
  return post;
}

async function updatePost(post: any) {
  await prisma.post.update({
    where: {
      id: post.id,
    },
    data: {
      title: post.title,
    },
  });
}

export default async function Home({ params }: { params: { id: number } }) {
  const post = await getOnePost(params.id);
  if (!post) {
    return <p>Post not found</p>;
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <NewPostForm />

      <Button variant="outline">Button</Button>

      <div key={post.id}>
        {post.title}{" "}
        <input
          type="text"
          className="peer cursor-pointer accent-slate-300 "
          value="{post.title}"
        />
        {post.id} == -- {new Date(post.createdAt).toLocaleString()}
      </div>
    </main>
  );
}
