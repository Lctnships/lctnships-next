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

interface HostWelcomeEmailProps {
  hostName?: string
  studioName?: string
  studioUrl?: string
  baseUrl?: string
}

export default function HostWelcomeEmail({
  hostName = "Jordan",
  studioName = "The Industrial Loft Studio",
  studioUrl = "https://lctnships.com/studios/the-industrial-loft",
  baseUrl = "https://lctnships.com",
}: HostWelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your studio {studioName} is now live on lctnships!</Preview>
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
            <div style={checkIcon}>
              <Text style={{ margin: "0", fontSize: "32px" }}>✓</Text>
            </div>

            <Heading style={h1}>Your studio is live!</Heading>

            <Text style={bodyText}>
              Congratulations {hostName}, your listing for{" "}
              <span style={{ fontWeight: "700", color: "#0e181b" }}>
                {studioName}
              </span>{" "}
              is now published and visible to thousands of creatives on
              lctnships.
            </Text>

            {/* Steps */}
            <Section style={stepsSection}>
              <Text style={stepsTitle}>WHAT HAPPENS NEXT</Text>

              <Section style={stepCard}>
                <Text style={stepNumber}>1</Text>
                <div>
                  <Text style={stepHeading}>Set your availability</Text>
                  <Text style={stepDesc}>
                    Block out dates you&apos;re unavailable and set your preferred
                    booking hours.
                  </Text>
                </div>
              </Section>

              <Section style={stepCard}>
                <Text style={stepNumber}>2</Text>
                <div>
                  <Text style={stepHeading}>Respond to inquiries</Text>
                  <Text style={stepDesc}>
                    Quick responses lead to more bookings. Aim to reply within a
                    few hours.
                  </Text>
                </div>
              </Section>

              <Section style={stepCard}>
                <Text style={stepNumber}>3</Text>
                <div>
                  <Text style={stepHeading}>Get paid</Text>
                  <Text style={stepDesc}>
                    Earnings are deposited directly to your account after each
                    completed session.
                  </Text>
                </div>
              </Section>
            </Section>

            {/* CTA */}
            <Section style={{ textAlign: "center" as const }}>
              <Button style={primaryButton} href={studioUrl}>
                View Your Listing
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Need help getting started? Visit our{" "}
              <Link href={`${baseUrl}/host-guide`} style={footerLink}>
                Host Guide
              </Link>{" "}
              or{" "}
              <Link href={`${baseUrl}/support`} style={footerLink}>
                contact support
              </Link>
              .
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

const checkIcon = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  backgroundColor: "rgba(34,197,94,0.1)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "24px",
  color: "#22c55e",
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

const stepsSection = {
  textAlign: "left" as const,
  maxWidth: "480px",
  margin: "0 auto 32px",
}

const stepsTitle = {
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "2px",
  color: "#30bae8",
  margin: "0 0 16px",
  textAlign: "center" as const,
}

const stepCard = {
  padding: "16px 20px",
  backgroundColor: "#f6f7f8",
  borderRadius: "12px",
  marginBottom: "12px",
  display: "flex",
  alignItems: "flex-start",
  gap: "16px",
}

const stepNumber = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#ffffff",
  backgroundColor: "#30bae8",
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  textAlign: "center" as const,
  lineHeight: "28px",
  margin: "0",
  flexShrink: "0",
}

const stepHeading = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#0e181b",
  margin: "0 0 4px",
}

const stepDesc = {
  fontSize: "14px",
  color: "#4e8597",
  margin: "0",
  lineHeight: "1.5",
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

const footerLink = {
  color: "#30bae8",
  textDecoration: "underline",
}

const copyright = {
  fontSize: "10px",
  color: "#4e8597",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  opacity: 0.5,
  marginTop: "16px",
}
