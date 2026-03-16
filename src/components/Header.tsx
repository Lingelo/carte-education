export function Header() {
  return (
    <div className="flex items-center gap-2">
      <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </svg>
      <h1 className="text-sm font-bold text-gray-800 md:text-base">Carte de l'Education</h1>
    </div>
  );
}
