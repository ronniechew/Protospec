export const usePDFGenerator = () => {
  const downloadPDF = async (quoteData: any, filename?: string): Promise<void> => {
    try {
      console.log('Starting server-side PDF generation...')
      
      // Call the server endpoint to generate PDF
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quoteData,
          filename: filename || `Protospec_Quote_${quoteData.clientName || 'Anonymous'}_${new Date().toISOString().split('T')[0]}.pdf`
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error: ${errorText}`)
      }
      
      // Get the PDF blob from response
      const pdfBlob = await response.blob()
      
      // Create temporary link and trigger download
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename || `Protospec_Quote_${quoteData.clientName || 'Anonymous'}_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log('PDF download completed successfully')
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert(`Failed to download PDF: ${error.message || 'Unknown error'}`)
    }
  }

  return {
    downloadPDF
  }
}