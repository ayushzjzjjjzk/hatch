export interface CategoryData {
  id: string;
  name: string;
  slug: string;
}

export interface FounderData {
  id: string;
  name: string;
  role: string;
  photoUrl: string | null;
  linkedinUrl: string | null;
  xUrl: string | null;
  websiteUrl: string | null;
  bio: string | null;
  displayOrder: number;
}

export interface StartupImageData {
  id: string;
  url: string;
  alt: string | null;
  displayOrder: number;
}

export interface StartupCardData {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  websiteUrl: string;
  linkedinUrl: string | null;
  xUrl: string | null;
  githubUrl: string | null;
  youtubeUrl: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  ycBatch: string;
  location: string | null;
  foundedYear: number | null;
  employeeRange: string | null;
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
  founders: FounderData[];
  images: StartupImageData[];
  categories: { category: CategoryData }[];
  _count: { likes: number; saves: number; views: number; clicks: number };
}
