import SettingsPanel from '@/components/Settings/SettingsPanel';
import PageHeader from '@/components/Layout/PageHeader';

export const metadata = {
  title: '設定 | Stellarium Quiz',
  description: '観測モード・クイズ設定をカスタマイズします。',
};

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-16 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <PageHeader
          eyebrow="Settings"
          title="設定"
          description="観測体験を好みに合わせて調整し、クイズの難易度や出題数をコントロールしましょう。"
        />

        <section className="mx-auto w-full max-w-3xl">
          <SettingsPanel />
        </section>
      </div>
    </main>
  );
}
