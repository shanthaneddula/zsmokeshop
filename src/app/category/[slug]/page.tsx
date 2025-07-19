import { categories } from '@/data';
import CategoryPageClient from '@/components/CategoryPageClient';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = categories.find(cat => cat.slug === slug);

  return <CategoryPageClient category={category} />;
}
