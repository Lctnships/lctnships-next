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

interface BookingConfirmedEmailProps {
  studioName?: string
  studioImage?: string
  dateTime?: string
  location?: string
  hostName?: string
  hostPhone?: string
  baseUrl?: string
}

export default function BookingConfirmedEmail({
  studioName = "Studio North • Main Stage",
  studioImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuAAi8dNESsNCeah_NTUmZevfJtKHm6Hfvm41HKFN_0v-TD1ue9h0qsGz1rmC3QQyvytHFRQwz0dwvcFA8fjHNoGirzIZKO1tBk9oFlr67Ka9nBFDRs0W8kf9pgUu7fTDodUpmXnHeoo1TEYWT_539VrUr6DjtLbfg90-8KzAyt5PRNf5kcF-u-ZnR7r0MDPCp_T8wMZDm5j-nn74DvRoe5c-sZapbTw9Rm7PRR8DFS7KP8dAXEHOa_0F8GlAQyyXmfXzDupTgfqx9E",
  dateTime = "Friday, Oct 24, 2023 • 2:00 PM - 6:00 PM",
  location = "123 Creative Way, Art District, NY 10001",
  hostName = "Marcus Jensen",
  hostPhone = "+1 (555) 012-3456",
  baseUrl = "https://lctnships.com",
}: BookingConfirmedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your session at {studioName} is confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Link href={baseUrl} style={logoLink}>
              <span style={logoText}>lctnships</span>
            </Link>
          </Section>

          {/* Hero Image */}
          <Section style={{ padding: "0 24px" }}>
            <Img
              src={studioImage}
              width="552"
              height="400"
              alt={studioName}
              style={heroImage}
            />
          </Section>

          {/* Headline */}
          <Section style={{ textAlign: "center" as const, padding: "32px 32px 0" }}>
            <Heading style={h1}>Your session is confirmed!</Heading>
            <Text style={bodyText}>
              Get ready to create at {studioName}. Your host has been notified
              and everything is set for your arrival.
            </Text>
          </Section>

          {/* Booking Details Card */}
          <Section style={detailsCard}>
            <Heading as="h3" style={detailsHeading}>
              Booking Summary
            </Heading>

            <Section style={detailRow}>
              <Text style={detailLabel}>Date & Time</Text>
              <Text style={detailValue}>{dateTime}</Text>
            </Section>

            <Section style={detailRow}>
              <Text style={detailLabel}>Location</Text>
              <Text style={detailValue}>{location}</Text>
            </Section>

            <Section style={detailRow}>
              <Text style={detailLabel}>Host</Text>
              <Text style={detailValue}>
                {hostName} • {hostPhone}
              </Text>
            </Section>
          </Section>

          {/* CTA */}
          <Section style={{ padding: "0 32px 16px", textAlign: "center" as const }}>
            <Button style={primaryButton} href={`${baseUrl}/bookings`}>
              View Details
            </Button>
          </Section>
          <Section style={{ padding: "0 32px 40px", textAlign: "center" as const }}>
            <Button style={secondaryButton} href={`${baseUrl}/bookings`}>
              Manage Booking
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Need help? Contact our{" "}
              <Link href={`${baseUrl}/support`} style={footerLink}>
                Support Team
              </Link>{" "}
              or visit our{" "}
              <Link href={`${baseUrl}/help`} style={footerLink}>
                Help Center
              </Link>
              .
            </Text>
            <Text style={footerLinks}>
              <Link href={`${baseUrl}/privacy`} style={footerLink}>Privacy Policy</Link>
              {" • "}
              <Link href={`${baseUrl}/terms`} style={footerLink}>Terms of Service</Link>
              {" • "}
              <Link href={`${baseUrl}/unsubscribe`} style={footerLink}>Unsubscribe</Link>
            </Text>
            <Text style={footerCopyright}>© {new Date().getFullYear()} lctnships Creative Inc.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f6f8",
  fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
}

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden" as const,
  border: "1px solid #e5e5e5",
}

const header = {
  padding: "24px 32px",
  borderBottom: "1px solid #f0f0f0",
}

const logoLink = {
  textDecoration: "none",
  color: "#0f49bd",
}

const logoText = {
  fontSize: "20px",
  fontWeight: "800",
  letterSpacing: "-0.5px",
}

const heroImage = {
  width: "100%",
  borderRadius: "12px",
  objectFit: "cover" as const,
}

const h1 = {
  fontSize: "36px",
  fontWeight: "800",
  color: "#0d121b",
  lineHeight: "1.2",
  margin: "0 0 16px",
}

const bodyText = {
  fontSize: "16px",
  color: "#64748b",
  lineHeight: "1.6",
  margin: "0 0 32px",
}

const detailsCard = {
  margin: "0 32px 32px",
  padding: "24px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  border: "1px solid #e5e5e5",
}

const detailsHeading = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#0d121b",
  margin: "0 0 20px",
}

const detailRow = {
  marginBottom: "16px",
}

const detailLabel = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#0d121b",
  margin: "0 0 2px",
}

const detailValue = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0",
}

const primaryButton = {
  backgroundColor: "#0d121b",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  padding: "16px 0",
  borderRadius: "12px",
  textDecoration: "none",
  display: "block",
  width: "100%",
  textAlign: "center" as const,
}

const secondaryButton = {
  backgroundColor: "#ffffff",
  color: "#0d121b",
  fontSize: "16px",
  fontWeight: "700",
  padding: "16px 0",
  borderRadius: "12px",
  textDecoration: "none",
  display: "block",
  border: "1px solid #e5e5e5",
  width: "100%",
  textAlign: "center" as const,
}

const footer = {
  padding: "32px",
  textAlign: "center" as const,
  borderTop: "1px solid #f0f0f0",
}

const footerText = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0 0 16px",
}

const footerLink = {
  color: "#0f49bd",
  textDecoration: "none",
}

const footerLinks = {
  fontSize: "12px",
  color: "#94a3b8",
  margin: "0 0 16px",
}

const footerCopyright = {
  fontSize: "11px",
  color: "#94a3b8",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  margin: "0",
}
