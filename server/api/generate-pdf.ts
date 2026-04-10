import { createWriteStream } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'
import { pipeline } from 'node:stream/promises'

// Since we're in a server environment, we can use a more robust PDF library
// Let's use pdfkit which works well in Node.js environments
import PDFDocument from 'pdfkit'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    if (!body?.quoteData) {
      throw new Error('Missing quoteData in request body')
    }
    
    const { quoteData } = body
    
    // Create a temporary file path
    const filename = `${randomBytes(16).toString('hex')}.pdf`
    const filepath = join(tmpdir(), filename)
    
    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 40, right: 40 }
    })
    
    const writeStream = createWriteStream(filepath)
    pipeline(doc, writeStream)
    
    // Add header function
    const addHeader = (page: number, pageCount: number) => {
      doc.fontSize(10)
        .fillColor('#6b7280')
        .text(`Protospec Quotation - Page ${page} of ${pageCount}`, 40, 20, { 
          align: 'right',
          width: doc.page.width - 80
        })
    }
    
    // Title
    doc.fontSize(24)
      .fillColor('#7c3aed')
      .text('PROFESSIONAL QUOTATION', { align: 'center' })
      .moveDown(2)
    
    // Client Information
    doc.fontSize(16)
      .fillColor('#7c3aed')
      .text('CLIENT INFORMATION')
      .fontSize(12)
      .fillColor('black')
      .moveDown(0.5)
    
    doc.text(`Client Name: ${quoteData.clientName || 'Not specified'}`)
    doc.text(`Quote Date: ${quoteData.quoteDate || new Date().toISOString().split('T')[0]}`)
    doc.moveDown(2)
    
    // Project Requirements
    doc.fontSize(16)
      .fillColor('#7c3aed')
      .text('PROJECT REQUIREMENTS')
      .fontSize(12)
      .fillColor('black')
      .moveDown(0.5)
    
    doc.text(quoteData.requirements || 'No requirements specified')
    doc.moveDown(2)
    
    // Professional Quote (if available)
    if (quoteData.markdownQuote) {
      doc.fontSize(16)
        .fillColor('#7c3aed')
        .text('PROFESSIONAL QUOTATION DETAILS')
        .fontSize(12)
        .fillColor('black')
        .moveDown(0.5)
      
      // Simple markdown to text conversion (basic)
      let cleanQuote = quoteData.markdownQuote
        .replace(/#/g, '') // Remove headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/```.*?```/gs, '') // Remove code blocks
      
      doc.text(cleanQuote)
      doc.moveDown(2)
    }
    
    // Cost Breakdown
    doc.fontSize(16)
      .fillColor('#7c3aed')
      .text('COST BREAKDOWN')
      .fontSize(12)
      .fillColor('black')
      .moveDown(0.5)
    
    // Create table manually since PDFKit doesn't have built-in tables
    const tableTop = doc.y
    const columnWidths = [150, 100, 60, 100] // Widths for each column
    const rowHeight = 20
    const tableWidth = columnWidths.reduce((sum, w) => sum + w, 0)
    const startX = (doc.page.width - tableWidth) / 2
    
    // Header row
    doc.fillColor('#f9f5ff')
    doc.rect(startX, tableTop, tableWidth, rowHeight).fill()
    doc.fillColor('#7c3aed')
    doc.fontSize(11).bold()
    doc.text('Role', startX + 5, tableTop + 5)
    doc.text('Daily Rate (RM)', startX + columnWidths[0] + 5, tableTop + 5)
    doc.text('Days', startX + columnWidths[0] + columnWidths[1] + 5, tableTop + 5)
    doc.text('Total (RM)', startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5, tableTop + 5)
    doc.fontSize(12).fillColor('black').bold(false)
    
    let currentY = tableTop + rowHeight
    
    // Data rows
    const roles = [
      { name: 'Technical Lead / Architect', data: quoteData.costBreakdown?.technicalLead },
      { name: 'Senior Developer', data: quoteData.costBreakdown?.seniorDev },
      { name: 'UI/UX Designer', data: quoteData.costBreakdown?.uiux },
      { name: 'QA/Testing', data: quoteData.costBreakdown?.qa }
    ]
    
    roles.forEach(role => {
      doc.text(role.name, startX + 5, currentY + 5)
      doc.text(
        (role.data?.rate || 0).toLocaleString(), 
        startX + columnWidths[0] + 5, 
        currentY + 5,
        { align: 'right' }
      )
      doc.text(
        (role.data?.days || 0).toString(), 
        startX + columnWidths[0] + columnWidths[1] + 5, 
        currentY + 5,
        { align: 'right' }
      )
      doc.text(
        (role.data?.cost || 0).toLocaleString(), 
        startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5, 
        currentY + 5,
        { align: 'right' }
      )
      currentY += rowHeight
    })
    
    // Total row
    doc.fillColor('#f3f4f6')
    doc.rect(startX, currentY, tableWidth, rowHeight).fill()
    doc.fillColor('black')
    doc.fontSize(14).bold()
    doc.text('TOTAL', startX + 5, currentY + 5)
    doc.text(
      (quoteData.totalCost || 0).toLocaleString(), 
      startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5, 
      currentY + 5,
      { align: 'right' }
    )
    doc.fontSize(12).bold(false)
    
    currentY += rowHeight + 20
    
    // Footer note
    doc.fontSize(10)
      .fillColor('#6b7280')
      .italic()
      .text('This quotation is valid for 30 days from the date of issue.', { align: 'center' })
    
    // Add header to first page
    addHeader(1, 1)
    
    // Finalize PDF
    doc.end()
    
    // Wait for file to be written
    await new Promise(resolve => {
      writeStream.on('close', resolve)
    })
    
    // Set response headers for file download
    setResponseHeaders(event, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${body.filename || 'Protospec_Quote.pdf'}"`
    })
    
    // Return the file as response
    return sendFile(event, filepath)
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to generate PDF: ${error.message}`
    })
  }
})