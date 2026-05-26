import type { ReactNode } from "react";

// ============================================================
// Domain models — mirror the Supabase database schema
// ============================================================

export interface Novel {
  id: string;
  title: string;
  author: string;
  description: string;
  cover_url: string;
  created_at: string;
  updated_at: string;
}

export interface Scene {
  id: string;
  novel_id: string;
  scene_order: number;
  content: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Component prop interfaces
// ============================================================

export interface NovelCardProps {
  novel: Novel;
}

export interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  /** Visual style variant */
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  className?: string;
  /** HTML button type attribute */
  type?: "button" | "submit" | "reset";
  /** Accessible label when button text alone is insufficient */
  "aria-label"?: string;
}

export interface StoryReaderClientProps {
  scenes: Scene[];
  novel: Novel;
}

// ============================================================
// Page param interfaces (Next.js App Router)
// ============================================================

export interface NovelDetailPageProps {
  params: {
    id: string;
  };
}

export interface StoryReaderPageProps {
  params: {
    novelId: string;
  };
}
