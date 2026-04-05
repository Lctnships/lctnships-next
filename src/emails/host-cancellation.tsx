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

interface HostCancellationEmailProps {
  renterName?: string
  studioName?: string
  dateTime?: string
  duration?: string
  refundAmount?: string
  cancellationReason?: string
  baseUrl?: string
}

export default function HostCancellationEmail({
  renterName = "Maya Chen",
  studioName = "The Industrial Loft Studio",
  dateTime = "Saturday, November 2 · 10:00 AM – 4:00 PM",
  duration = "6 hours",
  refundAmount = "$480.00",
  cancellationReason = "Schedule conflict",
  baseUrl = "https://lctnships.com",
}: HostCancellationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {renterName} cancelled their booking at {studioName}
      </Preview>
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
            <div style={cancelIcon}>
              <Text style={{ margin: "0", fontSize: "32px" }}>✕</Text>
            </div>

            <Heading style={h1}>A booking has been cancelled</Heading>

            <Text style={bodyText}>
              {renterName} has cancelled their upcoming session at your studio.
              The time slot is now available for other renters to book.
            </Text>

            {/* Booking Details */}
            <Section style={detailsCard}>
              <Text style={detailsTitle}>CANCELLED BOOKING</Text>
              <Text style={studioNameStyle}>{studioName}</Text>
              <Text style={detailText}>📅 {dateTime}</Text>
              <Text style={detailText}>⏱ {duration}</Text>
              <Text style={detailText}>👤 {renterName}</Text>
            </Section>

            {/* Cancellation Info */}
            <Section style={infoCard}>
              <Text style={infoLabel}>CANCELLATION REASON</Text>
              <Text style={infoValue}>{cancellationReason}</Text>
            </Section>

            <Section style={infoCard}>
              <Text style={infoLabel}>REFUND ISSUED</Text>
              <Text style={refundValue}>{refundAmount}</Text>
              <Text style={infoMeta}>
                Refunded to the renter per your cancellation policy
              </Text>
            </Section>

            {/* CTA */}
            <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
              <Button
                style={primaryButton}
                href={`${baseUrl}/host/calendar`}
              >
                Update Availability
              </Button>
            </Section>

            <Section style={{ textAlign: "center" as const }}>
              <Link href={`${baseUrl}/host/bookings`} style={secondaryLink}>
                View All Bookings
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this because you&apos;re a studio host on lctnships.
            </Text>
            <Text style={copyright}>
              © {new Date().getFullYear()} LCNTSHIPS STUDIO RENTALS. ALL RIGHTS
              RESERVED.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f7f8",
  fontFamily:
    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
}

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden" as const,
  border: "1px solid #e7f0f3",
}

const header = {
  padding: "32px",
  borderBottom: "1px solid #e7f0f3",
  textAlign: "center" as const,
}

const logoLink = { textDecoration: "none", color: "#0e181b" }
const logoText = { fontSize: "24px", fontWeight: "700" }

const content = {
  padding: "40px 32px",
  textAlign: "center" as const,
}

const cancelIcon = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  backgroundColor: "#fef2f2",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "24px",
  color: "#ef4444",
}

const h1 = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#0e181b",
  margin: "0 0 16px",
}

const bodyText = {
  fontSize: "16px",
  color: "#4e8597",
  lineHeight: "1.6",
  margin: "0 0 32px",
  maxWidth: "480px",
  marginLeft: "auto",
  marginRight: "auto",
}

const detailsCard = {
  padding: "24px",
  backgroundColor: "#f6f7f8",
  borderRadius: "12px",
  border: "1px solid #e7f0f3",
  textAlign: "left" as const,
  marginBottom: "16px",
}

const detailsTitle = {
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "2px",
  color: "#ef4444",
  margin: "0 0 12px",
}

const studioNameStyle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#0e181b",
  margin: "0 0 12px",
}

const detailText = {
  fontSize: "14px",
  color: "#4e8597",
  fontWeight: "500",
  margin: "0 0 6px",
}

const infoCard = {
  padding: "20px 24px",
  backgroundColor: "#f6f7f8",
  borderRadius: "12px",
  border: "1px solid #e7f0f3",
  textAlign: "left" as const,
  marginBottom: "12px",
}

const infoLabel = {
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1px",
  color: "#4e8597",
  margin: "0 0 4px",
  textTransform: "uppercase" as const,
}

const infoValue = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#0e181b",
  margin: "0",
}

const refundValue = {
  fontSize: "24px",
  fontWeight: "800",
  color: "#ef4444",
  margin: "4px 0",
}

const infoMeta = {
  fontSize: "13px",
  color: "#4e8597",
  margin: "4px 0 0",
}

const primaryButton = {
  backgroundColor: "#30bae8",
  color: "#0e181b",
  fontSize: "18px",
  fontWeight: "700",
  padding: "16px 20px",
  borderRadius: "8px",
  textDecoration: "none",
  display: "block",
  width: "320px",
  maxWidth: "100%",
  textAlign: "center" as const,
  margin: "0 auto",
}

const secondaryLink = {
  display: "block",
  color: "#30bae8",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  marginTop: "16px",
}

const footer = {
  padding: "32px",
  borderTop: "1px dashed #e7f0f3",
  margin: "0 32px",
  textAlign: "center" as const,
}

const footerText = {
  fontSize: "14px",
  color: "#4e8597",
  lineHeight: "1.6",
  margin: "0 0 16px",
}

const copyright = {
  fontSize: "10px",
  color: "#4e8597",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  opacity: 0.5,
  marginTop: "16px",
}
