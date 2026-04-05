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

interface HostNewReviewEmailProps {
  renterName?: string
  renterAvatar?: string
  studioName?: string
  rating?: number
  reviewText?: string
  baseUrl?: string
}

export default function HostNewReviewEmail({
  renterName = "Maya Chen",
  renterAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuCp1DzLwrm-3wfiUqpNTH2aDqZR_RZ92sd13dknKecSQvInCOOdVSClLYDkdI6eco877EkpCpvuJzFy23KixiUWhwzLqB2-McLCyB0bk31kbDuPxUVgDv7VqbEHHtcBv07-Ak4rHf9RKGPKCOGT6kANEC40nlBCCpOxXMECdCp5ZQfDnaBmq5C2YQuxk8Imp5XBdRNGUuYymsur82P3p_EzUJKoT_AN2KrxbQ3fv4PCFWLXXadG9fr4_5SVLaTOrZt4i-pU84jI-fQ",
  studioName = "The Industrial Loft Studio",
  rating = 5,
  reviewText = "Absolutely incredible space! The natural light was perfect for our fashion shoot, and the host was super accommodating. The equipment was top-notch and the vibe was exactly what we needed. Will definitely be back!",
  baseUrl = "https://lctnships.com",
}: HostNewReviewEmailProps) {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating)

  return (
    <Html>
      <Head />
      <Preview>
        {`${renterName} left a ${rating}-star review for ${studioName}`}
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
            <div style={starIcon}>
              <Text style={{ margin: "0", fontSize: "32px" }}>⭐</Text>
            </div>

            <Heading style={h1}>You got a new review!</Heading>

            <Text style={bodyText}>
              {renterName} left a review for{" "}
              <span style={{ fontWeight: "700", color: "#0e181b" }}>
                {studioName}
              </span>
              . Great reviews help attract more bookings!
            </Text>

            {/* Review Card */}
            <Section style={reviewCard}>
              <Section style={reviewerRow}>
                <Img
                  src={renterAvatar}
                  width="44"
                  height="44"
                  alt={renterName}
                  style={avatarStyle}
                />
                <div>
                  <Text style={reviewerName}>{renterName}</Text>
                  <Text style={starsText}>{stars}</Text>
                </div>
              </Section>
              <Text style={reviewTextStyle}>&ldquo;{reviewText}&rdquo;</Text>
            </Section>

            {/* CTA */}
            <Section style={{ textAlign: "center" as const }}>
              <Button
                style={primaryButton}
                href={`${baseUrl}/host/reviews`}
              >
                View All Reviews
              </Button>
            </Section>

            <Section style={{ textAlign: "center" as const }}>
              <Link href={`${baseUrl}/host/studio`} style={secondaryLink}>
                Update Your Listing
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this because someone reviewed your studio on
              lctnships.
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

const starIcon = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  backgroundColor: "rgba(250,204,21,0.1)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "24px",
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

const reviewCard = {
  padding: "24px",
  backgroundColor: "#f6f7f8",
  borderRadius: "12px",
  border: "1px solid #e7f0f3",
  textAlign: "left" as const,
  marginBottom: "32px",
}

const reviewerRow = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "16px",
}

const avatarStyle = {
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  objectFit: "cover" as const,
}

const reviewerName = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#0e181b",
  margin: "0",
}

const starsText = {
  fontSize: "18px",
  color: "#facc15",
  margin: "2px 0 0",
  letterSpacing: "2px",
}

const reviewTextStyle = {
  fontSize: "15px",
  color: "#4e8597",
  lineHeight: "1.7",
  margin: "0",
  fontStyle: "italic",
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
