import React from 'react'

interface PDFViewerProps {
    pdfUrl: string;
}

const PDFViewer = ({ pdfUrl }: PDFViewerProps) => {
    const googleDriveViewerUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(pdfUrl)}`;
    return (
        <div className="h-screen w-full p-0 m-0">
            <iframe src={googleDriveViewerUrl} title="PDF preview" className='border-none h-full w-full outline-none p-0' />
        </div>
    )
}

export default PDFViewer