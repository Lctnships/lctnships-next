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

interface NewMessageEmailProps {
  senderName?: string
  senderAvatar?: string
  messagePreview?: string
  studioName?: string
  baseUrl?: string
}

export default function NewMessageEmail({
  senderName = "Alex",
  senderAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuCp1DzLwrm-3wfiUqpNTH2aDqZR_RZ92sd13dknKecSQvInCOOdVSClLYDkdI6eco877EkpCpvuJzFy23KixiUWhwzLqB2-McLCyB0bk31kbDuPxUVgDv7VqbEHHtcBv07-Ak4rHf9RKGPKCOGT6kANEC40nlBCCpOxXMECdCp5ZQfDnaBmq5C2YQuxk8Imp5XBdRNGUuYymsur82P3p_EzUJKoT_AN2KrxbQ3fv4PCFWLXXadG9fr4_5SVLaTOrZt4i-pU84jI-fQ",
  messagePreview = "Hi! I just wanted to confirm your booking for the industrial studio next Tuesday. Does 10 AM still work for you? I'll be there to help you set up the lighting gear.",
  studioName = "The Industrial Loft Studio",
  baseUrl = "https://lctnships.com",
}: NewMessageEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{senderName} sent you a message about {studioName}</Preview>
      <Body style={main}>
        <Container style={outerContainer}>
          {/* Header */}
          <Section style={header}>
            <Link href={baseUrl} style={logoLink}>
              <span style={logoText}>lctnships</span>
            </Link>
          </Section>

          {/* Content Card */}
          <Section style={contentCard}>
            {/* Headline */}
            <Heading style={h1}>{senderName} sent you a message</Heading>

            {/* Meta Info */}
            <Text style={metaText}>
              This message is regarding your booking at{" "}
              <span style={studioHighlight}>{studioName}</span>
            </Text>

            {/* Chat Bubble */}
            <Section style={chatSection}>
              <Section style={chatRow}>
                <Img
                  src={senderAvatar}
                  width="48"
                  height="48"
                  alt={senderName}
                  style={avatarStyle}
                />
                <div style={{ flex: "1" }}>
                  <Text style={senderNameStyle}>{senderName}</Text>
                  <Section style={messageBubble}>
                    <Text style={messageText}>{messagePreview}</Text>
                  </Section>
                </div>
              </Section>
            </Section>

            {/* CTA */}
            <Section style={{ textAlign: "center" as const, padding: "16px 0" }}>
              <Button style={primaryButton} href={`${baseUrl}/messages`}>
                Reply in Chat
              </Button>
            </Section>

            <Section style={{ textAlign: "center" as const }}>
              <Link href={`${baseUrl}/bookings`} style={bookingLink}>
                View Booking Details
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this because you have an active booking or
              inquiry on lctnships.
            </Text>
            <Text style={footerLinks}>
              <Link href={`${baseUrl}/notifications`} style={footerLink}>Notification Settings</Link>
              {" • "}
              <Link href={`${baseUrl}/privacy`} style={footerLink}>Privacy Policy</Link>
              {" • "}
              <Link href={`${baseUrl}/support`} style={footerLink}>Contact Support</Link>
            </Text>
            <Text style={footerCopyright}>lctnships Creative Spaces Inc.</Text>
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

const outerContainer = {
  maxWidth: "600px",
  margin: "0 auto",
}

const header = {
  padding: "24px 32px",
  borderBottom: "1px solid rgba(48,186,232,0.1)",
}

const logoLink = { textDecoration: "none", color: "#0e181b" }
const logoText = { fontSize: "18px", fontWeight: "700" }

const contentCard = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  border: "1px solid rgba(48,186,232,0.05)",
  padding: "32px 48px",
  margin: "32px 0",
  textAlign: "center" as const,
}

const h1 = { fontSize: "28px", fontWeight: "800", color: "#0e181b", margin: "0 0 16px" }

const metaText = { fontSize: "14px", color: "#94a3b8", margin: "0 0 32px" }
const studioHighlight = { color: "#30bae8", fontWeight: "500" }

const chatSection = { maxWidth: "480px", margin: "0 auto 40px" }
const chatRow = { display: "flex", alignItems: "flex-end", gap: "12px" }
const avatarStyle = { width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" as const, border: "2px solid #ffffff" }

const senderNameStyle = { fontSize: "13px", fontWeight: "600", color: "#30bae8", margin: "0 0 4px", paddingLeft: "16px", textAlign: "left" as const }

const messageBubble = {
  backgroundColor: "#f1f5f9",
  borderRadius: "16px 16px 16px 0",
  padding: "16px 24px",
}

const messageText = {
  fontSize: "16px",
  color: "#334155",
  lineHeight: "1.6",
  margin: "0",
  textAlign: "left" as const,
}

const primaryButton = {
  backgroundColor: "#30bae8",
  color: "#0e181b",
  fontSize: "18px",
  fontWeight: "700",
  padding: "16px 32px",
  borderRadius: "999px",
  textDecoration: "none",
  display: "inline-block",
  minWidth: "220px",
  textAlign: "center" as const,
}

const bookingLink = {
  display: "block",
  color: "#30bae8",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  marginTop: "16px",
}

const footer = { padding: "32px", textAlign: "center" as const }
const footerText = { fontSize: "12px", color: "#94a3b8", margin: "0 0 16px" }
const footerLinks = { fontSize: "12px", color: "#94a3b8", margin: "0 0 24px" }
const footerLink = { color: "#94a3b8", textDecoration: "none" }
const footerCopyright = { fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "2px", fontWeight: "700", margin: "0" }
