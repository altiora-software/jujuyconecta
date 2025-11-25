// src/components/jobs/JobsFilters.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";

interface JobsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;

  selectedCategory: string;
  onCategoryChange: (value: string) => void;

  selectedMunicipality: string;
  onMunicipalityChange: (value: string) => void;

  selectedJobType: string;
  onJobTypeChange: (value: string) => void;

  selectedModality: string;
  onModalityChange: (value: string) => void;

  categories: string[];
  municipalities: string[];

  onClearFilters: () => void;

  resultsCount: number;
}

export function JobsFilters(props: JobsFiltersProps) {
  const {
    searchTerm,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    selectedMunicipality,
    onMunicipalityChange,
    selectedJobType,
    onJobTypeChange,
    selectedModality,
    onModalityChange,
    categories,
    municipalities,
    onClearFilters,
    resultsCount,
  } = props;

  return (
    <Card className="border-border/70 bg-card/90">
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Filter className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Buscar y filtrar empleos</span>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por puesto, empresa, palabra clave..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onClearFilters}
              title="Limpiar filtros"
              className="transition-smooth"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-xs md:text-sm"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="todas">Todos los rubros</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-xs md:text-sm"
              value={selectedMunicipality}
              onChange={(e) => onMunicipalityChange(e.target.value)}
            >
              <option value="todos">Toda la provincia</option>
              {municipalities.map((mun) => (
                <option key={mun} value={mun}>
                  {mun}
                </option>
              ))}
            </select>

            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-xs md:text-sm"
              value={selectedJobType}
              onChange={(e) => onJobTypeChange(e.target.value)}
            >
              <option value="todos">Todos los tipos</option>
              <option value="full_time">Tiempo completo</option>
              <option value="part_time">Medio tiempo</option>
              <option value="freelance">Freelance</option>
              <option value="internship">Pasantía</option>
              <option value="temporary">Temporal</option>
            </select>

            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-xs md:text-sm"
              value={selectedModality}
              onChange={(e) => onModalityChange(e.target.value)}
            >
              <option value="todas">Presencial y remoto</option>
              <option value="onsite">Presencial</option>
              <option value="remote">Remoto</option>
              <option value="hybrid">Híbrido</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Mostrando {resultsCount} empleo(s) según tus filtros.
        </p>
      </CardContent>
    </Card>
  );
}
