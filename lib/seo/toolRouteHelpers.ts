import { DEVELOPER_CATEGORY_SLUGS } from "@/lib/content/developerToolsData";
import { IMAGE_CATEGORY_SLUGS } from "@/lib/content/imageToolsData";
import { PDF_CATEGORY_SLUGS } from "@/lib/content/pdfToolsData";
import { toolCatalog } from "@/lib/content/toolCatalog";

const devSlugs = DEVELOPER_CATEGORY_SLUGS as readonly string[];
const imageSlugs = IMAGE_CATEGORY_SLUGS as readonly string[];
const pdfSlugs = PDF_CATEGORY_SLUGS as readonly string[];

/** schema.org applicationCategory hint for JSON-LD WebApplication */
export function schemaApplicationCategoryForSlug(slug: string): string {
  if (devSlugs.includes(slug)) return "DeveloperApplication";
  if (imageSlugs.includes(slug)) return "MultimediaApplication";
  if (pdfSlugs.includes(slug)) return "BusinessApplication";
  if (toolCatalog.some((t) => t.slug === slug)) return "ProductivityApplication";
  return "UtilitiesApplication";
}
