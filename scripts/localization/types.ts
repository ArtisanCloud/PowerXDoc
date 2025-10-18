export type ReviewStatus = 'Placeholder' | 'InReview' | 'Approved';

export interface LocaleDefinition {
  code: string;
  label: string;
  isDefault?: boolean;
}

export interface LocaleManifestEntry {
  slug: string;
  title?: string;
  reviewStatus?: ReviewStatus;
  partnerSlug?: string;
}

export interface LocaleManifest {
  sourceLocale: string;
  targetLocales: string[];
  pages: Record<string, LocaleManifestEntry>;
}
