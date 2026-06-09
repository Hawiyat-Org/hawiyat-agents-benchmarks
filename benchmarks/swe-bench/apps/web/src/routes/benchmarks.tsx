import { createFileRoute } from "@tanstack/react-router";
import { useBenchmarks, useCreateBenchmark } from "../lib/hooks/use-queries.js";
import { Button } from "@benchhy/ui";

export const Route = createFileRoute("/benchmarks")({
  component: BenchmarksComponent,
});

function BenchmarksComponent() {
  const { data, isLoading } = useBenchmarks();
  const createMutation = useCreateBenchmark();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Benchmarks</h1>
      <Button
        onClick={() => createMutation.mutate({ name: "New Test", score: 100 })}
      >
        Add Benchmark
      </Button>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {data?.benchmarks.map((b) => (
            <li key={b.id} className="p-2 border rounded">
              {b.name} — {b.score}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
