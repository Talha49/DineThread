import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import ThemeResearch from './theme-research';

export const dynamic = 'force-dynamic';
export default async function Page() {
  const host = (await headers()).get('host') || '';
  if (process.env.ORDER_RESEARCH_ENABLED !== '1' || process.env.NEXT_PUBLIC_THEME_RESEARCH !== '1'
      || !/^(127\.0\.0\.1|localhost):\d+$/.test(host)) notFound();
  return <ThemeResearch />;
}
