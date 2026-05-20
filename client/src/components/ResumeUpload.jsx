import { useCallback, useRef, useState } from 'react'

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx'
const MAX_SIZE = 5 * 1024 * 1024

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ResumeUpload({
  file,
  onFileChange,
  error,
  uploading = false,
  uploadProgress = 0,
  uploadSuccess = false,
}) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [localError, setLocalError] = useState('')

  const validateFile = (selected) => {
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      return 'Only PDF, DOC, and DOCX files are allowed'
    }
    if (selected.size > MAX_SIZE) {
      return 'File must be 5MB or smaller'
    }
    return ''
  }

  const handleFile = (selected) => {
    const validationError = validateFile(selected)
    if (validationError) {
      setLocalError(validationError)
      onFileChange(null)
      return
    }
    setLocalError('')
    onFileChange(selected)
  }

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragOver(false)
      const dropped = e.dataTransfer.files?.[0]
      if (dropped) handleFile(dropped)
    },
    [onFileChange]
  )

  const displayError = localError || error

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
        } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files?.[0]
            if (selected) handleFile(selected)
          }}
        />

        {uploadSuccess ? (
          <div className="flex flex-col items-center gap-2 text-green-600">
            <span className="text-3xl">✓</span>
            <p className="font-medium">Resume uploaded</p>
          </div>
        ) : (
          <>
            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">
              Drag & drop your resume here
            </p>
            <p className="text-xs text-gray-500 mt-1">or click to browse</p>
            <p className="text-xs text-gray-400 mt-2">PDF, DOC, DOCX — max 5MB</p>
          </>
        )}
      </div>

      {file && !uploadSuccess && (
        <div className="flex items-center justify-between text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <span className="text-gray-700 truncate">{file.name}</span>
          <span className="text-gray-500 shrink-0 ml-2">{formatSize(file.size)}</span>
        </div>
      )}

      {uploading && (
        <div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Uploading… {uploadProgress}%
          </p>
        </div>
      )}

      {displayError && (
        <p className="text-sm text-red-600">{displayError}</p>
      )}
    </div>
  )
}
