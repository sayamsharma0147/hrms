export default function ResumeViewer({ resumeUrl, fileName = 'Resume' }) {
  if (!resumeUrl) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500">
        <svg
          className="w-10 h-10 mb-2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-sm">No resume uploaded</p>
      </div>
    )
  }

  const isPdf =
    resumeUrl.toLowerCase().includes('.pdf') ||
    resumeUrl.toLowerCase().includes('/pdf') ||
    resumeUrl.toLowerCase().endsWith('pdf')

  if (isPdf) {
    return (
      <iframe
        src={resumeUrl}
        title={fileName}
        className="w-full rounded-lg border border-gray-200"
        style={{ height: '600px' }}
      />
    )
  }

  return (
    <a
      href={resumeUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-3 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
    >
      <svg
        className="w-8 h-8 text-indigo-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <span className="font-medium text-indigo-700">{fileName}</span>
    </a>
  )
}
