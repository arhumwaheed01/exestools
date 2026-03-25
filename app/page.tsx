import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeSeoArticle } from "@/components/home/HomeSeoArticle";
import { PopularToolsList } from "@/components/home/PopularToolsList";
import { seoData, toMetadata } from "@/lib/content/seoData";
import { buildWebsiteJsonLd } from "@/lib/seo/jsonLd";

export const metadata: Metadata = toMetadata(seoData.home);

const websiteLd = buildWebsiteJsonLd();

export default function Home() {
  return (
    <>
      <JsonLd data={websiteLd} id="ld-website" />
      <HeroSection />
      <FeaturedCategories />
      <PopularToolsList />
      <HomeSeoArticle />
    </>
  );
}
