export interface ContentCategory {
name: string;
slug: string;
heroImage?: string;
}

export interface ContentSection {
name: string;
slug: string;
heroImage?: string;
categories: ContentCategory[];
}


export const DEFAULT_CONTENT_METADATA: ContentSection[] = [
  {
    name: "Articles",
    slug: "articles",
    categories: [
      
    ],
  },
  {
    name: "Bible Study",
    slug: "bible-study",
    categories: [
      { name: "The Story of Redemption", slug: "redemption" },
      { name: "The Law of God", slug: "the-law" },
      { name: "The Sabbath", slug: "the-sabbath" },
      { name: "Christian Living and Standards", slug: "standards" },
    ],
  },
  {
    name: "Health Corner",
    slug: "health",
    categories: [
      { name: "Bible and Spirit of Prophecy On Diet and Lifestyle", slug: "bible-sop" },
      {
        name: "Truth About Proteins, Fats, and Carbohydrates",
        slug: "truth",
      },
      { name: "Lifestyle Diseases", slug: "lifestyle-diseases" },
      { name: "Harmful Food Articles", slug: "junk-foods" }
    ],
  },
  {
    name: "Family Life Corner",
    slug: "family",
    categories: [
      {
        name: "Purpose of Marriage and Family",
        slug: "marriage-purpose",
      },
      { name: "Dating Vs Courting", slug: "dating-courting" },
      { name: "Sex and Sexual Immorality", slug: "immorality" },
      { name: "Common Questions on Relationships", slug: "relationships" },
    ],
  },
];

export function isDefaultContentCategory(
  sectionSlug: string,
  categorySlug: string
): boolean {
  const section = DEFAULT_CONTENT_METADATA.find(
    (item) => item.slug === sectionSlug
  );

  return (
    section?.categories.some(
      (category) =>
        category.slug.toLowerCase() === categorySlug.toLowerCase()
    ) ?? false
  );
}