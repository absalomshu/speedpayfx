import EnterAmountsClient from './EnterAmountsClient';

export const runtime = 'edge';

export default async function EnterAmountsPage({ params }: { params: Promise<{ direction: 'want-usd' | 'want-xaf' }> }) {
  const resolved = await params;
  return <EnterAmountsClient direction={resolved.direction} />;
}
