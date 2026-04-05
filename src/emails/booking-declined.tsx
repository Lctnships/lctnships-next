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

interface BookingDeclinedEmailProps {
  userName?: string
  hostName?: string
  hostAvatar?: string
  hostMessage?: string
  baseUrl?: string
}

export default function BookingDeclinedEmail({
  userName = "Alex",
  hostName = "Sarah, Studio Owner",
  hostAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuBErewowerDHQWrM2LeaqqFM0zUc5egClIATJoaUk5UkIag4i94oK2YEwBCVEdENhrCxeQWAUDxYhzwsRHwNQVDIjtGAekfPzElFKM1nCU1k6t5vSFObWmgwaPdJhP4r1KZEFFgXCZUIErPf0Lsz5mhONjeNwQGqGRht9t9ojOG3XIzn4mSYc1kx5h-qP5DZ_zRW2570BLpfyl-4XfaSgnm_dHa_2MoOzH8yrGUDcuX0zEif6xO9izOb2oo22VEMp1PK8M9tVIlcu8",
  hostMessage = "I'm so sorry, but the studio will be undergoing some unexpected maintenance during those days. I'd love to host you another time!",
  baseUrl = "https://lctnships.com",
}: BookingDeclinedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Update regarding your booking request</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Link href={baseUrl} style={logoLink}>
              <span style={logoText}>lctnships</span>
            </Link>
            <Text style={headerLabel}>Notifications</Text>
          </Section>

          {/* Icon & Heading */}
          <Section style={{ textAlign: "center" as const, padding: "48px 32px 24px" }}>
            <div style={iconCircle}>
              <Text style={{ margin: "0", fontSize: "28px" }}>📅</Text>
            </div>
            <Heading style={h1}>Update regarding your booking</Heading>
          </Section>

          {/* Intro Text */}
          <Section style={{ padding: "0 32px 24px" }}>
            <Text style={bodyText}>
              Hi {userName}, thanks for your interest in the studio.
              Unfortunately, the host is unable to accommodate your request for
              the selected dates.
            </Text>
          </Section>

          {/* Host Message Card */}
          <Section style={{ padding: "0 32px 16px" }}>
            <Section style={messageCard}>
              <Section style={messageHeader}>
                <Img
                  src={hostAvatar}
                  width="48"
                  height="48"
                  alt={hostName}
                  style={avatarStyle}
                />
                <div>
                  <Text style={hostNameStyle}>{hostName}</Text>
                  <Text style={messageMeta}>Message from the host</Text>
                </div>
              </Section>
              <Text style={messageText}>&ldquo;{hostMessage}&rdquo;</Text>
            </Section>
          </Section>

          {/* Pivot */}
          <Section style={{ padding: "32px 32px 8px" }}>
            <Heading as="h2" style={pivotHeading}>
              Don&apos;t worry, there are plenty of other creative spaces ready for
              your project.
            </Heading>
          </Section>

          {/* CTA */}
          <Section style={{ textAlign: "center" as const, padding: "0 32px 32px" }}>
            <Button style={primaryButton} href={`${baseUrl}/studios`}>
              Find another studio
            </Button>
            <Text style={ctaSubtext}>Browsing is always free</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this because you have an active account on
              lctnships.
              <br />
              If you no longer wish to receive booking updates, you can{" "}
              <Link href={`${baseUrl}/notifications`} style={footerLink}>
                manage your notifications
              </Link>
              .
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} LCNTSHIPS CREATIVE INC.
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
  border: "1px solid #e5e5e5",
}

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "24px 32px",
  borderBottom: "1px solid #f0f0f0",
}

const logoLink = { textDecoration: "none", color: "#30bae8" }
const logoText = { fontSize: "20px", fontWeight: "700", color: "#0e181b" }
const headerLabel = { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "2px", margin: "0" }

const iconCircle = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  backgroundColor: "rgba(48, 186, 232, 0.1)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "16px",
}

const h1 = { fontSize: "28px", fontWeight: "700", color: "#0e181b", lineHeight: "1.2", margin: "0", textAlign: "center" as const }

const bodyText = {
  fontSize: "16px",
  color: "#64748b",
  lineHeight: "1.6",
  textAlign: "center" as const,
  maxWidth: "420px",
  margin: "0 auto",
}

const messageCard = {
  backgroundColor: "#f6f7f8",
  borderRadius: "12px",
  padding: "24px",
  border: "1px solid #e5e5e5",
}

const messageHeader = { display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }
const avatarStyle = { width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" as const }
const hostNameStyle = { fontSize: "14px", fontWeight: "700", color: "#0e181b", margin: "0" }
const messageMeta = { fontSize: "12px", color: "#94a3b8", margin: "0" }
const messageText = { fontSize: "16px", color: "#334155", fontStyle: "italic", lineHeight: "1.6", margin: "0" }

const pivotHeading = { fontSize: "18px", fontWeight: "700", color: "#0e181b", textAlign: "center" as const, margin: "0" }

const primaryButton = {
  backgroundColor: "#30bae8",
  color: "#0e181b",
  fontSize: "16px",
  fontWeight: "700",
  padding: "16px 32px",
  borderRadius: "8px",
  textDecoration: "none",
  display: "block",
  width: "280px",
  maxWidth: "100%",
  textAlign: "center" as const,
  margin: "0 auto",
}

const ctaSubtext = { fontSize: "14px", color: "#94a3b8", margin: "12px 0 0", textAlign: "center" as const }

const footer = {
  backgroundColor: "#f6f7f8",
  padding: "32px",
  borderTop: "1px solid #f0f0f0",
  textAlign: "center" as const,
}

const footerText = { fontSize: "12px", color: "#94a3b8", lineHeight: "1.6", margin: "0 0 16px" }
const footerLink = { color: "#30bae8", textDecoration: "underline" }
const footerCopyright = { fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "2px", fontWeight: "700", margin: "0" }
