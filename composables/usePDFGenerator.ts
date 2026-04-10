import { useRuntimeConfig } from '#imports'

export const usePDFGenerator = () => {
  const generatePDF = async (quoteData: any): Promise<Blob> => {
    // Dynamically import pdfmake to avoid SSR issues
    const pdfMake = await import('pdfmake/build/pdfmake')
    const pdfFonts = await import('pdfmake/build/vfs_fonts')
    
    // Set up fonts
    pdfMake.default.vfs = pdfFonts.default.pdfMake.vfs
    
    // Create document definition for pdfmake
    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      header: (currentPage: number, pageCount: number) => {
        return {
          text: `Protospec Quotation - Page ${currentPage} of ${pageCount}`,
          style: 'header',
          margin: [40, 20, 40, 10]
        }
      },
      content: [
        // Title
        {
          text: 'PROFESSIONAL QUOTATION',
          style: 'title',
          margin: [0, 0, 0, 20]
        },
        
        // Client Information
        {
          text: 'CLIENT INFORMATION',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          layout: 'noBorders',
          table: {
            widths: ['auto', '*'],
            body: [
              [{ text: 'Client Name:', style: 'label' }, { text: quoteData.clientName || 'Not specified', style: 'value' }],
              [{ text: 'Quote Date:', style: 'label' }, { text: quoteData.quoteDate || new Date().toISOString().split('T')[0], style: 'value' }]
            ]
          },
          margin: [0, 0, 0, 20]
        },
        
        // Project Requirements
        {
          text: 'PROJECT REQUIREMENTS',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          text: quoteData.requirements || 'No requirements specified',
          style: 'requirements',
          margin: [0, 0, 0, 20]
        },
        
        // Professional Quote (if available)
        ...(quoteData.markdownQuote ? [
          {
            text: 'PROFESSIONAL QUOTATION DETAILS',
            style: 'sectionHeader',
            margin: [0, 0, 0, 10]
          },
          {
            text: quoteData.markdownQuote,
            style: 'markdownContent',
            margin: [0, 0, 0, 20]
          }
        ] : []),
        
        // Cost Breakdown
        {
          text: 'COST BREAKDOWN',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Role', style: 'tableHeader' },
                { text: 'Daily Rate (RM)', style: 'tableHeader', alignment: 'right' },
                { text: 'Days', style: 'tableHeader', alignment: 'right' },
                { text: 'Total (RM)', style: 'tableHeader', alignment: 'right' }
              ],
              [
                'Technical Lead / Architect',
                { text: quoteData.costBreakdown?.technicalLead?.rate?.toLocaleString() || '0', alignment: 'right' },
                { text: quoteData.costBreakdown?.technicalLead?.days?.toString() || '0', alignment: 'right' },
                { text: quoteData.costBreakdown?.technicalLead?.cost?.toLocaleString() || '0', alignment: 'right', bold: true }
              ],
              [
                'Senior Developer',
                { text: quoteData.costBreakdown?.seniorDev?.rate?.toLocaleString() || '0', alignment: 'right' },
                { text: quoteData.costBreakdown?.seniorDev?.days?.toString() || '0', alignment: 'right' },
                { text: quoteData.costBreakdown?.seniorDev?.cost?.toLocaleString() || '0', alignment: 'right', bold: true }
              ],
              [
                'UI/UX Designer',
                { text: quoteData.costBreakdown?.uiux?.rate?.toLocaleString() || '0', alignment: 'right' },
                { text: quoteData.costBreakdown?.uiux?.days?.toString() || '0', alignment: 'right' },
                { text: quoteData.costBreakdown?.uiux?.cost?.toLocaleString() || '0', alignment: 'right', bold: true }
              ],
              [
                'QA/Testing',
                { text: quoteData.costBreakdown?.qa?.rate?.toLocaleString() || '0', alignment: 'right' },
                { text: quoteData.costBreakdown?.qa?.days?.toString() || '0', alignment: 'right' },
                { text: quoteData.costBreakdown?.qa?.cost?.toLocaleString() || '0', alignment: 'right', bold: true }
              ],
              [
                { text: 'TOTAL', bold: true, fillColor: '#f3f4f6' },
                { text: '', fillColor: '#f3f4f6' },
                { text: '', fillColor: '#f3f4f6' },
                { 
                  text: quoteData.totalCost?.toLocaleString() || '0', 
                  bold: true, 
                  alignment: 'right', 
                  fillColor: '#f3f4f6',
                  fontSize: 14
                }
              ]
            ]
          },
          layout: {
            fillColor: (rowIndex: number, node: any, columnIndex: number) => {
              return rowIndex === 0 ? '#f9f5ff' : null
            },
            hLineWidth: (i: number, node: any) => {
              return (i === 0 || i === node.table.body.length) ? 1 : 0.5
            },
            vLineWidth: (i: number, node: any) => {
              return 0.5
            }
          },
          margin: [0, 0, 0, 20]
        },
        
        // Footer note
        {
          text: 'This quotation is valid for 30 days from the date of issue.',
          style: 'footerNote',
          margin: [0, 20, 0, 0]
        }
      ],
      styles: {
        title: {
          fontSize: 24,
          bold: true,
          color: '#7c3aed',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        sectionHeader: {
          fontSize: 16,
          bold: true,
          color: '#7c3aed',
          margin: [0, 10, 0, 5]
        },
        label: {
          fontSize: 12,
          bold: true,
          color: '#374151'
        },
        value: {
          fontSize: 12,
          color: '#1f2937'
        },
        requirements: {
          fontSize: 11,
          color: '#374151',
          lineHeight: 1.4
        },
        markdownContent: {
          fontSize: 11,
          color: '#374151',
          lineHeight: 1.4
        },
        tableHeader: {
          fontSize: 11,
          bold: true,
          color: '#7c3aed',
          fillColor: '#f9f5ff'
        },
        footerNote: {
          fontSize: 10,
          italic: true,
          color: '#6b7280',
          alignment: 'center'
        },
        header: {
          fontSize: 10,
          color: '#6b7280',
          alignment: 'right'
        }
      },
      defaultStyle: {
        font: 'Roboto'
      }
    }
    
    // Generate the PDF blob
    return new Promise((resolve, reject) => {
      try {
        const pdfDocGenerator = pdfMake.default.createPdf(docDefinition)
        pdfDocGenerator.getBlob(resolve)
      } catch (error) {
        console.error('Error generating PDF:', error)
        reject(error)
      }
    })
  }

  const downloadPDF = async (quoteData: any, filename?: string): Promise<void> => {
    try {
      const pdfBlob = await generatePDF(quoteData)
      
      // Create temporary link and trigger download
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename || `Protospec_Quote_${quoteData.clientName || 'Anonymous'}_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
    }
  }

  return {
    generatePDF,
    downloadPDF
  }
}