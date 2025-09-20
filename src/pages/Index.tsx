import { Layout } from "@/components/layout/Layout";
import { Hero } from "@/components/home/Hero";
import { ModuleGrid } from "@/components/home/ModuleGrid";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <ModuleGrid />
    </Layout>
  );
};

export default Index;
