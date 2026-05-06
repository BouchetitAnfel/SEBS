const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Make sure the tickets folder exists
const ticketsDir = path.join(__dirname, '..', '..', 'uploads', 'tickets');
if (!fs.existsSync(ticketsDir)) {
    fs.mkdirSync(ticketsDir, { recursive: true });
}

/**
 * Generate a PDF ticket for a booking.
 * Returns the absolute file path of the saved PDF.
 */
const generateTicket = (booking, event, user) => {
    return new Promise((resolve, reject) => {
        try {
            const filename = `ticket-${booking.bookingReference}.pdf`;
            const filepath = path.join(ticketsDir, filename);

            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const stream = fs.createWriteStream(filepath);
            doc.pipe(stream);

            // ===== HEADER =====
            doc
                .fillColor('#4F46E5')
                .fontSize(28)
                .font('Helvetica-Bold')
                .text('SEBS', { align: 'center' });

            doc
                .fillColor('#666')
                .fontSize(10)
                .font('Helvetica')
                .text('Smart Event Booking System', { align: 'center' });

            doc.moveDown(2);

            // Horizontal line
            doc
                .strokeColor('#4F46E5')
                .lineWidth(2)
                .moveTo(50, doc.y)
                .lineTo(545, doc.y)
                .stroke();

            doc.moveDown(1);

            // ===== TITLE =====
            doc
                .fillColor('#000')
                .fontSize(22)
                .font('Helvetica-Bold')
                .text('🎫 Event Ticket', { align: 'center' });

            doc.moveDown(2);

            // ===== EVENT DETAILS =====
            doc
                .fillColor('#4F46E5')
                .fontSize(14)
                .font('Helvetica-Bold')
                .text('EVENT DETAILS');

            doc.moveDown(0.5);

            const eventDetails = [
                ['Event:', event.title],
                ['Category:', event.category.charAt(0).toUpperCase() + event.category.slice(1)],
                ['Date:', new Date(event.date).toLocaleString()],
                ['Location:', event.location],
            ];

            eventDetails.forEach(([label, value]) => {
                doc
                    .fillColor('#666')
                    .fontSize(11)
                    .font('Helvetica-Bold')
                    .text(label, { continued: true, width: 100 })
                    .fillColor('#000')
                    .font('Helvetica')
                    .text(' ' + value);
                doc.moveDown(0.3);
            });

            doc.moveDown(1);

            // ===== ATTENDEE DETAILS =====
            doc
                .fillColor('#4F46E5')
                .fontSize(14)
                .font('Helvetica-Bold')
                .text('ATTENDEE');

            doc.moveDown(0.5);

            const attendeeDetails = [
                ['Name:', user.name],
                ['Email:', user.email],
            ];

            attendeeDetails.forEach(([label, value]) => {
                doc
                    .fillColor('#666')
                    .fontSize(11)
                    .font('Helvetica-Bold')
                    .text(label, { continued: true, width: 100 })
                    .fillColor('#000')
                    .font('Helvetica')
                    .text(' ' + value);
                doc.moveDown(0.3);
            });

            doc.moveDown(1);

            // ===== BOOKING DETAILS =====
            doc
                .fillColor('#4F46E5')
                .fontSize(14)
                .font('Helvetica-Bold')
                .text('BOOKING');

            doc.moveDown(0.5);

            const bookingDetails = [
                ['Reference:', booking.bookingReference],
                ['Tickets:', booking.quantity.toString()],
                ['Total Paid:', `$${booking.totalPrice}`],
                ['Status:', booking.status.toUpperCase()],
                ['Booked on:', new Date(booking.createdAt).toLocaleString()],
            ];

            bookingDetails.forEach(([label, value]) => {
                doc
                    .fillColor('#666')
                    .fontSize(11)
                    .font('Helvetica-Bold')
                    .text(label, { continued: true, width: 100 })
                    .fillColor('#000')
                    .font('Helvetica')
                    .text(' ' + value);
                doc.moveDown(0.3);
            });

            doc.moveDown(2);

            // ===== REFERENCE BOX (the "ticket stub") =====
            const boxY = doc.y;
            doc
                .roundedRect(50, boxY, 495, 80, 10)
                .fillAndStroke('#4F46E5', '#4F46E5');

            doc
                .fillColor('#fff')
                .fontSize(10)
                .font('Helvetica')
                .text('PRESENT THIS REFERENCE AT THE ENTRANCE', 50, boxY + 15, {
                    align: 'center',
                    width: 495,
                });

            doc
                .fillColor('#fff')
                .fontSize(28)
                .font('Helvetica-Bold')
                .text(booking.bookingReference, 50, boxY + 35, {
                    align: 'center',
                    width: 495,
                });

            // ===== FOOTER =====
            doc
                .fillColor('#888')
                .fontSize(9)
                .font('Helvetica')
                .text(
                    'Thank you for using SEBS. This ticket is non-transferable.',
                    50,
                    750,
                    { align: 'center', width: 495 }
                );

            doc.end();

            // Wait until the file is fully written before resolving
            stream.on('finish', () => resolve(filepath));
            stream.on('error', reject);
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = generateTicket;