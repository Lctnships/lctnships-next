import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface SessionReminderEmailProps {
  studioName?: string
  dateTime?: string
  location?: string
  doorCode?: string
  wifiName?: string
  wifiPassword?: string
  baseUrl?: string
}

export default function SessionReminderEmail({
  studioName = "Studio A",
  dateTime = "Tomorrow, Oct 24 • 10:00 AM - 2:00 PM",
  location = "Creative Hub, 123 Arts District, Floor 2",
  doorCode = "8842#",
  wifiName = "StudioA_HighSpeed",
  wifiPassword = "create2024",
  baseUrl = "https://lctnships.com",
}: SessionReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your session at {studioName} is tomorrow!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Link href={baseUrl} style={logoLink}>
              <span style={logoText}>lctnships</span>
            </Link>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>See you tomorrow!</Heading>
            <Text style={bodyText}>
              Your session at <strong>{studioName}</strong> is just 24 hours
              away. We&apos;re getting everything ready for your creative workflow.
            </Text>

            {/* Booking Summary */}
            <Section style={summaryCard}>
              <Section style={summaryRow}>
                <Text style={summaryLabel}>Date & Time</Text>
                <Text style={summaryValue}>{dateTime}</Text>
              </Section>
              <Section style={summaryRow}>
                <Text style={summaryLabel}>Location</Text>
                <Text style={summaryValue}>{location}</Text>
              </Section>
            </Section>

            {/* Access Instructions */}
            <Heading as="h2" style={sectionHeading}>
              Access Instructions
            </Heading>

            {/* Door Code */}
            <Section style={accessCard}>
              <div>
                <Text style={accessTitle}>🔑 Door Code: {doorCode}</Text>
                <Text style={accessDescription}>
                  Main entrance keypad. Valid 15 mins before booking start.
                </Text>
              </div>
            </Section>

            {/* Wi-Fi */}
            <Section style={accessCard}>
              <div>
                <Text style={accessTitle}>📶 Wi-Fi: {wifiName}</Text>
                <Text style={accessDescription}>
                  Password: {wifiPassword}
                </Text>
              </div>
            </Section>

            {/* Gear Checklist */}
            <Section style={tipCard}>
              <Text style={tipTitle}>✅ Pro Tip: Check your gear</Text>
              <Text style={tipItem}>• Charge all batteries overnight</Text>
              <Text style={tipItem}>
                • Format your SD cards and clear space
              </Text>
              <Text style={tipItem}>
                • Download our equipment list to see what&apos;s included
              </Text>
            </Section>

            {/* CTA */}
            <Section style={{ textAlign: "center" as const }}>
              <Button style={primaryButton} href={`${baseUrl}/bookings`}>
                View Booking Details
              </Button>
              <Link href={`${baseUrl}/bookings`} style={rescheduleLink}>
                Reschedule or Cancel
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this because you have a confirmed booking with
              lctnships.
              <br />
              Need help?{" "}
              <Link href={`${baseUrl}/support`} style={footerLink}>
                Contact Support
              </Link>
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} lctnships Creative Rentals Inc.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f7f8",
  fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
}

const container = {
  maxWidth: "640px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden" as const,
  border: "1px solid #e7f0f3",
}

const header = { padding: "20px 40px", borderBottom: "1px solid #e7f0f3" }
const logoLink = { textDecoration: "none", color: "#0e181b" }
const logoText = { fontSize: "18px", fontWeight: "700" }

const content = { padding: "16px 40px 40px" }

const h1 = { fontSize: "32px", fontWeight: "700", color: "#0e181b", textAlign: "center" as const, margin: "32px 0 8px" }

const bodyText = {
  fontSize: "16px",
  color: "#4e8597",
  lineHeight: "1.6",
  textAlign: "center" as const,
  margin: "0 0 24px",
}

const summaryCard = {
  backgroundColor: "#f8fbfc",
  border: "1px solid #d0e1e7",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "32px",
}

const summaryRow = { marginBottom: "16px" }
const summaryLabel = { fontSize: "14px", color: "#4e8597", margin: "0 0 2px" }
const summaryValue = { fontSize: "16px", fontWeight: "700", color: "#0e181b", margin: "0" }

const sectionHeading = { fontSize: "22px", fontWeight: "700", color: "#0e181b", margin: "0 0 12px" }

const accessCard = {
  padding: "20px",
  border: "1px solid #d0e1e7",
  borderRadius: "12px",
  marginBottom: "16px",
  backgroundColor: "#f8fbfc",
}

const accessTitle = { fontSize: "16px", fontWeight: "700", color: "#0e181b", margin: "0 0 4px" }
const accessDescription = { fontSize: "14px", color: "#4e8597", margin: "0" }

const tipCard = {
  backgroundColor: "rgba(48, 186, 232, 0.1)",
  borderLeft: "4px solid #30bae8",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "32px",
  marginTop: "32px",
}

const tipTitle = { fontSize: "16px", fontWeight: "700", color: "#0e181b", margin: "0 0 8px" }
const tipItem = { fontSize: "14px", color: "#4e8597", margin: "0 0 4px" }

const primaryButton = {
  backgroundColor: "#30bae8",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  padding: "14px 24px",
  borderRadius: "12px",
  textDecoration: "none",
  display: "inline-block",
  minWidth: "240px",
  textAlign: "center" as const,
}

const rescheduleLink = {
  display: "block",
  color: "#30bae8",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  marginTop: "16px",
  textAlign: "center" as const,
}

const footer = {
  backgroundColor: "#f8fbfc",
  padding: "32px 40px",
  borderTop: "1px solid #e7f0f3",
  textAlign: "center" as const,
}

const footerText = { fontSize: "12px", color: "#4e8597", lineHeight: "1.6", margin: "0 0 8px" }
const footerLink = { color: "#30bae8", fontWeight: "700", textDecoration: "none" }
const footerCopyright = { fontSize: "10px", color: "#4e8597", opacity: 0.5, margin: "16px 0 0" }
