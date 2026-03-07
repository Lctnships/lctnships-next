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

interface HostPayoutEmailProps {
  hostName?: string
  payoutAmount?: string
  periodStart?: string
  periodEnd?: string
  totalBookings?: string
  grossEarnings?: string
  serviceFee?: string
  netPayout?: string
  paymentMethod?: string
  estimatedArrival?: string
  baseUrl?: string
}

export default function HostPayoutEmail({
  hostName = "Jordan",
  payoutAmount = "$1,360.00",
  periodStart = "October 1",
  periodEnd = "October 31",
  totalBookings = "8",
  grossEarnings = "$1,600.00",
  serviceFee = "$240.00",
  netPayout = "$1,360.00",
  paymentMethod = "Bank account ending in 4242",
  estimatedArrival = "November 3, 2023",
  baseUrl = "https://lcntships.com",
}: HostPayoutEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Your payout of {payoutAmount} has been processed
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Link href={baseUrl} style={logoLink}>
              <span style={logoText}>lcntships</span>
            </Link>
          </Section>

          {/* Content */}
          <Section style={content}>
            <div style={moneyIcon}>
              <Text style={{ margin: "0", fontSize: "32px" }}>💰</Text>
            </div>

            <Heading style={h1}>Payout processed!</Heading>

            <Text style={bodyText}>
              Hey {hostName}, your earnings for {periodStart} – {periodEnd} have
              been sent to your account.
            </Text>

            {/* Payout Amount */}
            <Section style={amountCard}>
              <Text style={amountLabel}>TOTAL PAYOUT</Text>
              <Text style={amountValue}>{payoutAmount}</Text>
              <Text style={amountMeta}>
                {totalBookings} completed bookings
              </Text>
            </Section>

            {/* Earnings Breakdown */}
            <Section style={breakdownCard}>
              <Text style={breakdownTitle}>EARNINGS BREAKDOWN</Text>
              <Section style={breakdownRow}>
                <Text style={breakdownLabel}>Gross earnings</Text>
                <Text style={breakdownValue}>{grossEarnings}</Text>
              </Section>
              <Section style={breakdownRow}>
                <Text style={breakdownLabel}>Service fee (15%)</Text>
                <Text style={breakdownValue}>-{serviceFee}</Text>
              </Section>
              <Section style={divider} />
              <Section style={breakdownRow}>
                <Text style={breakdownTotalLabel}>Net payout</Text>
                <Text style={breakdownTotalValue}>{netPayout}</Text>
              </Section>
            </Section>

            {/* Payment Info */}
            <Section style={paymentCard}>
              <Text style={paymentLabel}>PAYMENT DETAILS</Text>
              <Text style={paymentText}>💳 {paymentMethod}</Text>
              <Text style={paymentText}>
                📅 Estimated arrival: {estimatedArrival}
              </Text>
            </Section>

            {/* CTA */}
            <Section style={{ textAlign: "center" as const }}>
              <Button
                style={primaryButton}
                href={`${baseUrl}/host/earnings`}
              >
                View Earnings Dashboard
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this because you have payouts enabled on
              lcntships.
            </Text>
            <Text style={footerLinks}>
              <Link href={`${baseUrl}/host/payouts`} style={footerLink}>
                Payout Settings
              </Link>
              {" • "}
              <Link href={`${baseUrl}/support`} style={footerLink}>
                Contact Support
              </Link>
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

const moneyIcon = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  backgroundColor: "rgba(34,197,94,0.1)",
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

const amountCard = {
  padding: "32px",
  backgroundColor: "rgba(48,186,232,0.05)",
  borderRadius: "12px",
  border: "1px solid rgba(48,186,232,0.1)",
  marginBottom: "16px",
}

const amountLabel = {
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "2px",
  color: "#30bae8",
  margin: "0 0 8px",
}

const amountValue = {
  fontSize: "40px",
  fontWeight: "900",
  color: "#0e181b",
  margin: "0",
}

const amountMeta = {
  fontSize: "14px",
  color: "#4e8597",
  margin: "8px 0 0",
}

const breakdownCard = {
  padding: "24px",
  backgroundColor: "#f6f7f8",
  borderRadius: "12px",
  border: "1px solid #e7f0f3",
  textAlign: "left" as const,
  marginBottom: "16px",
}

const breakdownTitle = {
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "2px",
  color: "#30bae8",
  margin: "0 0 16px",
}

const breakdownRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "8px",
}

const breakdownLabel = {
  fontSize: "14px",
  color: "#4e8597",
  margin: "0",
}

const breakdownValue = {
  fontSize: "14px",
  color: "#4e8597",
  margin: "0",
  fontWeight: "500",
}

const divider = {
  height: "1px",
  backgroundColor: "#e7f0f3",
  margin: "8px 0",
}

const breakdownTotalLabel = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#0e181b",
  margin: "0",
}

const breakdownTotalValue = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#30bae8",
  margin: "0",
}

const paymentCard = {
  padding: "20px 24px",
  backgroundColor: "#f6f7f8",
  borderRadius: "12px",
  border: "1px solid #e7f0f3",
  textAlign: "left" as const,
  marginBottom: "32px",
}

const paymentLabel = {
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1px",
  color: "#4e8597",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
}

const paymentText = {
  fontSize: "14px",
  color: "#4e8597",
  fontWeight: "500",
  margin: "0 0 4px",
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
  margin: "0 0 8px",
}

const footerLinks = { fontSize: "12px", color: "#4e8597", margin: "0 0 16px" }
const footerLink = { color: "#30bae8", textDecoration: "none", fontWeight: "600" }

const copyright = {
  fontSize: "10px",
  color: "#4e8597",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  opacity: 0.5,
  marginTop: "16px",
}
