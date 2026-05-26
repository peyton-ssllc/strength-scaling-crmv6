export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-7 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="badge mb-3">{eyebrow}</div>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
      </div>
    </div>
  );
}
