"use client";

import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  service: string;
  version: string;
};

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/health`,
        );

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data: HealthResponse = await response.json();
        setHealth(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to connect");
      }
    };

    checkHealth();
  }, []);

  const backendConnected = health?.status === "ok";

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 dark:bg-black">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
          Unified-CS
        </h1>

        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          ERP Platform
        </p>

        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <span className="text-zinc-700 dark:text-zinc-300">
              Backend
            </span>

            <span
              className={
                backendConnected
                  ? "font-medium text-green-600"
                  : "font-medium text-red-600"
              }
            >
              {backendConnected ? "● Connected" : "● Disconnected"}
            </span>
          </div>

          {health && (
            <div className="rounded-lg bg-zinc-50 p-4 text-sm dark:bg-zinc-900">
              <p>
                <strong>Service:</strong> {health.service}
              </p>
              <p>
                <strong>Version:</strong> {health.version}
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}