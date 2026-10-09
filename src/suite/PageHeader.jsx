export default function PageHeader({ title, description }) {
  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4">
      <h1 className="text-lg font-semibold text-haus-blue">{title}</h1>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </header>
  )
}
