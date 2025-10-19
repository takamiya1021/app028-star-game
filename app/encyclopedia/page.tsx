import type { Metadata } from 'next';
import EncyclopediaClient from './EncyclopediaClient';

export const metadata: Metadata = {
  title: '星空図鑑 | Stellarium Quiz',
  description: '星座や恒星の詳細を一覧形式で学べる図鑑ページです。',
};

export default function EncyclopediaPage() {
  return <EncyclopediaClient />;
}
