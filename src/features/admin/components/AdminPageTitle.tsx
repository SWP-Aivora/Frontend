interface AdminPageTitleProps {
  title: string;
  description: string;
}

export const AdminPageTitle = ({ title, description }: AdminPageTitleProps) => (
  <div className="rounded-lg border border-slate-100 bg-white px-5 py-4 shadow-sm">
    <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900">
      {title}
    </h1>
    <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
      {description}
    </p>
  </div>
);
