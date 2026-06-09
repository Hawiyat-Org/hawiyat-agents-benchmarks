import { createFileRoute } from "@tanstack/react-router";
import { useInfinitePosts } from "../lib/hooks/use-queries.js";
import { Button } from "@benchhy/ui";

export const Route = createFileRoute("/infinite")({
  component: InfiniteComponent,
});

function InfiniteComponent() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePosts();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Infinite Posts</h1>
      <div className="space-y-2">
        {data?.pages.map((page, i) => (
          <div key={i}>
            {page.posts.map((p) => (
              <div key={p.id} className="p-2 border rounded">
                {p.title}
              </div>
            ))}
          </div>
        ))}
      </div>
      {hasNextPage && (
        <Button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </Button>
      )}
    </div>
  );
}
