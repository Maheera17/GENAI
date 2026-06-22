import { useRef, useState } from 'react';

function PdfUploader({ onUpload, isUploading, uploadedFilename, uploadSuccess }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || file.type !== 'application/pdf') return;
    onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
    e.target.value = '';
  };

  return (
    <section className="uploader glass-card">
      <div
        className={`uploader__dropzone ${isDragging ? 'uploader__dropzone--active' : ''} ${isUploading ? 'uploader__dropzone--uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!isUploading) inputRef.current?.click();
          }
        }}
        onClick={() => !isUploading && inputRef.current?.click()}
        aria-label="Upload PDF by clicking or dragging"
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={handleChange}
          hidden
          disabled={isUploading}
        />

        <div className="uploader__icon" aria-hidden="true">
          {isUploading ? (
            <span className="spinner spinner--lg" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          )}
        </div>

        <p className="uploader__label">
          {isUploading ? 'Uploading your PDF…' : 'Drag & drop a PDF here, or click to browse'}
        </p>

        <button
          type="button"
          className="uploader__button"
          disabled={isUploading}
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          {isUploading ? (
            <>
              <span className="spinner" />
              Uploading…
            </>
          ) : (
            'Upload PDF'
          )}
        </button>
      </div>

      {uploadedFilename && (
        <div className="uploader__file-info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <span className="uploader__filename">{uploadedFilename}</span>
        </div>
      )}

      {uploadSuccess && (
        <p className="uploader__success" role="status">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          PDF uploaded successfully
        </p>
      )}
    </section>
  );
}

export default PdfUploader;
