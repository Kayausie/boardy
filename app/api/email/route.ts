import { NextRequest, NextResponse } from "next/server";

// In a production environment, this would use Nodemailer/Resend/SendGrid
// For the hackathon demo, we simulate the email and return the rendered content

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, employeeName, eventType, eventDescription, score, status, viewRole } = body;

    // Build email HTML content
    const timestamp = new Date().toLocaleString("en-US", {
      weekday: "short", year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

    const isHR = viewRole === "HR";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
  <div style="background: #111; color: #fff; padding: 20px 24px; border-radius: 12px 12px 0 0;">
    <h1 style="margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.5px;">
      Boardy<span style="color: #4b6cb7;">.</span> Auto Report
    </h1>
    <p style="margin: 4px 0 0; font-size: 12px; color: #999;">Event-Driven Notification System</p>
  </div>
  <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin: 0 0 4px; font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">
      ${isHR ? "HR WELLNESS ALERT" : "MANAGER PERFORMANCE ALERT"}
    </p>
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #111; font-weight: 700;">
      New Activity Detected: ${employeeName}
    </h2>
    
    <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #6b7280; width: 140px;">Event Type</td>
          <td style="padding: 6px 0; color: #111; font-weight: 600;">${eventType}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">Description</td>
          <td style="padding: 6px 0; color: #111; font-weight: 600;">${eventDescription}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">AI Score</td>
          <td style="padding: 6px 0; color: ${score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'}; font-weight: 700;">${score}/100</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">Status</td>
          <td style="padding: 6px 0; color: #111; font-weight: 600;">${status}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">Timestamp</td>
          <td style="padding: 6px 0; color: #111;">${timestamp}</td>
        </tr>
      </table>
    </div>

    ${isHR ? `
    <div style="border-left: 3px solid #8b5cf6; padding: 12px 16px; background: #faf5ff; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
      <p style="margin: 0; font-size: 13px; color: #6d28d9; font-weight: 600;">HR Insight</p>
      <p style="margin: 6px 0 0; font-size: 13px; color: #374151; line-height: 1.6;">
        This activity may indicate ${score >= 70 ? 'positive engagement and cultural integration' : 'a potential need for additional onboarding support or a 1-on-1 check-in'}. 
        Consider ${score >= 70 ? 'recognizing this achievement in the next team meeting' : 'scheduling a wellness check within 48 hours'}.
      </p>
    </div>
    ` : `
    <div style="border-left: 3px solid #4b6cb7; padding: 12px 16px; background: #eff6ff; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
      <p style="margin: 0; font-size: 13px; color: #1d4ed8; font-weight: 600;">Manager Action Item</p>
      <p style="margin: 6px 0 0; font-size: 13px; color: #374151; line-height: 1.6;">
        ${score >= 70 ? `${employeeName} is showing strong velocity. Review their latest deliverables and consider increasing task complexity.` : `${employeeName}'s output metrics need attention. Review blockers in Jira and schedule a technical pairing session.`}
      </p>
    </div>
    `}

    <a href="https://boardy-topaz.vercel.app/dashboard" style="display: inline-block; background: #111; color: #fff; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none;">
      View Full Dashboard →
    </a>
  </div>
  <div style="padding: 16px 24px; text-align: center; font-size: 11px; color: #9ca3af;">
    Sent by Boardy AI Onboarding Copilot · Event-Driven Architecture<br>
    Auto-generated at ${timestamp}
  </div>
</body>
</html>`;

    // In production: send via Nodemailer/Resend/SendGrid
    // For hackathon demo: return the rendered email for preview
    const emailData = {
      success: true,
      to: to || (isHR ? "hr@company.com" : "manager@company.com"),
      subject: subject || `[Boardy Alert] New ${eventType} — ${employeeName}`,
      html: emailHtml,
      sentAt: timestamp,
      note: "Email preview rendered. In production, this would be sent via SMTP/SendGrid."
    };

    return NextResponse.json(emailData);
  } catch (error: any) {
    console.error("Email route error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
