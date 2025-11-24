import { Layout } from "@/components/layout/Layout";

export function TransportLoadingSkeleton() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-6">
          <div className="h-32 rounded-3xl bg-gradient-to-br from-sky-500/10 via-emerald-500/5 to-background animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-3xl bg-muted/70 border border-border/60 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
