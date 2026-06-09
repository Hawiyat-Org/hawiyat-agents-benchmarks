import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Benchhy</h1>
      <p className="mt-2 text-gray-600">
        A benchmark for AI agents. Find and fix the bugs.
      </p>
    </div>
  );
}
