import { BottomNav } from '@/components/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md">
      <div className="px-4 pb-28 pt-4">{children}</div>
      <BottomNav />
    </div>
  );
}
