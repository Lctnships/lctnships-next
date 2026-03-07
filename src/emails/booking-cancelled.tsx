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

interface BookingCancelledEmailProps {
  studioName?: string
  studioImage?: string
  dateTime?: string
  location?: string
  refundAmount?: string
  refundPercentage?: string
  paymentMethod?: string
  cancellationPolicy?: string
  baseUrl?: string
}

export default function BookingCancelledEmail({
  studioName = "Studio North - Photography Suite",
  studioImage: _studioImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuAlAhhMjYHeGHOyepqqTp3nKpkY2TZE6w7EyFaQ3djJhyzWmAH6Fojyss2IzWDHL_A_NmDwhajwyj8Ai6BQ_uza0-29IqWTTPngNvQwywfYeEk6tohpJJgkp96Zba9oXcDKBUX5OLeHIeD_8rR3SAtPNU1g6V4CUkgpfCivaWE8QBys0zhHjSc2i2o_yYQCwULh_QK1M3sYmal0mpNXoopEl0O7KgCq-MwdbG-lxToOJetGYihUxaDYuUib0hGoNw_ELr7deKG1Euw",
  dateTime = "October 24, 2023 | 2:00 PM - 6:00 PM",
  location = "123 Creative Ave, Arts District",
  refundAmount = "$240.00",
  refundPercentage = "100%",
  paymentMethod = "Visa ending in 4242",
  cancellationPolicy = "Since you cancelled more than 48 hours before the start time, you have been issued a full 100% refund. Please allow 3-5 business days for the funds to appear in your account.",
  baseUrl = "https://lcntships.com",
}: BookingCancelledEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your booking at {studioName} has been cancelled</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Link href={baseUrl} style={logoLink}>
              <span style={logoText}>lcntships</span>
            </Link>
          </Section>

          {/* Hero */}
          <Section style={{ textAlign: "center" as const, padding: "40px 32px 0" }}>
            <div style={cancelIcon}>
              <Text style={{ margin: "0", fontSize: "32px" }}>✕</Text>
            </div>
            <Heading style={h1}>Your booking has been cancelled</Heading>
            <Text style={bodyText}>
              We&apos;re sorry to see your plans change. Your booking for the
              creative studio has been successfully cancelled and your refund is
              being processed.
            </Text>
          </Section>

          {/* Booking Card */}
          <Section style={{ padding: "0 32px 32px" }}>
            <Section style={bookingCard}>
              <Text style={bookingLabel}>BOOKING DETAILS</Text>
              <Text style={bookingStudio}>{studioName}</Text>
              <Text style={bookingDetail}>📅 {dateTime}</Text>
              <Text style={bookingDetail}>📍 {location}</Text>
            </Section>
          </Section>

          {/* Refund Details */}
          <Section style={{ padding: "0 32px 24px" }}>
            <Heading as="h3" style={refundHeading}>
              Refund Summary
            </Heading>
            <Section style={refundGrid}>
              <Section style={refundAmountCard}>
                <Text style={refundLabel}>REFUND AMOUNT</Text>
                <Text style={refundValue}>{refundAmount}</Text>
                <Text style={refundMeta}>
                  {refundPercentage} of original payment
                </Text>
              </Section>
              <Section style={refundStatusCard}>
                <Text style={refundLabel}>STATUS</Text>
                <Text style={refundStatusValue}>✓ Processed</Text>
                <Text style={refundMeta}>
                  Refunded to {paymentMethod}
                </Text>
              </Section>
            </Section>

            {/* Policy */}
            <Section style={policyCard}>
              <Text style={policyTitle}>
                ℹ Policy: Flexible Cancellation
              </Text>
              <Text style={policyText}>{cancellationPolicy}</Text>
            </Section>
          </Section>

          {/* CTA */}
          <Section style={{ textAlign: "center" as const, padding: "0 32px 40px" }}>
            <Button style={primaryButton} href={`${baseUrl}/studios`}>
              Book a new session
            </Button>
            <Link href={`${baseUrl}/cancellation`} style={policyLink}>
              View our cancellation policy
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You are receiving this email because you made a booking on
              lcntships.com.
            </Text>
            <Text style={footerLinks}>
              <Link href={`${baseUrl}/privacy`} style={footerLink}>Privacy Policy</Link>
              {"  "}
              <Link href={`${baseUrl}/terms`} style={footerLink}>Terms of Service</Link>
              {"  "}
              <Link href={`${baseUrl}/notifications`} style={footerLink}>Manage Preferences</Link>
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
  border: "1px solid #e5e5e5",
}

const header = { padding: "24px 32px", borderBottom: "1px solid rgba(48,186,232,0.1)" }
const logoLink = { textDecoration: "none", color: "#0e181b" }
const logoText = { fontSize: "18px", fontWeight: "700" }

const cancelIcon = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  backgroundColor: "#fef2f2",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "16px",
  color: "#ef4444",
}

const h1 = { fontSize: "32px", fontWeight: "800", color: "#0e181b", margin: "0 0 12px" }

const bodyText = {
  fontSize: "16px",
  color: "#4e8597",
  lineHeight: "1.6",
  margin: "0",
  maxWidth: "480px",
  marginLeft: "auto",
  marginRight: "auto",
}

const bookingCard = {
  padding: "24px",
  border: "1px solid rgba(48,186,232,0.1)",
  borderRadius: "16px",
  borderLeft: "4px solid #30bae8",
}

const bookingLabel = { fontSize: "11px", fontWeight: "700", letterSpacing: "2px", color: "#30bae8", margin: "0 0 8px" }
const bookingStudio = { fontSize: "20px", fontWeight: "700", color: "#0e181b", margin: "0 0 8px" }
const bookingDetail = { fontSize: "14px", color: "#4e8597", fontWeight: "500", margin: "0 0 4px" }

const refundHeading = { fontSize: "18px", fontWeight: "700", color: "#0e181b", margin: "0 0 16px" }

const refundGrid = { marginBottom: "24px" }

const refundAmountCard = {
  padding: "24px",
  backgroundColor: "rgba(48,186,232,0.05)",
  borderRadius: "16px",
  border: "1px solid rgba(48,186,232,0.1)",
  marginBottom: "16px",
}

const refundStatusCard = {
  padding: "24px",
  backgroundColor: "#f8f9fa",
  borderRadius: "16px",
  border: "1px solid #f0f0f0",
  marginBottom: "16px",
}

const refundLabel = { fontSize: "12px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" as const, color: "#4e8597", margin: "0 0 4px" }
const refundValue = { fontSize: "28px", fontWeight: "900", color: "#30bae8", margin: "0" }
const refundStatusValue = { fontSize: "20px", fontWeight: "700", color: "#0e181b", margin: "4px 0" }
const refundMeta = { fontSize: "12px", color: "#4e8597", fontStyle: "italic", fontWeight: "500", margin: "8px 0 0" }

const policyCard = {
  padding: "20px",
  border: "1px dashed #e5e5e5",
  borderRadius: "16px",
}

const policyTitle = { fontSize: "14px", fontWeight: "700", color: "#0e181b", margin: "0 0 4px" }
const policyText = { fontSize: "14px", color: "#4e8597", lineHeight: "1.6", margin: "0" }

const primaryButton = {
  backgroundColor: "#30bae8",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  padding: "16px 32px",
  borderRadius: "999px",
  textDecoration: "none",
  display: "inline-block",
  width: "100%",
  textAlign: "center" as const,
}

const policyLink = {
  display: "block",
  color: "#4e8597",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "underline",
  marginTop: "16px",
  textAlign: "center" as const,
}

const footer = { padding: "32px", textAlign: "center" as const, borderTop: "1px solid #f0f0f0" }
const footerText = { fontSize: "12px", color: "#4e8597", lineHeight: "1.6", margin: "0 0 16px" }
const footerLinks = { fontSize: "12px", margin: "0" }
const footerLink = { color: "#30bae8", fontWeight: "700", textDecoration: "none" }
