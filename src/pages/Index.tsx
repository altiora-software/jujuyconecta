import { Layout } from "@/components/layout/Layout";
import { Hero } from "@/components/home/Hero";
import { ModuleGrid } from "@/components/home/ModuleGrid";
import { CosquinPromoBannerPlataforma } from "@/components/cosquin/CosquinPromoBannerPlataforma";

const Index = () => {
  
  return (
    <Layout>    
      <Hero />
      <ModuleGrid />
      <CosquinPromoBannerPlataforma />
    </Layout>
  );
};

export default Index;
