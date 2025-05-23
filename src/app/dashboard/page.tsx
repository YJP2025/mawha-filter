import MangaTable from "@/components/MangaTable";

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Your Manga List</h1>
      <MangaTable />
    </div>
  );
}
