// Welcome email after registration
const welcomeTemplate = (userName) => ({
    subject: 'Welcome to SEBS! 🎉',
    text: `Hi ${userName}, welcome to the Smart Event Booking System!`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
      <h1 style="color: #4F46E5;">Welcome to SEBS, ${userName}! 🎉</h1>
      <p>Thank you for joining the Smart Event Booking System.</p>
      <p>You can now browse events, book tickets, and leave reviews.</p>
      <p>Happy exploring!</p>
      <hr>
      <small style="color: #888;">SEBS Team</small>
    </div>
  `,
});

// Booking confirmation
const bookingConfirmationTemplate = (userName, booking, event) => ({
    subject: `🎫 Booking Confirmed: ${event.title}`,
    text: `Hi ${userName}, your booking for "${event.title}" is confirmed. Reference: ${booking.bookingReference}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
      <h1 style="color: #10B981;">Booking Confirmed! 🎫</h1>
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Your booking has been confirmed. Here are the details:</p>
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Event</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${event.title}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${new Date(event.date).toLocaleString()}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Location</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${event.location}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Tickets</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${booking.quantity}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Total</strong></td><td style="padding: 8px; border: 1px solid #ddd;">$${booking.totalPrice}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Reference</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><code>${booking.bookingReference}</code></td></tr>
      </table>
      <p>Show this reference at the entrance. Enjoy the event!</p>
      <hr>
      <small style="color: #888;">SEBS Team</small>
    </div>
  `,
});

// Booking cancellation
const bookingCancellationTemplate = (userName, booking, event) => ({
    subject: `Booking Cancelled: ${event.title}`,
    text: `Hi ${userName}, your booking for "${event.title}" has been cancelled. Reference: ${booking.bookingReference}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
      <h1 style="color: #EF4444;">Booking Cancelled</h1>
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Your booking for <strong>${event.title}</strong> has been cancelled.</p>
      <p>Reference: <code>${booking.bookingReference}</code></p>
      <p>If this was a mistake, you can book again anytime (subject to availability).</p>
      <hr>
      <small style="color: #888;">SEBS Team</small>
    </div>
  `,
});

// Event update notification
const eventUpdateTemplate = (userName, event, changes) => ({
    subject: `Update: ${event.title}`,
    text: `Hi ${userName}, the event "${event.title}" you booked has been updated.`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
      <h1 style="color: #F59E0B;">Event Updated</h1>
      <p>Hi <strong>${userName}</strong>,</p>
      <p>An event you booked has been updated:</p>
      <h3>${event.title}</h3>
      <p><strong>What changed:</strong> ${changes}</p>
      <p><strong>New date:</strong> ${new Date(event.date).toLocaleString()}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <hr>
      <small style="color: #888;">SEBS Team</small>
    </div>
  `,
});

module.exports = {
    welcomeTemplate,
    bookingConfirmationTemplate,
    bookingCancellationTemplate,
    eventUpdateTemplate,
};