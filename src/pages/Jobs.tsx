// src/app/empleos/page.tsx
"use client";

import { useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useJobsListings } from "@/hooks/useJobsListings";
import { JobsHeader } from "@/components/jobs/JobsHeader";
import { JobsFilters } from "@/components/jobs/JobsFilters";
import { JobCard } from "@/components/jobs/JobCard";
import { JobDetailDialog } from "@/components/jobs/JobDetailDialog";
import { JobListing } from "@/components/types/jobs";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Briefcase } from "lucide-react";

const TABS = [
  { id: "todas", label: "Todas", icon: Briefcase },
  { id: "destacadas", label: "Destacadas", icon: Briefcase },
];

export default function JobsPage() {
  const { jobs, loading } = useJobsListings({ onlyPublished: true });

  const [selectedTab, setSelectedTab] = useState<string>("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("todos");
  const [selectedJobType, setSelectedJobType] = useState<string>("todos");
  const [selectedModality, setSelectedModality] = useState<string>("todas");

  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((job) => {
      if (job.category) set.add(job.category);
    });
    return Array.from(set).sort();
  }, [jobs]);

  const municipalities = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((job) => {
      if (job.municipality) set.add(job.municipality);
    });
    return Array.from(set).sort();
  }, [jobs]);

  const totalJobs = jobs.length;
  const totalMunicipalities = municipalities.length;
  const totalCategories = categories.length;

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (selectedTab === "destacadas" && !job.is_featured) return false;

      if (selectedCategory !== "todas" && job.category !== selectedCategory) return false;

      if (selectedMunicipality !== "todos" && job.municipality !== selectedMunicipality) {
        return false;
      }

      if (selectedJobType !== "todos" && job.job_type !== selectedJobType) return false;

      if (selectedModality !== "todas" && job.modality !== selectedModality) return false;

      if (searchTerm.trim().length > 0) {
        const term = searchTerm.toLowerCase();
        const haystack = [
          job.title,
          job.company_name,
          job.category,
          job.description,
          job.municipality,
          job.city,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(term)) return false;
      }

      return true;
    });
  }, [
    jobs,
    selectedTab,
    selectedCategory,
    selectedMunicipality,
    selectedJobType,
    selectedModality,
    searchTerm,
  ]);

  const handleClearFilters = () => {
    setSelectedCategory("todas");
    setSelectedMunicipality("todos");
    setSelectedJobType("todos");
    setSelectedModality("todas");
    setSearchTerm("");
    setSelectedTab("todas");
  };

  const handleOpenDetails = (job: JobListing) => {
    setSelectedJob(job);
    setDialogOpen(true);
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
        <JobsHeader
          totalJobs={totalJobs}
          totalMunicipalities={totalMunicipalities}
          totalCategories={totalCategories}
        />

        <JobsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedMunicipality={selectedMunicipality}
          onMunicipalityChange={setSelectedMunicipality}
          selectedJobType={selectedJobType}
          onJobTypeChange={setSelectedJobType}
          selectedModality={selectedModality}
          onModalityChange={setSelectedModality}
          categories={categories}
          municipalities={municipalities}
          onClearFilters={handleClearFilters}
          resultsCount={filteredJobs.length}
        />

        <section className="space-y-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
            <TabsList className="w-full grid grid-cols-2 md:inline-flex md:w-auto md:gap-2">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center justify-center gap-2 text-xs md:text-sm data-[state=active]:shadow-soft data-[state=active]:bg-card"
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedTab}>
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card
                      key={i}
                      className="rounded-xl bg-muted/40 border-border/60 animate-pulse"
                    >
                      <CardContent className="space-y-2 p-4">
                        <div className="h-4 w-32 bg-muted rounded mb-2" />
                        <div className="h-3 w-24 bg-muted rounded" />
                        <div className="h-3 w-full bg-muted rounded mt-2" />
                        <div className="h-3 w-2/3 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredJobs.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-10 text-center space-y-3">
                    <Briefcase className="h-8 w-8 text-muted-foreground mx-auto" />
                    <div className="space-y-1">
                      <p className="font-medium">No encontramos empleos con estos filtros.</p>
                      <p className="text-sm text-muted-foreground">
                        Probá con otra palabra, cambiá de rubro o quitá alguno de los filtros.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} onOpenDetails={handleOpenDetails} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>

        <section>
          <Card className="border-dashed bg-muted/40">
            <CardContent className="py-3 px-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  La bolsa de trabajo de Jujuy Conecta va a crecer todos los días.
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Vamos a sumar avisos verificados, filtros por experiencia, sistema de reseñas
                  y estadísticas para empleadores. La idea es simple: que buscar laburo en Jujuy no
                  sea estar perdido, sino tener un lugar claro donde empezar.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <JobDetailDialog open={dialogOpen} onOpenChange={setDialogOpen} job={selectedJob} />
      </div>
    </Layout>
  );
}
