import { createFileRoute } from "@tanstack/react-router";
import { usePosts, useCreatePost } from "../lib/hooks/use-queries.js";
import { Button } from "@benchhy/ui";

export const Route = createFileRoute("/posts")({
  component: PostsComponent,
});

function PostsComponent() {
  const { data, isLoading } = usePosts();
  const createMutation = useCreatePost();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Posts</h1>
      <Button
        onClick={() =>
          createMutation.mutate({
            title: "New Post",
            content: "Content",
            status: "published",
            authorId: "1",
          })
        }
      >
        Add Post
      </Button>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {data?.posts.map((p) => (
            <li key={p.id} className="p-2 border rounded">
              {p.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
