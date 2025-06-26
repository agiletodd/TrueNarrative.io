import React, { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";

export default function AdminDashboard() {
  const api = useApi();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get("/api/admin/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [api]);

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (!stats)
    return <div className="p-6 text-red-500">Failed to load stats.</div>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(stats.totals).map(([key, value]) => (
          <div key={key} className="bg-white p-4 shadow rounded">
            <h2 className="text-sm uppercase text-gray-500">{key}</h2>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Status + Votes */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-lg font-semibold mb-2">Idea Status Counts</h2>
          <ul>
            {stats.ideaStatusCounts.map((s) => (
              <li key={s.status} className="flex justify-between">
                <span>{s.status}</span>
                <span>{s._count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-lg font-semibold mb-2">Vote Stats</h2>
          <ul>
            {stats.voteStats.map((v) => (
              <li key={v.type} className="flex justify-between">
                <span>{v.type}</span>
                <span>{v._count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tables */}
      <DataTable
        title="Recent Users"
        columns={["email", "role", "createdAt", "lastLogin"]}
        rows={stats.recentUsers}
      />
      <DataTable
        title="Recent Ideas"
        columns={[
          "title",
          "description",
          "status",
          "createdAt",
          "product.name",
          "user.email",
        ]}
        rows={stats.recentIdeas}
      />
      <DataTable
        title="Top Users"
        columns={[
          "email",
          "_count.ideas",
          "_count.ideaVotes",
          "_count.comments",
        ]}
        rows={stats.topUsers}
      />
      <DataTable
        title="Top Products"
        columns={["name", "_count.ideas", "owner.email"]}
        rows={stats.topProducts}
      />
      <DataTable
        title="Top Ideas"
        columns={[
          "title",
          "status",
          "_count.votes",
          "_count.comments",
          "product.name",
          "user.email",
        ]}
        rows={stats.topIdeas}
      />
    </div>
  );
}

function DataTable({ title, columns, rows }) {
  return (
    <div className="bg-white p-4 shadow rounded overflow-x-auto">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600 border-b">
            {columns.map((col) => (
              <th key={col} className="p-2 whitespace-nowrap capitalize">
                {col.replaceAll(".", " > ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-b">
              {columns.map((col) => (
                <td key={col} className="p-2 whitespace-nowrap">
                  {getNestedValue(row, col) ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getNestedValue(obj, path) {
  return path.split(".").reduce((o, key) => o?.[key], obj);
}
