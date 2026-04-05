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

interface HostBookingRequestEmailProps {
  renterName?: string
  renterAvatar?: string
  studioName?: string
  dateTime?: string
  duration?: string
  totalAmount?: string
  renterMessage?: string
  baseUrl?: string
}

export default function HostBookingRequestEmail({
  renterName = "Maya Chen",
  renterAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuCp1DzLwrm-3wfiUqpNTH2aDqZR_RZ92sd13dknKecSQvInCOOdVSClLYDkdI6eco877EkpCpvuJzFy23KixiUWhwzLqB2-McLCyB0bk31kbDuPxUVgDv7VqbEHHtcBv07-Ak4rHf9RKGPKCOGT6kANEC40nlBCCpOxXMECdCp5ZQfDnaBmq5C2YQuxk8Imp5XBdRNGUuYymsur82P3p_EzUJKoT_AN2KrxbQ3fv4PCFWLXXadG9fr4_5SVLaTOrZt4i-pU84jI-fQ",
  studioName = "The Industrial Loft Studio",
  dateTime = "Saturday, November 2 · 10:00 AM – 4:00 PM",
  duration = "6 hours",
  totalAmount = "$480.00",
  renterMessage = "Hi! I'm a fashion photographer looking to shoot a lookbook for a local designer. Love the natural light in your space!",
  baseUrl = "https://lctnships.com",
}: HostBookingRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        New booking request from {renterName} for {studioName}
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
            <Text style={badge}>NEW BOOKING REQUEST</Text>

            <Heading style={h1}>
              {renterName} wants to book your studio
            </Heading>

            {/* Renter Info */}
            <Section style={renterSection}>
              <Img
                src={renterAvatar}
                width="56"
                height="56"
                alt={renterName}
                style={avatarStyle}
              />
              <Text style={renterNameStyle}>{renterName}</Text>
            </Section>

            {/* Booking Details */}
            <Section style={detailsCard}>
              <Text style={detailsTitle}>BOOKING DETAILS</Text>
              <Text style={studioNameStyle}>{studioName}</Text>
              <Text style={detailText}>📅 {dateTime}</Text>
              <Text style={detailText}>⏱ {duration}</Text>
              <Text style={detailText}>💰 {totalAmount}</Text>
            </Section>

            {/* Renter Message */}
            {renterMessage && (
              <Section style={messageCard}>
                <Text style={messageLabel}>MESSAGE FROM {renterName.toUpperCase()}</Text>
                <Text style={messageText}>&ldquo;{renterMessage}&rdquo;</Text>
              </Section>
            )}

            {/* Action Buttons */}
            <Section style={{ textAlign: "center" as const, padding: "8px 0" }}>
              <Button style={approveButton} href={`${baseUrl}/host/bookings`}>
                Accept Booking
              </Button>
            </Section>

            <Section style={{ textAlign: "center" as const }}>
              <Button style={declineButton} href={`${baseUrl}/host/bookings`}>
                Decline
              </Button>
            </Section>

            {/* Warning */}
            <Section style={warningCard}>
              <Text style={warningText}>
                ⏰ Please respond within 24 hours to keep your response rate
                high.
              </Text>
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

const badge = {
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "2px",
  color: "#30bae8",
  margin: "0 0 16px",
}

const h1 = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#0e181b",
  margin: "0 0 24px",
}

const renterSection = {
  textAlign: "center" as const,
  marginBottom: "24px",
}

const avatarStyle = {
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  objectFit: "cover" as const,
  margin: "0 auto",
}

const renterNameStyle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#0e181b",
  margin: "8px 0 0",
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
  color: "#30bae8",
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

const messageCard = {
  padding: "20px 24px",
  backgroundColor: "rgba(48,186,232,0.05)",
  borderRadius: "12px",
  border: "1px solid rgba(48,186,232,0.1)",
  textAlign: "left" as const,
  marginBottom: "24px",
}

const messageLabel = {
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1px",
  color: "#30bae8",
  margin: "0 0 8px",
}

const messageText = {
  fontSize: "15px",
  color: "#4e8597",
  lineHeight: "1.6",
  margin: "0",
  fontStyle: "italic",
}

const approveButton = {
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

const declineButton = {
  backgroundColor: "transparent",
  color: "#4e8597",
  fontSize: "14px",
  fontWeight: "600",
  padding: "12px 20px",
  borderRadius: "8px",
  textDecoration: "none",
  display: "inline-block",
  border: "1px solid #e7f0f3",
  marginTop: "8px",
}

const warningCard = {
  marginTop: "24px",
  padding: "16px 24px",
  backgroundColor: "#f6f7f8",
  borderRadius: "12px",
  border: "1px solid #e7f0f3",
  maxWidth: "480px",
  marginLeft: "auto",
  marginRight: "auto",
}

const warningText = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#4e8597",
  textAlign: "center" as const,
  margin: "0",
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
