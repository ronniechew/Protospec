import { useRuntimeConfig } from '#imports'

export const usePDFGenerator = () => {
  const generatePDF = async (quoteData: any): Promise<Blob> => {
    console.log('Starting PDF generation...')
    
    try {
      // Dynamically import pdfmake to avoid SSR issues
      console.log('Importing pdfmake...')
      const pdfMakeModule = await import('pdfmake/build/pdfmake')
      console.log('pdfmake imported successfully')
      
      console.log('Importing vfs_fonts...')
      const vfsFontsModule = await import('pdfmake/build/vfs_fonts')
      console.log('vfs_fonts imported successfully')
      
      // Set up fonts - handle different export structures
      const pdfMake = pdfMakeModule.default || pdfMakeModule
      console.log('pdfMake object:', pdfMake)
      
      let vfs = null
      if (vfsFontsModule.vfs) {
        vfs = vfsFontsModule.vfs
        console.log('vfs found in vfsFontsModule.vfs')
      } else if (vfsFontsModule.default?.vfs) {
        vfs = vfsFontsModule.default.vfs
        console.log('vfs found in vfsFontsModule.default.vfs')
      } else if (typeof vfsFontsModule === 'object' && Object.keys(vfsFontsModule).length > 0) {
        // Try to find vfs in the module object
        const keys = Object.keys(vfsFontsModule)
        console.log('vfsFontsModule keys:', keys)
        if (keys.length > 0) {
          vfs = vfsFontsModule[keys[0]]
          console.log('Using first key as vfs')
        }
      }
      
      if (vfs) {
        pdfMake.vfs = vfs
        console.log('vfs assigned to pdfMake')
      } else {
        console.warn('No vfs found, PDF generation may not work properly')
      }
      
      // Create document definition for pdfmake - using default fonts only
      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        header: (currentPage: number, pageCount: number) => {
          return {
            text: `Protospec Quotation - Page ${currentPage} of ${pageCount}`,
            fontSize: 10,
            color: '#6b7280',
            alignment: 'right',
            margin: [40, 20, 40, 10]
          }
        },
        content: [
          // Title
          {
            text: 'PROFESSIONAL QUOTATION',
            fontSize: 24,
            bold: true,
            color: '#7c3aed',
            alignment: 'center',
            margin: [0, 0, 0, 20]
          },
          
          // Client Information
          {
            text: 'CLIENT INFORMATION',
            fontSize: 16,
            bold: true,
            color: '#7c3aed',
            margin: [0, 0, 0, 10]
          },
          {
            layout: 'noBorders',
            table: {
              widths: ['auto', '*'],
              body: [
                [{ text: 'Client Name:', bold: true, fontSize: 12, color: '#374151' }, { text: quoteData.clientName || 'Not specified', fontSize: 12, color: '#1f2937' }],
                [{ text: 'Quote Date:', bold: true, fontSize: 12, color: '#374151' }, { text: quoteData.quoteDate || new Date().toISOString().split('T')[0], fontSize: 12, color: '#1f2937' }]
              ]
            },
            margin: [0, 0, 0, 20]
          },
          
          // Project Requirements
          {
            text: 'PROJECT REQUIREMENTS',
            fontSize: 16,
            bold: true,
            color: '#7c3aed',
            margin: [0, 0, 0, 10]
          },
          {
            text: quoteData.requirements || 'No requirements specified',
            fontSize: 11,
            color: '#374151',
            lineHeight: 1.4,
            margin: [0, 0, 0, 20]
          },
          
          // Professional Quote (if available)
          ...(quoteData.markdownQuote ? [
            {
              text: 'PROFESSIONAL QUOTATION DETAILS',
              fontSize: 16,
              bold: true,
              color: '#7c3aed',
              margin: [0, 0, 0, 10]
            },
            {
              text: quoteData.markdownQuote,
              fontSize: 11,
              color: '#374151',
              lineHeight: 1.4,
              margin: [0, 0, 0, 20]
            }
          ] : []),
          
          // Cost Breakdown
          {
            text: 'COST BREAKDOWN',
            fontSize: 16,
            bold: true,
            color: '#7c3aed',
            margin: [0, 0, 0, 10]
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Role', bold: true, fontSize: 11, color: '#7c3aed', fillColor: '#f9f5ff' },
                  { text: 'Daily Rate (RM)', bold: true, fontSize: 11, color: '#7c3aed', fillColor: '#f9f5ff', alignment: 'right' },
                  { text: 'Days', bold: true, fontSize: 11, color: '#7c3aed', fillColor: '#f9f5ff', alignment: 'right' },
                  { text: 'Total (RM)', bold: true, fontSize: 11, color: '#7c3aed', fillColor: '#f9f5ff', alignment: 'right' }
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
            fontSize: 10,
            italic: true,
            color: '#6b7280',
            alignment: 'center',
            margin: [0, 20, 0, 0]
          }
        ]
        // Removed defaultStyle to use pdfmake defaults
      }
      
      console.log('Creating PDF document...')
      // Generate the PDF blob
      return new Promise((resolve, reject) => {
        try {
          const pdfDocGenerator = pdfMake.createPdf(docDefinition)
          console.log('PDF document created, getting blob...')
          pdfDocGenerator.getBlob((blob) => {
            console.log('PDF blob generated successfully')
            resolve(blob)
          })
        } catch (error) {
          console.error('Error generating PDF:', error)
          reject(error)
        }
      })
    } catch (importError) {
      console.error('Error importing pdfmake modules:', importError)
      throw new Error(`Failed to load PDF generation libraries: ${importError.message}`)
    }
  }

  const downloadPDF = async (quoteData: any, filename?: string): Promise<void> => {
    console.log('Starting PDF download process...')
    try {
      const pdfBlob = await generatePDF(quoteData)
      console.log('PDF blob received, creating download link...')
      
      // Create temporary link and trigger download
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename || `Protospec_Quote_${quoteData.clientName || 'Anonymous'}_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      console.log('Clicking download link...')
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      console.log('PDF download completed')
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert(`Failed to download PDF: ${error.message || 'Unknown error'}`)
    }
  }

  return {
    generatePDF,
    downloadPDF
  }
}