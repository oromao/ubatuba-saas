export default function CidadaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <a href="/privacidade" className="underline hover:text-slate-600">
          Política de Privacidade
        </a>
        <span className="mx-2">·</span>
        <span>FlyDea GovTech</span>
      </footer>
    </div>
  );
}
