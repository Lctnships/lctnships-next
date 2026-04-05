import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface BookingPendingEmailProps {
  studioName?: string
  studioImage?: string
  date?: string
  time?: string
  location?: string
  totalPrice?: string
  baseUrl?: string
}

export default function BookingPendingEmail({
  studioName = "Creative Loft Studio",
  studioImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuBXDvuPOHtXCfxutXoCmu9KlafWrXTSeiktZcQvBtmGox9WDgCwVo_BwbXkrMB4aw77O-zmvm32PL6WlZTQX1XozMJIUS0dB7beYpKN-CBkKprq-IiJQ_HlXhmU28nAdtYCL7FEEOYjGRqBb8yHgnaRMACFS1PghAjWe8xTr-BZCTQ27zBlI14y0bMhq8r1WDpxjBMx_5q6qfVh21g45KSUcNonjHNsCRBg3V7wGRM46eTEzbIzF4jC_dYlZcR2pvSywU5sBC1w4Ss",
  date = "Oct 24, 2023",
  time = "10:00 AM - 2:00 PM (4h)",
  location = "Brooklyn, NY",
  totalPrice = "$120.00",
  baseUrl = "https://lctnships.com",
}: BookingPendingEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your booking request for {studioName} has been sent</Preview>
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
            {/* Icon & Heading */}
            <Section style={{ textAlign: "center" as const, marginBottom: "24px" }}>
              <div style={iconCircle}>
                <Text style={iconText}>✉</Text>
              </div>
              <Heading style={h1}>Request sent: {studioName}</Heading>
              <Text style={bodyText}>
                Your booking request is on its way. The host usually responds
                within 24 hours to confirm your reservation.
              </Text>
            </Section>

            {/* Progress Bar */}
            <Section style={progressCard}>
              <Section style={progressHeader}>
                <Text style={progressTitle}>Booking Progress</Text>
                <Text style={progressBadge}>STEP 1 OF 3</Text>
              </Section>
              <div style={progressBarBg}>
                <div style={progressBarFill} />
              </div>
              <Text style={progressStatus}>⏳ Pending Host Approval</Text>
            </Section>

            {/* Booking Summary */}
            <Section style={summaryCard}>
              <Text style={summaryLabel}>RESERVATION SUMMARY</Text>
              <Section style={{ display: "flex", gap: "24px" }}>
                <Img
                  src={studioImage}
                  width="180"
                  height="180"
                  alt={studioName}
                  style={summaryImage}
                />
                <div>
                  <Text style={summaryStudioName}>{studioName}</Text>
                  <Text style={summaryDetail}>📅 {date}</Text>
                  <Text style={summaryDetail}>🕐 {time}</Text>
                  <Text style={summaryDetail}>📍 {location}</Text>
                  <Section style={summaryDivider} />
                  <Section style={summaryTotal}>
                    <Text style={summaryTotalLabel}>Total (Pending)</Text>
                    <Text style={summaryTotalValue}>{totalPrice}</Text>
                  </Section>
                </div>
              </Section>
            </Section>

            {/* CTA */}
            <Section style={{ textAlign: "center" as const }}>
              <Button style={primaryButton} href={`${baseUrl}/bookings`}>
                View Booking Details
              </Button>
              <Text style={paymentNote}>
                Your payment method will only be charged once the host accepts
                your request.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerLinks}>
              <Link href={`${baseUrl}/help`} style={footerLink}>Help Center</Link>
              {"  "}
              <Link href={`${baseUrl}/cancellation`} style={footerLink}>Cancellation Policy</Link>
              {"  "}
              <Link href={`${baseUrl}/terms`} style={footerLink}>Terms</Link>
            </Text>
            <Text style={footerText}>
              Questions? Reply to this email or contact support at hello@lctnships.com
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} lctnships, Inc.
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
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  overflow: "hidden" as const,
  border: "1px solid #e7f0f3",
}

const header = {
  padding: "16px 24px",
  borderBottom: "1px solid #e7f0f3",
}

const logoLink = { textDecoration: "none", color: "#0e181b" }
const logoText = { fontSize: "18px", fontWeight: "700" }

const content = { padding: "32px 24px" }

const iconCircle = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  backgroundColor: "rgba(48, 186, 232, 0.2)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "16px",
}

const iconText = { fontSize: "28px", margin: "0" }

const h1 = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#0e181b",
  lineHeight: "1.2",
  margin: "0 0 12px",
  textAlign: "center" as const,
}

const bodyText = {
  fontSize: "16px",
  color: "#4e8597",
  lineHeight: "1.6",
  textAlign: "center" as const,
  margin: "0 0 24px",
  maxWidth: "480px",
  marginLeft: "auto",
  marginRight: "auto",
}

const progressCard = {
  backgroundColor: "#f8fbfc",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "32px",
}

const progressHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
}

const progressTitle = { fontSize: "16px", fontWeight: "600", color: "#0e181b", margin: "0" }

const progressBadge = {
  backgroundColor: "rgba(48, 186, 232, 0.2)",
  color: "#30bae8",
  fontSize: "11px",
  fontWeight: "700",
  padding: "4px 12px",
  borderRadius: "999px",
  margin: "0",
}

const progressBarBg = {
  backgroundColor: "#d0e1e7",
  borderRadius: "999px",
  height: "10px",
  overflow: "hidden" as const,
  marginBottom: "8px",
}

const progressBarFill = {
  backgroundColor: "#30bae8",
  height: "100%",
  borderRadius: "999px",
  width: "33.3%",
}

const progressStatus = {
  fontSize: "14px",
  color: "#4e8597",
  fontWeight: "500",
  margin: "4px 0 0",
}

const summaryCard = {
  padding: "16px",
  border: "1px solid #e7f0f3",
  borderRadius: "12px",
  marginBottom: "32px",
}

const summaryLabel = {
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  color: "#4e8597",
  margin: "0 0 16px",
}

const summaryImage = {
  borderRadius: "8px",
  objectFit: "cover" as const,
  marginBottom: "16px",
  width: "100%",
  maxWidth: "180px",
}

const summaryStudioName = { fontSize: "20px", fontWeight: "700", color: "#0e181b", margin: "0 0 8px" }
const summaryDetail = { fontSize: "14px", color: "#4e8597", fontWeight: "500", margin: "0 0 4px" }

const summaryDivider = {
  borderTop: "1px dashed #e7f0f3",
  marginTop: "16px",
  paddingTop: "16px",
}

const summaryTotal = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}

const summaryTotalLabel = { fontSize: "14px", color: "#4e8597", margin: "0" }
const summaryTotalValue = { fontSize: "18px", fontWeight: "700", color: "#0e181b", margin: "0" }

const primaryButton = {
  backgroundColor: "#30bae8",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  padding: "16px 32px",
  borderRadius: "999px",
  textDecoration: "none",
  display: "inline-block",
  minWidth: "240px",
  textAlign: "center" as const,
}

const paymentNote = {
  fontSize: "12px",
  color: "#4e8597",
  textAlign: "center" as const,
  margin: "16px 0 0",
}

const footer = {
  backgroundColor: "#f8fbfc",
  padding: "32px 24px",
  borderTop: "1px solid #e7f0f3",
  textAlign: "center" as const,
}

const footerLinks = { fontSize: "14px", margin: "0 0 12px" }
const footerLink = { color: "#30bae8", textDecoration: "none" }
const footerText = { fontSize: "12px", color: "#4e8597", margin: "0 0 8px" }
const footerCopyright = { fontSize: "12px", color: "#4e8597", margin: "0" }
