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

interface ReviewRequestEmailProps {
  studioName?: string
  studioImage?: string
  sessionDate?: string
  baseUrl?: string
}

export default function ReviewRequestEmail({
  studioName = "Loft 42",
  studioImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuB1nc2TNQMxDrm2sa-jmxBeLQOqJYHYDQgmDKwxqHKiPiX7Bck70VJSjtwPNJNR-8hEqcW4esAYzX0A9VdoqzoxmzZKUZaRIHqVJRiZgyvqLP23lLzIQ3PL8FYoOlQe9_txe8TCJGdGV5Xcr5ATaOChUtVivhRNEYUOj4H4kPuqJQJ0PPcA4zG_Vbhh7DROKS16E_05LQrcgSMdXkWpRFzfJuntniE6Q_IDhgmG7jVllhkuBn-B2oX920c3ZXuGqZvUsoZ8ei35ua8",
  sessionDate = "Yesterday, 10:00 AM — 4:00 PM",
  baseUrl = "https://lcntships.com",
}: ReviewRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>How was your shoot at {studioName}?</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Link href={baseUrl} style={logoLink}>
              <span style={logoText}>lcntships</span>
            </Link>
          </Section>

          {/* Studio Image */}
          <Section style={{ padding: "0 24px" }}>
            <Img
              src={studioImage}
              width="552"
              height="280"
              alt={studioName}
              style={heroImage}
            />
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>
              How was your shoot at {studioName}?
            </Heading>
            <Text style={sessionDateText}>{sessionDate}</Text>
            <Text style={bodyText}>
              We hope your session was productive. Your feedback helps our
              creative community grow and ensures our studios maintain the
              highest standards for every artist.
            </Text>
          </Section>

          {/* Rating Section */}
          <Section style={ratingSection}>
            <Text style={ratingLabel}>RATE YOUR EXPERIENCE</Text>
            <Text style={ratingStars}>★ ★ ★ ★ ★</Text>
            <Text style={ratingHint}>Tap a star to submit instantly</Text>
          </Section>

          {/* Share CTA */}
          <Section style={shareSection}>
            <Heading as="h3" style={shareHeading}>
              Show us what you created
            </Heading>
            <Text style={shareText}>
              Your work inspires others. Upload your favorites from the session
              to the Inspiration Board to be featured in our monthly digest.
            </Text>
            <Button style={primaryButton} href={`${baseUrl}/inspiration`}>
              Share Your Work
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this because you booked a session through
              lcntships.
            </Text>
            <Text style={footerLinks}>
              <Link href={`${baseUrl}/unsubscribe`} style={footerLink}>Unsubscribe</Link>
              {" • "}
              <Link href={`${baseUrl}/privacy`} style={footerLink}>Privacy Policy</Link>
              {" • "}
              <Link href={`${baseUrl}/support`} style={footerLink}>Support Center</Link>
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
  fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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

const heroImage = {
  width: "100%",
  borderRadius: "12px",
  objectFit: "cover" as const,
  display: "block",
}

const content = {
  padding: "32px 32px 16px",
  textAlign: "center" as const,
}

const h1 = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#0e181b",
  margin: "0 0 8px",
  lineHeight: "1.2",
}

const sessionDateText = {
  fontSize: "14px",
  color: "#4e8597",
  margin: "0 0 24px",
}

const bodyText = {
  fontSize: "16px",
  color: "#4e8597",
  lineHeight: "1.6",
  margin: "0",
  maxWidth: "480px",
  marginLeft: "auto",
  marginRight: "auto",
}

const ratingSection = {
  textAlign: "center" as const,
  padding: "24px",
  margin: "16px 32px 32px",
  backgroundColor: "#f6f7f8",
  borderRadius: "12px",
  border: "1px solid #e7f0f3",
}

const ratingLabel = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#30bae8",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  margin: "0 0 16px",
}

const ratingStars = {
  fontSize: "36px",
  color: "#30bae8",
  margin: "0 0 12px",
  letterSpacing: "12px",
}

const ratingHint = { fontSize: "12px", color: "#4e8597", margin: "0" }

const shareSection = {
  textAlign: "center" as const,
  padding: "0 32px 40px",
  borderTop: "1px solid #e7f0f3",
  marginTop: "0",
  paddingTop: "32px",
}

const shareHeading = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#0e181b",
  margin: "0 0 12px",
}

const shareText = {
  fontSize: "14px",
  color: "#4e8597",
  lineHeight: "1.6",
  margin: "0 0 24px",
}

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

const footer = {
  padding: "32px",
  borderTop: "1px dashed #e7f0f3",
  margin: "0 32px",
  textAlign: "center" as const,
}

const footerText = { fontSize: "14px", color: "#4e8597", margin: "0 0 12px", lineHeight: "1.6" }
const footerLinks = { fontSize: "12px", color: "#4e8597", margin: "0 0 16px" }
const footerLink = { color: "#30bae8", textDecoration: "none" as const }

const copyright = {
  fontSize: "10px",
  color: "#4e8597",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  opacity: 0.5,
  marginTop: "16px",
}
