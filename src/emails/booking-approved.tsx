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

interface BookingApprovedEmailProps {
  studioName?: string
  studioImage?: string
  location?: string
  dateTime?: string
  totalCost?: string
  hostName?: string
  hostAvatar?: string
  hostMessage?: string
  baseUrl?: string
}

export default function BookingApprovedEmail({
  studioName = "Creative Studio A",
  studioImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuCMJV5XLqeTOxxp1lls9F2LZMPbeTP4WEggw9cPJHbFMQI-XnEtKzQzw4Ru5qC8fCi54zJj-EjjNhv-XHg6v4A-SHb0vFhsQJkq2cd4zQo0egidANQyo1vL8mxGPagG3p2Dh1vcsqZ-PPxDd0GBDQgo8KUm6wL4EzJx2CoGZDBdxCGnZk5J4KHxrooA9yQ2LlQtncCiBiCqY7rSsa5RQMxJp6rMV2snhaMaJZB0M0q2Xojrrmbfo6jiU7Tgj2_e0yQclTgIySGXZkM",
  location = "Manhattan, New York, NY",
  dateTime = "Oct 24, 2023 | 10:00 AM - 4:00 PM",
  totalCost = "$320.00",
  hostName = "Alex Host",
  hostAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuCxLmp320Qu1TH6Jmbn5N3Jd6oGo86un0O26F9vKo3KeYol4SZEG7Hzy-dd2xN5ktY1VTk0Jxcowpj4RUu4oH7B6_0tYju3i_Qj-nPKvtGccm_iYp6LbnjZyCe5WnMW8Wm4ocNvDK9_sk0FwxoWse2oWuuxTsoIQ7CK-XJ3LRp-99NBoKcChZFJKSHQF0kM2WJIuICQcjjk3GaoxXMK85Haw1i78T4-BP3lxd_4xWlydYzGk9SQ7LqamsxQKMhj97AxGujJzUKQyX4",
  hostMessage = "Can't wait to see what you create! The studio will be prepped with the lighting setup you requested. Let me know if you have any questions before you arrive.",
  baseUrl = "https://lctnships.com",
}: BookingApprovedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Great news! Your booking at {studioName} was approved</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Link href={baseUrl} style={logoLink}>
              <span style={logoText}>lctnships</span>
            </Link>
          </Section>

          {/* Headline */}
          <Section style={{ textAlign: "center" as const, padding: "32px 32px 16px" }}>
            <div style={checkIcon}>
              <Text style={{ margin: "0", fontSize: "28px" }}>✓</Text>
            </div>
            <Heading style={h1}>Great news! Your request was approved</Heading>
            <Text style={bodyText}>
              Your creative session at {studioName} is now confirmed.
            </Text>
          </Section>

          {/* Studio Card */}
          <Section style={{ padding: "0 24px 24px" }}>
            <Img
              src={studioImage}
              width="552"
              height="280"
              alt={studioName}
              style={studioImg}
            />
            <Section style={studioDetails}>
              <Text style={studioNameStyle}>{studioName}</Text>
              <Text style={detailText}>📍 {location}</Text>
              <Text style={detailText}>📅 {dateTime}</Text>
              <Section style={priceDivider} />
              <Section style={priceRow}>
                <div>
                  <Text style={priceLabel}>Total Cost</Text>
                  <Text style={priceValue}>{totalCost}</Text>
                </div>
                <Button style={payButton} href={`${baseUrl}/bookings`}>
                  Complete Payment
                </Button>
              </Section>
            </Section>
          </Section>

          {/* Host Message */}
          <Section style={{ padding: "0 24px 24px" }}>
            <Text style={sectionTitle}>A message from your host</Text>
            <Section style={messageCard}>
              <Img
                src={hostAvatar}
                width="48"
                height="48"
                alt={hostName}
                style={hostAvatarStyle}
              />
              <div>
                <Text style={hostNameStyle}>{hostName}</Text>
                <Text style={messageText}>&ldquo;{hostMessage}&rdquo;</Text>
              </div>
            </Section>
          </Section>

          {/* What happens next */}
          <Section style={infoSection}>
            <Text style={infoTitle}>What happens next?</Text>
            <Text style={infoText}>
              Please click the &ldquo;Complete Payment&rdquo; button above to finalize your
              booking. Your reservation is held for 24 hours. After payment,
              you&apos;ll receive the access codes and check-in instructions.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} lctnships Inc. All rights reserved.
            </Text>
            <Text style={footerLinks}>
              <Link href={`${baseUrl}/notifications`} style={footerLink}>Manage Notifications</Link>
              {" • "}
              <Link href={`${baseUrl}/privacy`} style={footerLink}>Privacy Policy</Link>
              {" • "}
              <Link href={`${baseUrl}/support`} style={footerLink}>Support</Link>
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
  border: "1px solid #e8f0f3",
}

const header = { padding: "24px 32px", borderBottom: "1px solid #e8f0f3" }
const logoLink = { textDecoration: "none", color: "#0e171b" }
const logoText = { fontSize: "18px", fontWeight: "700" }

const checkIcon = {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  backgroundColor: "rgba(32, 175, 223, 0.2)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "16px",
  color: "#20afdf",
}

const h1 = { fontSize: "28px", fontWeight: "700", color: "#0e171b", margin: "0 0 8px" }
const bodyText = { fontSize: "16px", color: "#508495", margin: "0" }

const studioImg = { width: "100%", borderRadius: "12px 12px 0 0", objectFit: "cover" as const }

const studioDetails = {
  padding: "20px",
  backgroundColor: "#f6f7f8",
  borderRadius: "0 0 12px 12px",
  border: "1px solid #e8f0f3",
  borderTop: "none",
}

const studioNameStyle = { fontSize: "20px", fontWeight: "700", color: "#0e171b", margin: "0 0 8px" }
const detailText = { fontSize: "14px", color: "#508495", margin: "0 0 4px" }

const priceDivider = { borderTop: "1px dashed #e8f0f3", marginTop: "24px", paddingTop: "16px" }

const priceRow = { display: "flex", justifyContent: "space-between", alignItems: "center" }

const priceLabel = { fontSize: "12px", textTransform: "uppercase" as const, letterSpacing: "1px", color: "#508495", fontWeight: "600", margin: "0" }
const priceValue = { fontSize: "20px", fontWeight: "700", color: "#20afdf", margin: "4px 0 0" }

const payButton = {
  backgroundColor: "#20afdf",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "700",
  padding: "10px 24px",
  borderRadius: "8px",
  textDecoration: "none",
}

const sectionTitle = { fontSize: "16px", fontWeight: "700", color: "#0e171b", margin: "0 0 12px" }

const messageCard = {
  display: "flex",
  gap: "12px",
  padding: "16px",
  backgroundColor: "rgba(32, 175, 223, 0.05)",
  borderRadius: "12px",
}

const hostAvatarStyle = { width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" as const }
const hostNameStyle = { fontSize: "13px", fontWeight: "700", color: "#508495", margin: "0 0 4px" }
const messageText = { fontSize: "14px", color: "#0e171b", fontStyle: "italic", lineHeight: "1.6", margin: "0" }

const infoSection = { padding: "24px 32px", backgroundColor: "#f6f7f8" }
const infoTitle = { fontSize: "14px", fontWeight: "700", color: "#0e171b", margin: "0 0 4px" }
const infoText = { fontSize: "14px", color: "#508495", lineHeight: "1.6", margin: "0" }

const footer = { padding: "32px", textAlign: "center" as const, borderTop: "1px solid #e8f0f3" }
const footerCopyright = { fontSize: "12px", color: "#508495", margin: "0 0 8px" }
const footerLinks = { fontSize: "11px", color: "#508495", margin: "0" }
const footerLink = { color: "#20afdf", textDecoration: "none" }
