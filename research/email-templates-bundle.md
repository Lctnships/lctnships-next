# Lctnships Email Templates — Design Brief

**Project:** Lctnships (creative studio rental marketplace, lijkt op Airbnb voor studios)
**Tech stack:** React Email + Resend, TSX components
**Locatie in repo:** `src/emails/`
**Aantal templates:** 21
**Talen:** primair NL (Nederlands), met EN/ES/FR/DE als secundaire locales
**Brand:** modern, minimalistisch, zwart-wit met accent kleuren

## Doel van dit document

Een visuele en tekstuele redesign van alle email templates. Focus op:
- Consistente typografie en spacing
- Sterke visuele hiërarchie (CTA's prominent)
- Mobiel-first (de meeste users lezen op telefoon)
- Brand-uitstraling die past bij een creatieve studio marketplace
- Dark mode compatibiliteit (waar React Email dat ondersteunt)

## Categorieën

1. **Renter emails** (10) — eindgebruikers die studios boeken
2. **Host emails** (8) — eigenaren die studios verhuren
3. **Marketing emails** (2) — discovery + re-engagement

---


---

## `welcome.tsx`

```tsx
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

interface WelcomeEmailProps {
  userName?: string
  baseUrl?: string
}

export default function WelcomeEmail({
  userName = "there",
  baseUrl = "https://lctnships.com",
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to lctnships — your creative studio journey starts here</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Link href={baseUrl} style={logoLink}>
              <Img
                src={`${baseUrl}/logo.png`}
                width="32"
                height="32"
                alt="lctnships"
              />
              <span style={logoText}>lctnships</span>
            </Link>
            <Text style={headerLabel}>Welcome Email</Text>
          </Section>

          {/* Hero Image */}
          <Section style={{ padding: "24px" }}>
            <Img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlqd5Mv3CRZLjU4vaRW4JiLNIvRbW5SRFJJnRkKr5_5d5e67loXLMkOcNMOou5jKHssLxwBPLZB55RE3KpjxjRahkv9FkLHw7tvzq7Ioumb6OINIlrSv09g9aaPfrBLV1I_2J-49cclS2E58Qpl9aXqPa5S8B7fyH5lzaCexfVQN9z-22YgVXaxof5miSW0smwzPr-boMn1gyNqhkR3hOfEEqmmCaURVfyxM9CN7nke1S5vKMgN9tRzT2bCwQv01OynAjvv1lKO6U"
              width="552"
              height="320"
              alt="Sunlit minimalist creative studio"
              style={heroImage}
            />
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>Welcome to lctnships, {userName}</Heading>
            <Text style={bodyText}>
              We&apos;re thrilled to have you in our community of creators. Your
              journey to finding the perfect space for your next project starts
              here.
            </Text>

            {/* Steps */}
            <Section style={stepsSection}>
              <Heading as="h3" style={stepsHeading}>
                3 steps to get started
              </Heading>

              {/* Step 1 */}
              <Section style={step}>
                <div style={stepIcon}>
                  <Text style={stepIconText}>1</Text>
                </div>
                <div>
                  <Text style={stepTitle}>Explore studios</Text>
                  <Text style={stepDescription}>
                    Browse our curated selection of professional daylight and
                    creative spaces.
                  </Text>
                </div>
              </Section>

              {/* Step 2 */}
              <Section style={step}>
                <div style={stepIcon}>
                  <Text style={stepIconText}>2</Text>
                </div>
                <div>
                  <Text style={stepTitle}>Save favorites</Text>
                  <Text style={stepDescription}>
                    Keep track of the spots that inspire you for your future
                    productions.
                  </Text>
                </div>
              </Section>

              {/* Step 3 */}
              <Section style={step}>
                <div style={stepIcon}>
                  <Text style={stepIconText}>3</Text>
                </div>
                <div>
                  <Text style={stepTitle}>Start your first project</Text>
                  <Text style={stepDescription}>
                    Book your first session instantly and bring your creative
                    vision to life.
                  </Text>
                </div>
              </Section>
            </Section>

            {/* CTA */}
            <Section style={{ textAlign: "center" as const, marginTop: "48px" }}>
              <Button style={primaryButton} href={`${baseUrl}/studios`}>
                Explore Marketplace
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerCompany}>lctnships Creative Rental Inc.</Text>
            <Text style={footerText}>
              You&apos;re receiving this because you signed up for an account.{" "}
              <Link href={`${baseUrl}/unsubscribe`} style={footerLink}>
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f6f8",
  fontFamily:
    "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "24px 32px",
  borderBottom: "1px solid #f0f0f0",
}

const logoLink = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  textDecoration: "none",
  color: "#0f49bd",
}

const logoText = {
  fontSize: "20px",
  fontWeight: "800",
  letterSpacing: "-0.5px",
  color: "#0f49bd",
}

const headerLabel = {
  fontSize: "11px",
  fontWeight: "500",
  color: "#94a3b8",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  margin: "0",
}

const heroImage = {
  width: "100%",
  borderRadius: "12px",
  objectFit: "cover" as const,
}

const content = {
  padding: "0 32px 40px",
}

const h1 = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#0d121b",
  textAlign: "center" as const,
  lineHeight: "1.2",
  padding: "16px 0 8px",
  margin: "0",
}

const bodyText = {
  fontSize: "16px",
  color: "#64748b",
  lineHeight: "1.6",
  textAlign: "center" as const,
  padding: "0 24px 32px",
  margin: "0",
}

const stepsSection = {
  paddingTop: "16px",
}

const stepsHeading = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#0d121b",
  borderBottom: "1px solid #f0f0f0",
  paddingBottom: "12px",
  margin: "0 0 24px",
}

const step = {
  display: "flex",
  alignItems: "flex-start",
  gap: "16px",
  marginBottom: "24px",
}

const stepIcon = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: "rgba(15, 73, 189, 0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
}

const stepIconText = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#0f49bd",
  margin: "0",
}

const stepTitle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#0d121b",
  margin: "0 0 4px",
}

const stepDescription = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0",
  lineHeight: "1.5",
}

const primaryButton = {
  backgroundColor: "#0d121b",
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "700",
  padding: "16px 0",
  borderRadius: "12px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
}

const footer = {
  backgroundColor: "#f8f8fa",
  padding: "32px",
  textAlign: "center" as const,
  borderTop: "1px solid #f0f0f0",
}

const footerCompany = {
  fontSize: "11px",
  fontWeight: "500",
  color: "#94a3b8",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  margin: "0 0 8px",
}

const footerText = {
  fontSize: "11px",
  color: "#64748b",
  lineHeight: "1.6",
  margin: "0",
  maxWidth: "320px",
  marginLeft: "auto",
  marginRight: "auto",
}

const footerLink = {
  color: "#0f49bd",
  textDecoration: "underline",
}
```


---

## `password-reset.tsx`

```tsx
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

interface PasswordResetEmailProps {
  resetLink?: string
  baseUrl?: string
}

export default function PasswordResetEmail({
  resetLink = "https://lctnships.com/reset-password?token=xxx",
  baseUrl = "https://lctnships.com",
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your lctnships password</Preview>
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
            <table
              cellPadding="0"
              cellSpacing="0"
              border={0}
              style={{ margin: "0 auto 24px" }}
            >
              <tr>
                <td
                  align="center"
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(48,186,232,0.1)",
                    textAlign: "center",
                    verticalAlign: "middle",
                    fontSize: "32px",
                  }}
                >
                  🔒
                </td>
              </tr>
            </table>

            <Heading style={h1}>Reset your lctnships password</Heading>

            <Text style={bodyText}>
              Hello, we received a request to reset the password for your
              lctnships account. Click the button below to choose a new one.
            </Text>

            {/* CTA */}
            <Section style={{ textAlign: "center" as const }}>
              <Button style={primaryButton} href={resetLink}>
                Reset Password
              </Button>
            </Section>

            {/* Expiry Warning */}
            <table
              cellPadding="0"
              cellSpacing="0"
              border={0}
              width="100%"
              style={{ maxWidth: "480px", margin: "32px auto 0" }}
            >
              <tr>
                <td style={warningCardTd}>
                  <Text style={warningText}>
                    ⏰ For your security, this link will expire in 2 hours.
                  </Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* Secondary Info */}
          <Section style={secondarySection}>
            <Text style={secondaryText}>
              If you didn&apos;t request this change, you can safely ignore this
              email. Your account is still secure.
            </Text>

            <table
              cellPadding="0"
              cellSpacing="0"
              border={0}
              width="100%"
              style={{ marginTop: "32px" }}
            >
              <tr>
                <td align="center">
                  <Text style={teamName}>The lctnships Team</Text>
                  <Text style={teamSubtext}>
                    Creative Studio Rentals & Management
                  </Text>
                </td>
              </tr>
            </table>

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

const content = {
  padding: "40px 32px",
  textAlign: "center" as const,
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

const warningCardTd = {
  padding: "16px 24px",
  backgroundColor: "#f6f7f8",
  borderRadius: "12px",
  border: "1px solid #e7f0f3",
  textAlign: "center" as const,
}

const warningText = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#4e8597",
  textAlign: "center" as const,
  margin: "0",
}

const secondarySection = {
  padding: "32px",
  borderTop: "1px dashed #e7f0f3",
  margin: "0 32px",
  textAlign: "center" as const,
}

const secondaryText = {
  fontSize: "14px",
  color: "#4e8597",
  lineHeight: "1.6",
  margin: "0",
}

const teamName = { fontSize: "14px", fontWeight: "700", color: "#0e181b", margin: "0 0 4px" }
const teamSubtext = { fontSize: "12px", color: "#4e8597", margin: "0" }

const copyright = {
  fontSize: "10px",
  color: "#4e8597",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  opacity: 0.5,
  marginTop: "32px",
}
```


---

## `booking-pending.tsx`

```tsx
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

interface BookingPendingEmailProps {
  studioName?: string
  studioImage?: string
  date?: string
  time?: string
  location?: string
  totalPrice?: string
  baseUrl?: string
}

export default function BookingPendingEmail({
  studioName = "Creative Loft Studio",
  studioImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuBXDvuPOHtXCfxutXoCmu9KlafWrXTSeiktZcQvBtmGox9WDgCwVo_BwbXkrMB4aw77O-zmvm32PL6WlZTQX1XozMJIUS0dB7beYpKN-CBkKprq-IiJQ_HlXhmU28nAdtYCL7FEEOYjGRqBb8yHgnaRMACFS1PghAjWe8xTr-BZCTQ27zBlI14y0bMhq8r1WDpxjBMx_5q6qfVh21g45KSUcNonjHNsCRBg3V7wGRM46eTEzbIzF4jC_dYlZcR2pvSywU5sBC1w4Ss",
  date = "Oct 24, 2023",
  time = "10:00 AM - 2:00 PM (4h)",
  location = "Brooklyn, NY",
  totalPrice = "$120.00",
  baseUrl = "https://lctnships.com",
}: BookingPendingEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your booking request for {studioName} has been sent</Preview>
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
            {/* Icon & Heading */}
            <Section style={{ textAlign: "center" as const, marginBottom: "24px" }}>
              <div style={iconCircle}>
                <Text style={iconText}>✉</Text>
              </div>
              <Heading style={h1}>Request sent: {studioName}</Heading>
              <Text style={bodyText}>
                Your booking request is on its way. The host usually responds
                within 24 hours to confirm your reservation.
              </Text>
            </Section>

            {/* Progress Bar */}
            <Section style={progressCard}>
              <Section style={progressHeader}>
                <Text style={progressTitle}>Booking Progress</Text>
                <Text style={progressBadge}>STEP 1 OF 3</Text>
              </Section>
              <div style={progressBarBg}>
                <div style={progressBarFill} />
              </div>
              <Text style={progressStatus}>⏳ Pending Host Approval</Text>
            </Section>

            {/* Booking Summary */}
            <Section style={summaryCard}>
              <Text style={summaryLabel}>RESERVATION SUMMARY</Text>
              <Section style={{ display: "flex", gap: "24px" }}>
                <Img
                  src={studioImage}
                  width="180"
                  height="180"
                  alt={studioName}
                  style={summaryImage}
                />
                <div>
                  <Text style={summaryStudioName}>{studioName}</Text>
                  <Text style={summaryDetail}>📅 {date}</Text>
                  <Text style={summaryDetail}>🕐 {time}</Text>
                  <Text style={summaryDetail}>📍 {location}</Text>
                  <Section style={summaryDivider} />
                  <Section style={summaryTotal}>
                    <Text style={summaryTotalLabel}>Total (Pending)</Text>
                    <Text style={summaryTotalValue}>{totalPrice}</Text>
                  </Section>
                </div>
              </Section>
            </Section>

            {/* CTA */}
            <Section style={{ textAlign: "center" as const }}>
              <Button style={primaryButton} href={`${baseUrl}/bookings`}>
                View Booking Details
              </Button>
              <Text style={paymentNote}>
                Your payment method will only be charged once the host accepts
                your request.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerLinks}>
              <Link href={`${baseUrl}/help`} style={footerLink}>Help Center</Link>
              {"  "}
              <Link href={`${baseUrl}/cancellation`} style={footerLink}>Cancellation Policy</Link>
              {"  "}
              <Link href={`${baseUrl}/terms`} style={footerLink}>Terms</Link>
            </Text>
            <Text style={footerText}>
              Questions? Reply to this email or contact support at hello@lctnships.com
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} lctnships, Inc.
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
  border: "1px solid #e7f0f3",
}

const header = {
  padding: "16px 24px",
  borderBottom: "1px solid #e7f0f3",
}

const logoLink = { textDecoration: "none", color: "#0e181b" }
const logoText = { fontSize: "18px", fontWeight: "700" }

const content = { padding: "32px 24px" }

const iconCircle = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  backgroundColor: "rgba(48, 186, 232, 0.2)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "16px",
}

const iconText = { fontSize: "28px", margin: "0" }

const h1 = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#0e181b",
  lineHeight: "1.2",
  margin: "0 0 12px",
  textAlign: "center" as const,
}

const bodyText = {
  fontSize: "16px",
  color: "#4e8597",
  lineHeight: "1.6",
  textAlign: "center" as const,
  margin: "0 0 24px",
  maxWidth: "480px",
  marginLeft: "auto",
  marginRight: "auto",
}

const progressCard = {
  backgroundColor: "#f8fbfc",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "32px",
}

const progressHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
}

const progressTitle = { fontSize: "16px", fontWeight: "600", color: "#0e181b", margin: "0" }

const progressBadge = {
  backgroundColor: "rgba(48, 186, 232, 0.2)",
  color: "#30bae8",
  fontSize: "11px",
  fontWeight: "700",
  padding: "4px 12px",
  borderRadius: "999px",
  margin: "0",
}

const progressBarBg = {
  backgroundColor: "#d0e1e7",
  borderRadius: "999px",
  height: "10px",
  overflow: "hidden" as const,
  marginBottom: "8px",
}

const progressBarFill = {
  backgroundColor: "#30bae8",
  height: "100%",
  borderRadius: "999px",
  width: "33.3%",
}

const progressStatus = {
  fontSize: "14px",
  color: "#4e8597",
  fontWeight: "500",
  margin: "4px 0 0",
}

const summaryCard = {
  padding: "16px",
  border: "1px solid #e7f0f3",
  borderRadius: "12px",
  marginBottom: "32px",
}

const summaryLabel = {
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  color: "#4e8597",
  margin: "0 0 16px",
}

const summaryImage = {
  borderRadius: "8px",
  objectFit: "cover" as const,
  marginBottom: "16px",
  width: "100%",
  maxWidth: "180px",
}

const summaryStudioName = { fontSize: "20px", fontWeight: "700", color: "#0e181b", margin: "0 0 8px" }
const summaryDetail = { fontSize: "14px", color: "#4e8597", fontWeight: "500", margin: "0 0 4px" }

const summaryDivider = {
  borderTop: "1px dashed #e7f0f3",
  marginTop: "16px",
  paddingTop: "16px",
}

const summaryTotal = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}

const summaryTotalLabel = { fontSize: "14px", color: "#4e8597", margin: "0" }
const summaryTotalValue = { fontSize: "18px", fontWeight: "700", color: "#0e181b", margin: "0" }

const primaryButton = {
  backgroundColor: "#30bae8",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  padding: "16px 32px",
  borderRadius: "999px",
  textDecoration: "none",
  display: "inline-block",
  minWidth: "240px",
  textAlign: "center" as const,
}

const paymentNote = {
  fontSize: "12px",
  color: "#4e8597",
  textAlign: "center" as const,
  margin: "16px 0 0",
}

const footer = {
  backgroundColor: "#f8fbfc",
  padding: "32px 24px",
  borderTop: "1px solid #e7f0f3",
  textAlign: "center" as const,
}

const footerLinks = { fontSize: "14px", margin: "0 0 12px" }
const footerLink = { color: "#30bae8", textDecoration: "none" }
const footerText = { fontSize: "12px", color: "#4e8597", margin: "0 0 8px" }
const footerCopyright = { fontSize: "12px", color: "#4e8597", margin: "0" }
```


---

## `booking-approved.tsx`

```tsx
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
```


---

## `booking-confirmed.tsx`

```tsx
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
```


---

## `booking-declined.tsx`

```tsx
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
```


---

## `booking-cancelled.tsx`

```tsx
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
  baseUrl = "https://lctnships.com",
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
              <span style={logoText}>lctnships</span>
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
              lctnships.com.
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
```


---

## `session-reminder.tsx`

```tsx
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

interface SessionReminderEmailProps {
  studioName?: string
  dateTime?: string
  location?: string
  doorCode?: string
  wifiName?: string
  wifiPassword?: string
  baseUrl?: string
}

export default function SessionReminderEmail({
  studioName = "Studio A",
  dateTime = "Tomorrow, Oct 24 • 10:00 AM - 2:00 PM",
  location = "Creative Hub, 123 Arts District, Floor 2",
  doorCode = "8842#",
  wifiName = "StudioA_HighSpeed",
  wifiPassword = "create2024",
  baseUrl = "https://lctnships.com",
}: SessionReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your session at {studioName} is tomorrow!</Preview>
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
            <Heading style={h1}>See you tomorrow!</Heading>
            <Text style={bodyText}>
              Your session at <strong>{studioName}</strong> is just 24 hours
              away. We&apos;re getting everything ready for your creative workflow.
            </Text>

            {/* Booking Summary */}
            <Section style={summaryCard}>
              <Section style={summaryRow}>
                <Text style={summaryLabel}>Date & Time</Text>
                <Text style={summaryValue}>{dateTime}</Text>
              </Section>
              <Section style={summaryRow}>
                <Text style={summaryLabel}>Location</Text>
                <Text style={summaryValue}>{location}</Text>
              </Section>
            </Section>

            {/* Access Instructions */}
            <Heading as="h2" style={sectionHeading}>
              Access Instructions
            </Heading>

            {/* Door Code */}
            <Section style={accessCard}>
              <div>
                <Text style={accessTitle}>🔑 Door Code: {doorCode}</Text>
                <Text style={accessDescription}>
                  Main entrance keypad. Valid 15 mins before booking start.
                </Text>
              </div>
            </Section>

            {/* Wi-Fi */}
            <Section style={accessCard}>
              <div>
                <Text style={accessTitle}>📶 Wi-Fi: {wifiName}</Text>
                <Text style={accessDescription}>
                  Password: {wifiPassword}
                </Text>
              </div>
            </Section>

            {/* Gear Checklist */}
            <Section style={tipCard}>
              <Text style={tipTitle}>✅ Pro Tip: Check your gear</Text>
              <Text style={tipItem}>• Charge all batteries overnight</Text>
              <Text style={tipItem}>
                • Format your SD cards and clear space
              </Text>
              <Text style={tipItem}>
                • Download our equipment list to see what&apos;s included
              </Text>
            </Section>

            {/* CTA */}
            <Section style={{ textAlign: "center" as const }}>
              <Button style={primaryButton} href={`${baseUrl}/bookings`}>
                View Booking Details
              </Button>
              <Link href={`${baseUrl}/bookings`} style={rescheduleLink}>
                Reschedule or Cancel
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this because you have a confirmed booking with
              lctnships.
              <br />
              Need help?{" "}
              <Link href={`${baseUrl}/support`} style={footerLink}>
                Contact Support
              </Link>
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} lctnships Creative Rentals Inc.
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
  maxWidth: "640px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden" as const,
  border: "1px solid #e7f0f3",
}

const header = { padding: "20px 40px", borderBottom: "1px solid #e7f0f3" }
const logoLink = { textDecoration: "none", color: "#0e181b" }
const logoText = { fontSize: "18px", fontWeight: "700" }

const content = { padding: "16px 40px 40px" }

const h1 = { fontSize: "32px", fontWeight: "700", color: "#0e181b", textAlign: "center" as const, margin: "32px 0 8px" }

const bodyText = {
  fontSize: "16px",
  color: "#4e8597",
  lineHeight: "1.6",
  textAlign: "center" as const,
  margin: "0 0 24px",
}

const summaryCard = {
  backgroundColor: "#f8fbfc",
  border: "1px solid #d0e1e7",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "32px",
}

const summaryRow = { marginBottom: "16px" }
const summaryLabel = { fontSize: "14px", color: "#4e8597", margin: "0 0 2px" }
const summaryValue = { fontSize: "16px", fontWeight: "700", color: "#0e181b", margin: "0" }

const sectionHeading = { fontSize: "22px", fontWeight: "700", color: "#0e181b", margin: "0 0 12px" }

const accessCard = {
  padding: "20px",
  border: "1px solid #d0e1e7",
  borderRadius: "12px",
  marginBottom: "16px",
  backgroundColor: "#f8fbfc",
}

const accessTitle = { fontSize: "16px", fontWeight: "700", color: "#0e181b", margin: "0 0 4px" }
const accessDescription = { fontSize: "14px", color: "#4e8597", margin: "0" }

const tipCard = {
  backgroundColor: "rgba(48, 186, 232, 0.1)",
  borderLeft: "4px solid #30bae8",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "32px",
  marginTop: "32px",
}

const tipTitle = { fontSize: "16px", fontWeight: "700", color: "#0e181b", margin: "0 0 8px" }
const tipItem = { fontSize: "14px", color: "#4e8597", margin: "0 0 4px" }

const primaryButton = {
  backgroundColor: "#30bae8",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  padding: "14px 24px",
  borderRadius: "12px",
  textDecoration: "none",
  display: "inline-block",
  minWidth: "240px",
  textAlign: "center" as const,
}

const rescheduleLink = {
  display: "block",
  color: "#30bae8",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  marginTop: "16px",
  textAlign: "center" as const,
}

const footer = {
  backgroundColor: "#f8fbfc",
  padding: "32px 40px",
  borderTop: "1px solid #e7f0f3",
  textAlign: "center" as const,
}

const footerText = { fontSize: "12px", color: "#4e8597", lineHeight: "1.6", margin: "0 0 8px" }
const footerLink = { color: "#30bae8", fontWeight: "700", textDecoration: "none" }
const footerCopyright = { fontSize: "10px", color: "#4e8597", opacity: 0.5, margin: "16px 0 0" }
```


---

## `extension-reminder.tsx`

```tsx
import { ReactElement } from "react"

interface ExtensionReminderEmailProps {
  studioName: string
  renterName: string
  minutesLeft: number
  extendLink: string
}

export function ExtensionReminderEmail({ 
  studioName, 
  renterName, 
  minutesLeft, 
  extendLink 
}: ExtensionReminderEmailProps): ReactElement {
  return (
    <>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "20px" }}>
        Je sessie eindigt binnenkort
      </h1>
      
      <p style={{ fontSize: "16px", color: "#4a4a4a", lineHeight: "1.5", marginBottom: "20px" }}>
        Hallo {renterName},
      </p>
      
      <p style={{ fontSize: "16px", color: "#4a4a4a", lineHeight: "1.5", marginBottom: "20px" }}>
        Je sessie bij <strong>{studioName}</strong> eindigt over <strong>{minutesLeft} minuten</strong>.
      </p>
      
      <p style={{ fontSize: "16px", color: "#4a4a4a", lineHeight: "1.5", marginBottom: "30px" }}>
        Wil je je sessie verlengen? Klik dan op de knop hieronder.
      </p>
      
      <a href={extendLink} style={{ 
        display: "inline-block", 
        backgroundColor: "#1a1a1a", 
        color: "#ffffff", 
        textDecoration: "none", 
        padding: "12px 24px", 
        borderRadius: "4px", 
        fontSize: "16px", 
        fontWeight: "600" 
      }}>
        Verleng sessie
      </a>
      
      <p style={{ fontSize: "14px", color: "#8a8a8a", lineHeight: "1.5", marginTop: "30px" }}>
        Deze e-mail is automatisch verstuurd door Lctnships.
      </p>
    </>
  )
}```


---

## `new-message.tsx`

```tsx
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
```


---

## `review-request.tsx`

```tsx
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
  baseUrl = "https://lctnships.com",
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
              <span style={logoText}>lctnships</span>
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
              lctnships.
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
```


---

## `host-welcome.tsx`

```tsx
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
```


---

## `host-booking-request.tsx`

```tsx
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
```


---

## `host-booking-confirmed.tsx`

```tsx
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

interface HostBookingConfirmedEmailProps {
  renterName?: string
  renterAvatar?: string
  studioName?: string
  dateTime?: string
  duration?: string
  totalAmount?: string
  serviceFee?: string
  hostEarnings?: string
  baseUrl?: string
}

export default function HostBookingConfirmedEmail({
  renterName = "Maya Chen",
  renterAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuCp1DzLwrm-3wfiUqpNTH2aDqZR_RZ92sd13dknKecSQvInCOOdVSClLYDkdI6eco877EkpCpvuJzFy23KixiUWhwzLqB2-McLCyB0bk31kbDuPxUVgDv7VqbEHHtcBv07-Ak4rHf9RKGPKCOGT6kANEC40nlBCCpOxXMECdCp5ZQfDnaBmq5C2YQuxk8Imp5XBdRNGUuYymsur82P3p_EzUJKoT_AN2KrxbQ3fv4PCFWLXXadG9fr4_5SVLaTOrZt4i-pU84jI-fQ",
  studioName = "The Industrial Loft Studio",
  dateTime = "Saturday, November 2 · 10:00 AM – 4:00 PM",
  duration = "6 hours",
  totalAmount = "$480.00",
  serviceFee = "$48.00",
  hostEarnings = "$432.00",
  baseUrl = "https://lctnships.com",
}: HostBookingConfirmedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Booking confirmed: {renterName} at {studioName}
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
            <div style={checkIcon}>
              <Text style={{ margin: "0", fontSize: "32px" }}>✓</Text>
            </div>

            <Heading style={h1}>Booking confirmed!</Heading>

            <Text style={bodyText}>
              {renterName} has booked your studio through Instant Book. Here are
              the details for the upcoming session.
            </Text>

            {/* Renter Info */}
            <Section style={renterCard}>
              <Img
                src={renterAvatar}
                width="48"
                height="48"
                alt={renterName}
                style={avatarStyle}
              />
              <div>
                <Text style={renterNameStyle}>{renterName}</Text>
                <Text style={renterLabel}>Renter</Text>
              </div>
            </Section>

            {/* Booking Details */}
            <Section style={detailsCard}>
              <Text style={detailsTitle}>SESSION DETAILS</Text>
              <Text style={studioNameText}>{studioName}</Text>
              <Text style={detailText}>📅 {dateTime}</Text>
              <Text style={detailText}>⏱ {duration}</Text>
            </Section>

            {/* Earnings Breakdown */}
            <Section style={earningsCard}>
              <Text style={detailsTitle}>EARNINGS BREAKDOWN</Text>
              <Section style={earningsRow}>
                <Text style={earningsLabel}>Booking total</Text>
                <Text style={earningsValue}>{totalAmount}</Text>
              </Section>
              <Section style={earningsRow}>
                <Text style={earningsLabel}>Service fee</Text>
                <Text style={earningsValue}>-{serviceFee}</Text>
              </Section>
              <Section style={earningsDivider} />
              <Section style={earningsRow}>
                <Text style={earningsTotalLabel}>Your earnings</Text>
                <Text style={earningsTotalValue}>{hostEarnings}</Text>
              </Section>
            </Section>

            {/* CTA */}
            <Section style={{ textAlign: "center" as const }}>
              <Button
                style={primaryButton}
                href={`${baseUrl}/host/bookings`}
              >
                View Booking Details
              </Button>
            </Section>

            <Section style={{ textAlign: "center" as const }}>
              <Link href={`${baseUrl}/messages`} style={secondaryLink}>
                Message {renterName}
              </Link>
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

const renterCard = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "16px 20px",
  backgroundColor: "rgba(48,186,232,0.05)",
  borderRadius: "12px",
  marginBottom: "16px",
}

const avatarStyle = {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  objectFit: "cover" as const,
}

const renterNameStyle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#0e181b",
  margin: "0",
  textAlign: "left" as const,
}

const renterLabel = {
  fontSize: "13px",
  color: "#4e8597",
  margin: "2px 0 0",
  textAlign: "left" as const,
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

const studioNameText = {
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

const earningsCard = {
  padding: "24px",
  backgroundColor: "#f6f7f8",
  borderRadius: "12px",
  border: "1px solid #e7f0f3",
  textAlign: "left" as const,
  marginBottom: "32px",
}

const earningsRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "8px",
}

const earningsLabel = {
  fontSize: "14px",
  color: "#4e8597",
  margin: "0",
}

const earningsValue = {
  fontSize: "14px",
  color: "#4e8597",
  margin: "0",
  fontWeight: "500",
}

const earningsDivider = {
  height: "1px",
  backgroundColor: "#e7f0f3",
  margin: "8px 0",
}

const earningsTotalLabel = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#0e181b",
  margin: "0",
}

const earningsTotalValue = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#30bae8",
  margin: "0",
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
```


---

## `host-cancellation.tsx`

```tsx
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

interface HostCancellationEmailProps {
  renterName?: string
  studioName?: string
  dateTime?: string
  duration?: string
  refundAmount?: string
  cancellationReason?: string
  baseUrl?: string
}

export default function HostCancellationEmail({
  renterName = "Maya Chen",
  studioName = "The Industrial Loft Studio",
  dateTime = "Saturday, November 2 · 10:00 AM – 4:00 PM",
  duration = "6 hours",
  refundAmount = "$480.00",
  cancellationReason = "Schedule conflict",
  baseUrl = "https://lctnships.com",
}: HostCancellationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {renterName} cancelled their booking at {studioName}
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
            <div style={cancelIcon}>
              <Text style={{ margin: "0", fontSize: "32px" }}>✕</Text>
            </div>

            <Heading style={h1}>A booking has been cancelled</Heading>

            <Text style={bodyText}>
              {renterName} has cancelled their upcoming session at your studio.
              The time slot is now available for other renters to book.
            </Text>

            {/* Booking Details */}
            <Section style={detailsCard}>
              <Text style={detailsTitle}>CANCELLED BOOKING</Text>
              <Text style={studioNameStyle}>{studioName}</Text>
              <Text style={detailText}>📅 {dateTime}</Text>
              <Text style={detailText}>⏱ {duration}</Text>
              <Text style={detailText}>👤 {renterName}</Text>
            </Section>

            {/* Cancellation Info */}
            <Section style={infoCard}>
              <Text style={infoLabel}>CANCELLATION REASON</Text>
              <Text style={infoValue}>{cancellationReason}</Text>
            </Section>

            <Section style={infoCard}>
              <Text style={infoLabel}>REFUND ISSUED</Text>
              <Text style={refundValue}>{refundAmount}</Text>
              <Text style={infoMeta}>
                Refunded to the renter per your cancellation policy
              </Text>
            </Section>

            {/* CTA */}
            <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
              <Button
                style={primaryButton}
                href={`${baseUrl}/host/calendar`}
              >
                Update Availability
              </Button>
            </Section>

            <Section style={{ textAlign: "center" as const }}>
              <Link href={`${baseUrl}/host/bookings`} style={secondaryLink}>
                View All Bookings
              </Link>
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

const cancelIcon = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  backgroundColor: "#fef2f2",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "24px",
  color: "#ef4444",
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
  color: "#ef4444",
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

const infoCard = {
  padding: "20px 24px",
  backgroundColor: "#f6f7f8",
  borderRadius: "12px",
  border: "1px solid #e7f0f3",
  textAlign: "left" as const,
  marginBottom: "12px",
}

const infoLabel = {
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1px",
  color: "#4e8597",
  margin: "0 0 4px",
  textTransform: "uppercase" as const,
}

const infoValue = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#0e181b",
  margin: "0",
}

const refundValue = {
  fontSize: "24px",
  fontWeight: "800",
  color: "#ef4444",
  margin: "4px 0",
}

const infoMeta = {
  fontSize: "13px",
  color: "#4e8597",
  margin: "4px 0 0",
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
```


---

## `host-session-reminder.tsx`

```tsx
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

interface HostSessionReminderEmailProps {
  renterName?: string
  renterAvatar?: string
  studioName?: string
  dateTime?: string
  duration?: string
  renterPhone?: string
  sessionNotes?: string
  baseUrl?: string
}

export default function HostSessionReminderEmail({
  renterName = "Maya Chen",
  renterAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuCp1DzLwrm-3wfiUqpNTH2aDqZR_RZ92sd13dknKecSQvInCOOdVSClLYDkdI6eco877EkpCpvuJzFy23KixiUWhwzLqB2-McLCyB0bk31kbDuPxUVgDv7VqbEHHtcBv07-Ak4rHf9RKGPKCOGT6kANEC40nlBCCpOxXMECdCp5ZQfDnaBmq5C2YQuxk8Imp5XBdRNGUuYymsur82P3p_EzUJKoT_AN2KrxbQ3fv4PCFWLXXadG9fr4_5SVLaTOrZt4i-pU84jI-fQ",
  studioName = "The Industrial Loft Studio",
  dateTime = "Tomorrow, November 2 · 10:00 AM – 4:00 PM",
  duration = "6 hours",
  renterPhone = "+1 (555) 123-4567",
  sessionNotes = "Fashion lookbook shoot. Will bring 2 assistants and a wardrobe rack.",
  baseUrl = "https://lctnships.com",
}: HostSessionReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Reminder: {renterName} is coming to {studioName} tomorrow
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
            <div style={clockIcon}>
              <Text style={{ margin: "0", fontSize: "32px" }}>⏰</Text>
            </div>

            <Heading style={h1}>Session tomorrow</Heading>

            <Text style={bodyText}>
              You have a session coming up at your studio. Here&apos;s everything you
              need to prepare.
            </Text>

            {/* Renter Info */}
            <Section style={renterCard}>
              <Img
                src={renterAvatar}
                width="48"
                height="48"
                alt={renterName}
                style={avatarStyle}
              />
              <div>
                <Text style={renterNameStyle}>{renterName}</Text>
                <Text style={renterMeta}>📞 {renterPhone}</Text>
              </div>
            </Section>

            {/* Session Details */}
            <Section style={detailsCard}>
              <Text style={detailsTitle}>SESSION DETAILS</Text>
              <Text style={studioNameText}>{studioName}</Text>
              <Text style={detailText}>📅 {dateTime}</Text>
              <Text style={detailText}>⏱ {duration}</Text>
            </Section>

            {/* Session Notes */}
            {sessionNotes && (
              <Section style={notesCard}>
                <Text style={notesLabel}>RENTER&apos;S SESSION NOTES</Text>
                <Text style={notesText}>{sessionNotes}</Text>
              </Section>
            )}

            {/* Checklist */}
            <Section style={checklistCard}>
              <Text style={checklistTitle}>HOST PREP CHECKLIST</Text>
              <Text style={checklistItem}>☐ Studio cleaned and ready</Text>
              <Text style={checklistItem}>☐ Equipment checked and functional</Text>
              <Text style={checklistItem}>☐ Access codes / keys prepared</Text>
              <Text style={checklistItem}>☐ Wi-Fi info posted visibly</Text>
              <Text style={checklistItem}>☐ Emergency contact info available</Text>
            </Section>

            {/* CTA */}
            <Section style={{ textAlign: "center" as const }}>
              <Button style={primaryButton} href={`${baseUrl}/messages`}>
                Message {renterName}
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this because you have an upcoming session at your
              studio on lctnships.
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

const clockIcon = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  backgroundColor: "rgba(48,186,232,0.1)",
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

const renterCard = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "16px 20px",
  backgroundColor: "rgba(48,186,232,0.05)",
  borderRadius: "12px",
  marginBottom: "16px",
}

const avatarStyle = {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  objectFit: "cover" as const,
}

const renterNameStyle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#0e181b",
  margin: "0",
  textAlign: "left" as const,
}

const renterMeta = {
  fontSize: "13px",
  color: "#4e8597",
  margin: "4px 0 0",
  textAlign: "left" as const,
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

const studioNameText = {
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

const notesCard = {
  padding: "20px 24px",
  backgroundColor: "rgba(48,186,232,0.05)",
  borderRadius: "12px",
  border: "1px solid rgba(48,186,232,0.1)",
  textAlign: "left" as const,
  marginBottom: "16px",
}

const notesLabel = {
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1px",
  color: "#30bae8",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
}

const notesText = {
  fontSize: "15px",
  color: "#4e8597",
  lineHeight: "1.6",
  margin: "0",
  fontStyle: "italic",
}

const checklistCard = {
  padding: "24px",
  backgroundColor: "#f6f7f8",
  borderRadius: "12px",
  border: "1px solid #e7f0f3",
  textAlign: "left" as const,
  marginBottom: "32px",
}

const checklistTitle = {
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "2px",
  color: "#30bae8",
  margin: "0 0 16px",
}

const checklistItem = {
  fontSize: "14px",
  color: "#4e8597",
  fontWeight: "500",
  margin: "0 0 8px",
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

const copyright = {
  fontSize: "10px",
  color: "#4e8597",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  opacity: 0.5,
  marginTop: "16px",
}
```


---

## `host-new-review.tsx`

```tsx
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
```


---

## `host-payout.tsx`

```tsx
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
  baseUrl = "https://lctnships.com",
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
              <span style={logoText}>lctnships</span>
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
              lctnships.
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
```


---

## `host-new-message.tsx`

```tsx
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

interface HostNewMessageEmailProps {
  senderName?: string
  senderAvatar?: string
  messagePreview?: string
  studioName?: string
  baseUrl?: string
}

export default function HostNewMessageEmail({
  senderName = "Maya Chen",
  senderAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuCp1DzLwrm-3wfiUqpNTH2aDqZR_RZ92sd13dknKecSQvInCOOdVSClLYDkdI6eco877EkpCpvuJzFy23KixiUWhwzLqB2-McLCyB0bk31kbDuPxUVgDv7VqbEHHtcBv07-Ak4rHf9RKGPKCOGT6kANEC40nlBCCpOxXMECdCp5ZQfDnaBmq5C2YQuxk8Imp5XBdRNGUuYymsur82P3p_EzUJKoT_AN2KrxbQ3fv4PCFWLXXadG9fr4_5SVLaTOrZt4i-pU84jI-fQ",
  messagePreview = "Hi! I'm interested in renting your studio for a fashion shoot next week. Do you have availability on Thursday afternoon? Also, does the space come with the lighting rigs shown in the photos?",
  studioName = "The Industrial Loft Studio",
  baseUrl = "https://lctnships.com",
}: HostNewMessageEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {senderName} sent you a message about {studioName}
      </Preview>
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
            <Text style={badge}>NEW INQUIRY</Text>

            <Heading style={h1}>
              {senderName} sent you a message
            </Heading>

            <Text style={metaText}>
              Regarding your listing{" "}
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
                Reply to {senderName}
              </Button>
            </Section>

            {/* Tip */}
            <Section style={tipCard}>
              <Text style={tipText}>
                💡 Quick responses lead to more bookings. Aim to reply within a
                few hours.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this because you&apos;re a studio host on lctnships.
            </Text>
            <Text style={footerLinks}>
              <Link href={`${baseUrl}/notifications`} style={footerLink}>
                Notification Settings
              </Link>
              {" • "}
              <Link href={`${baseUrl}/privacy`} style={footerLink}>
                Privacy Policy
              </Link>
              {" • "}
              <Link href={`${baseUrl}/support`} style={footerLink}>
                Contact Support
              </Link>
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
  fontFamily:
    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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

const badge = {
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "2px",
  color: "#30bae8",
  margin: "0 0 12px",
}

const h1 = {
  fontSize: "28px",
  fontWeight: "800",
  color: "#0e181b",
  margin: "0 0 16px",
}

const metaText = { fontSize: "14px", color: "#94a3b8", margin: "0 0 32px" }
const studioHighlight = { color: "#30bae8", fontWeight: "500" }

const chatSection = { maxWidth: "480px", margin: "0 auto 40px" }
const chatRow = {
  display: "flex",
  alignItems: "flex-end",
  gap: "12px",
}
const avatarStyle = {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  objectFit: "cover" as const,
  border: "2px solid #ffffff",
}

const senderNameStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#30bae8",
  margin: "0 0 4px",
  paddingLeft: "16px",
  textAlign: "left" as const,
}

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

const tipCard = {
  padding: "16px 24px",
  backgroundColor: "rgba(48,186,232,0.05)",
  borderRadius: "12px",
  border: "1px solid rgba(48,186,232,0.1)",
  maxWidth: "480px",
  marginLeft: "auto",
  marginRight: "auto",
}

const tipText = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#4e8597",
  textAlign: "center" as const,
  margin: "0",
}

const footer = { padding: "32px", textAlign: "center" as const }
const footerText = { fontSize: "12px", color: "#94a3b8", margin: "0 0 16px" }
const footerLinks = { fontSize: "12px", color: "#94a3b8", margin: "0 0 24px" }
const footerLink = { color: "#94a3b8", textDecoration: "none" }
const footerCopyright = {
  fontSize: "10px",
  color: "#94a3b8",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  fontWeight: "700",
  margin: "0",
}
```


---

## `new-studios-discovery.tsx`

```tsx
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

interface Studio {
  name: string
  image: string
  description: string
  url: string
  featured?: boolean
}

interface NewStudiosDiscoveryEmailProps {
  heroImage?: string
  studios?: Studio[]
  baseUrl?: string
}

export default function NewStudiosDiscoveryEmail({
  heroImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuCEAEQCDkCKPUH3QwWdUYwibHBT3cxzF8y8e7XuC-wU84uKcTGiMYG5RtHGzpRW6OizG_eSj7ilv19Tqp7b48MNDeAoavqRfmJQoWXiuJbjb5iBBMj0HXNqgXrm8dEinuIWLlKaKB-36ldual0tGG34_S-BYA5D__Epc353XYbX9cyAR3S2KUH16ALu6SHeLTuLhYHVbCLvmPjqaV0k3nOLolyVkZx2rHkMdo7L0DK5rfVd0gPrzSlaP-O2r-42zCRgzAFJk9dTS5A",
  studios = [
    {
      name: "The Daylight Loft",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuARAb8uQitiTP0W7PtnYwvdVB5ff6I38hdkjl4RlgSXpkRij60VVBzQqcpHLab1pvtFlAEytEJdLhZq5w_j_BfceU9l9cSQ4PsRlhiCj3x3uxLFf5VWWRMYjcoiOf8fFN-9NcJuDjmLSkpzIgeb4Fcw0mWD-qjsPGlcakyhPXEITgyk5TOV_FiBrqSNT0v1rshnWU3x-KFRVeWR6l4azuzJYGLtJ4FJgLS4E5Uzo6LHYJqQ-jAZbKZQrpZAbTAxsOkC9I6H7hczGRg",
      description:
        "Incredible floor-to-ceiling windows with north-facing light, perfect for fashion editorials and minimalist lifestyle shoots.",
      url: "https://lctnships.com/studios/daylight-loft",
      featured: true,
    },
    {
      name: "Industrial Edge",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAIJVVVJQk0Ex5I1yDohUOpMjhX2OqncOMKj0_46sxbsms9QhIHllWXGrFarYBeh7YVCEJkTX1XUGSsFnK3SecVTTwJ7S75TyDaegfQmcEqFWg_vfq7t38AgZ72Qq4yfy17_m-5S9kwnWiTvmonqEjQQx9Ls4wePFutpEY-kMNizNbM76KB16OpnJvk6KQ4yedRvWO-jnlr1q7EeyEB6i7RRkTfAhDLcnuYxulRC2fHWNVnBu0lbwCpZNwuixT8rrBBMAyMoRTerdc",
      description:
        "Raw concrete textures and exposed brick provide a versatile, gritty backdrop for music videos and urban street photography.",
      url: "https://lctnships.com/studios/industrial-edge",
    },
    {
      name: "Minimalist Concrete",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCYjSG-DemThBYF4rCCHKxWwaJRw3LHIKDkPeAGL6Y1asqwLt4w_9NvzlqzyZFk6Pr8ftCmdHDL4Xy70hMCO6ltsoOPVMrVn5yQ6zbNlQ6qyCkWwB8PlahnGXWWs59jIW_QTV4XLMS-ID9o8iiSWQ3_aRgkVtj8K2sPQfKnSdVZTnhnMas0hvkwfW8KPTgKqekdYmhQ6eiR04ekwBIuKHqOBY1tKi6CaxwJNWHqNjPK6_pG0WgOQvHwLPB5S6uBGsmNFG4u5Jvhk80",
      description:
        "A brutalist masterpiece with geometric shadows and a neutral color palette for high-end product shoots.",
      url: "https://lctnships.com/studios/minimalist-concrete",
    },
  ],
  baseUrl = "https://lctnships.com",
}: NewStudiosDiscoveryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Fresh spaces for your next project — discover our latest curated studios
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Link href={baseUrl} style={logoLink}>
              <span style={logoText}>lctnships</span>
            </Link>
            <Section style={navLinks}>
              <Link href={`${baseUrl}/explore`} style={navLink}>
                Explore
              </Link>
              <Link href={`${baseUrl}/categories`} style={navLink}>
                Categories
              </Link>
              <Link href={`${baseUrl}/about`} style={navLink}>
                About
              </Link>
            </Section>
          </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <Img
              src={heroImage}
              width="600"
              alt="Fresh spaces for your next project"
              style={heroImg}
            />
            <Section style={heroOverlay}>
              <Heading style={heroTitle}>
                Fresh spaces for your next project
              </Heading>
              <Text style={heroSubtitle}>
                Discover our latest curated collection of premium studios
                designed for creators who demand excellence.
              </Text>
            </Section>
          </Section>

          {/* Section Title */}
          <Section style={sectionHeader}>
            <Heading style={sectionTitle}>Hand-picked arrivals</Heading>
          </Section>

          {/* Studio Cards */}
          {studios.map((studio, index) => (
            <Section key={index} style={studioCard}>
              <Img
                src={studio.image}
                width="536"
                height="220"
                alt={studio.name}
                style={studioImage}
              />
              <Section style={studioContent}>
                <Section style={studioNameRow}>
                  {studio.featured && (
                    <Text style={featuredBadge}>FEATURED</Text>
                  )}
                  <Text style={studioName}>{studio.name}</Text>
                </Section>
                <Text style={studioDesc}>
                  <span style={{ fontWeight: "600", color: "#127da1" }}>
                    Why we love it:{" "}
                  </span>
                  {studio.description}
                </Text>
                <Button style={viewStudioButton} href={studio.url}>
                  View Studio
                </Button>
              </Section>
            </Section>
          ))}

          {/* CTA Section */}
          <Section style={ctaSection}>
            <Heading style={ctaTitle}>Ready to see more?</Heading>
            <Text style={ctaText}>
              We add new creative spaces to our platform every week. Explore the
              full gallery of over 500+ locations.
            </Text>
            <Button style={ctaButton} href={`${baseUrl}/explore`}>
              See all new arrivals
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Section style={footerLinks}>
              <Link href={`${baseUrl}/privacy`} style={footerLink}>
                Privacy Policy
              </Link>
              {" • "}
              <Link href={`${baseUrl}/terms`} style={footerLink}>
                Terms of Service
              </Link>
              {" • "}
              <Link href={`${baseUrl}/guidelines`} style={footerLink}>
                Studio Guidelines
              </Link>
              {" • "}
              <Link href={`${baseUrl}/unsubscribe`} style={unsubLink}>
                Unsubscribe
              </Link>
            </Section>
            <Text style={copyright}>
              © {new Date().getFullYear()} lctnships Collective. All rights
              reserved.
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
  padding: "24px 32px",
  borderBottom: "1px solid #e7f0f3",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}

const logoLink = { textDecoration: "none", color: "#0e181b" }
const logoText = { fontSize: "20px", fontWeight: "700" }

const navLinks = { display: "inline-block", float: "right" as const }
const navLink = {
  color: "#0e181b",
  fontSize: "13px",
  fontWeight: "500",
  textDecoration: "none",
  marginLeft: "20px",
}

const heroSection = {
  position: "relative" as const,
  overflow: "hidden" as const,
}

const heroImg = {
  width: "100%",
  height: "400px",
  objectFit: "cover" as const,
  display: "block",
}

const heroOverlay = {
  position: "absolute" as const,
  bottom: "0",
  left: "0",
  right: "0",
  padding: "32px",
  background: "linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)",
}

const heroTitle = {
  fontSize: "36px",
  fontWeight: "700",
  color: "#ffffff",
  margin: "0 0 12px",
  lineHeight: "1.2",
  maxWidth: "480px",
}

const heroSubtitle = {
  fontSize: "16px",
  color: "rgba(255,255,255,0.8)",
  margin: "0",
  maxWidth: "400px",
  lineHeight: "1.5",
}

const sectionHeader = {
  padding: "32px 32px 24px",
  borderBottom: "1px solid #e7f0f3",
}

const sectionTitle = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#0e181b",
  margin: "0",
}

const studioCard = {
  padding: "24px 32px",
  borderBottom: "1px solid #f0f0f0",
}

const studioImage = {
  width: "100%",
  height: "220px",
  objectFit: "cover" as const,
  borderRadius: "12px",
  display: "block",
  marginBottom: "16px",
}

const studioContent = {
  padding: "0",
}

const studioNameRow = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "8px",
}

const featuredBadge = {
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
  color: "#127da1",
  backgroundColor: "rgba(18,125,161,0.1)",
  padding: "3px 8px",
  borderRadius: "4px",
  margin: "0",
  display: "inline-block",
}

const studioName = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#0e181b",
  margin: "0",
  display: "inline-block",
}

const studioDesc = {
  fontSize: "15px",
  color: "#4e8597",
  lineHeight: "1.6",
  margin: "0 0 16px",
}

const viewStudioButton = {
  backgroundColor: "#127da1",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  padding: "10px 24px",
  borderRadius: "8px",
  textDecoration: "none",
  display: "inline-block",
}

const ctaSection = {
  padding: "48px 32px",
  textAlign: "center" as const,
}

const ctaTitle = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#0e181b",
  margin: "0 0 12px",
}

const ctaText = {
  fontSize: "16px",
  color: "#4e8597",
  lineHeight: "1.6",
  margin: "0 0 24px",
  maxWidth: "400px",
  marginLeft: "auto",
  marginRight: "auto",
}

const ctaButton = {
  backgroundColor: "#127da1",
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "700",
  padding: "16px 32px",
  borderRadius: "12px",
  textDecoration: "none",
  display: "inline-block",
}

const footer = {
  padding: "32px",
  borderTop: "1px solid #e7f0f3",
  textAlign: "center" as const,
  backgroundColor: "#ffffff",
}

const footerLinks = {
  fontSize: "12px",
  color: "#9ca3af",
  marginBottom: "16px",
}

const footerLink = {
  color: "#9ca3af",
  textDecoration: "none",
  fontSize: "12px",
}

const unsubLink = {
  color: "#127da1",
  textDecoration: "none",
  fontSize: "12px",
}

const copyright = {
  fontSize: "11px",
  color: "#9ca3af",
  margin: "16px 0 0",
}
```


---

## `re-engagement.tsx`

```tsx
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

interface RecommendedStudio {
  name: string
  image: string
  location: string
  price: string
  url: string
}

interface ReEngagementEmailProps {
  userName?: string
  heroImage?: string
  discountCode?: string
  discountPercent?: string
  discountValidity?: string
  recommendedStudios?: RecommendedStudio[]
  baseUrl?: string
}

export default function ReEngagementEmail({
  userName = "Alex",
  heroImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuAzh6_QyWGTN8MXRAi7O1Ummj3xu-OBC2gAUEQGKyRB6tOegBP_XcHEInSHMJkexYzhHerythGNw23YGCetxJAw9PnvOWX-5b-CkQxu-ffSF1a1ryuUFppzbGa2nd4FkIIczSmZXnihpd0c5XqCXoMi9gaI72SdR2UKSevEuPOh0yNBibpGqlbxE_tv9gcXMfrPpMLYXn35Gy_OR6BhCylmupZPJsd_N8JBSPjL0oCTHe6CwwB69a6S6Bg5vi8gbsqQZkurfZPOX1w",
  discountCode = "WELCOMEBACK10",
  discountPercent = "10%",
  discountValidity = "30 days",
  recommendedStudios = [
    {
      name: "The Daylight Loft",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBH8TxzZos4OQMGjPpLt0H-zvZHtQ6FJHya_Pt3DysOQuHOX5GXLrdahxirtOX5Mxl_WLD6SRprBHVNJZ3Fj0aueXxVoOvngfORcWMJXkMCXZG3vL1rSAlfkYXwX7rPF5yaWlvwhsYvlcn9HdaxiKgLsNpeH-x77UOTB2IHsFjPeaoFsAAV6edjXFkwQcRGbehyIVSa0f-J3oMO3cn2_ZsTD4kKBezNDP_xuTov78OE6SfMm8jPb92moK_GkElbuE74Nl8NvQVfQYk",
      location: "Brooklyn, NY",
      price: "$75/hr",
      url: "https://lctnships.com/studios/daylight-loft",
    },
    {
      name: "Aether Industrial",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCoyTimp6YY4WpkyMgB_OmtVF0InzKaIY88kfm8baPdOW3dXs-ehxLlDM9FLk3csQ_128IMV0rbrWTYeaY5V2KEoEKHqXzgB-jYxNfYFQIQtBVUqO0O0iP2xorTCAMFm3C1yD9lDBkVLEpU23A9THbDqIpKLC4aNt-3Wy-e3TY5GKYZxwJv0jnqz4qOwnW7Lz-zxWm01scaHrCl3yj2pgK0T_KtHgi3DueRuiSs_RDQJkjEt2fyG9eRlyDExnYZzpfyWb_OrJlczuU",
      location: "Long Island City, NY",
      price: "$90/hr",
      url: "https://lctnships.com/studios/aether-industrial",
    },
  ],
  baseUrl = "https://lctnships.com",
}: ReEngagementEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        We miss your creative energy, {userName} — here&apos;s {discountPercent} off
        your next booking
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Link href={baseUrl} style={logoLink}>
              <span style={logoText}>lctnships</span>
            </Link>
          </Section>

          {/* Hero */}
          <Section style={content}>
            <Heading style={heroTitle}>
              We miss your creative energy, {userName}
            </Heading>

            <Img
              src={heroImage}
              width="536"
              height="360"
              alt="Modern creative studio"
              style={heroImg}
            />

            <Text style={heroQuote}>
              There&apos;s a unique rhythm to your creative process, and we&apos;ve
              noticed your seat has been empty lately. The right space doesn&apos;t
              just hold your tools—it breathes life into your most daring ideas.
            </Text>
          </Section>

          {/* Recommended Studios */}
          <Section style={recommendSection}>
            <Heading style={recommendTitle}>
              Curated for your next project...
            </Heading>

            <Section style={studiosGrid}>
              {recommendedStudios.map((studio, index) => (
                <Link
                  key={index}
                  href={studio.url}
                  style={studioCardLink}
                >
                  <Img
                    src={studio.image}
                    width="252"
                    height="190"
                    alt={studio.name}
                    style={studioImg}
                  />
                  <Text style={studioName}>{studio.name}</Text>
                  <Text style={studioMeta}>
                    {studio.location} • {studio.price}
                  </Text>
                </Link>
              ))}
            </Section>
          </Section>

          {/* Voucher Card */}
          <Section style={voucherSection}>
            <Section style={voucherCard}>
              <Text style={giftIcon}>🎁</Text>
              <Heading style={voucherTitle}>A gift for your return</Heading>
              <Text style={voucherText}>
                We&apos;d love to see what you create next. Use this code at checkout
                for {discountPercent} off your next studio booking.
              </Text>
              <Section style={codeBox}>
                <Text style={codeText}>{discountCode}</Text>
              </Section>
              <Text style={voucherMeta}>
                Valid for {discountValidity} • One-time use
              </Text>
            </Section>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={`${baseUrl}/explore`}>
              Book your next session
            </Button>
            <Link href={`${baseUrl}/explore`} style={browseLink}>
              Browse all spaces →
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Section style={socialLinks}>
              <Link href="#" style={socialLink}>
                INSTAGRAM
              </Link>
              {"  •  "}
              <Link href="#" style={socialLink}>
                PINTEREST
              </Link>
              {"  •  "}
              <Link href={`${baseUrl}/blog`} style={socialLink}>
                JOURNAL
              </Link>
            </Section>
            <Text style={copyright}>
              © {new Date().getFullYear()} lctnships. Designed for the nomadic
              creator.
            </Text>
            <Text style={footerSmall}>
              You&apos;re receiving this because you&apos;re a member of the lctnships
              creative community.{" "}
              <Link href={`${baseUrl}/unsubscribe`} style={unsubLink}>
                Unsubscribe
              </Link>{" "}
              or{" "}
              <Link href={`${baseUrl}/preferences`} style={unsubLink}>
                Manage Preferences
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f8fbfc",
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
  padding: "24px 32px",
  borderBottom: "1px solid #e7f0f3",
}

const logoLink = { textDecoration: "none", color: "#0e181b" }
const logoText = { fontSize: "20px", fontWeight: "700" }

const content = {
  padding: "40px 32px 0",
  textAlign: "center" as const,
}

const heroTitle = {
  fontSize: "36px",
  fontWeight: "700",
  color: "#0e181b",
  lineHeight: "1.2",
  margin: "0 0 24px",
  textAlign: "center" as const,
}

const heroImg = {
  width: "100%",
  height: "360px",
  objectFit: "cover" as const,
  borderRadius: "12px",
  display: "block",
}

const heroQuote = {
  fontSize: "17px",
  color: "rgba(14,24,27,0.8)",
  lineHeight: "1.7",
  fontStyle: "italic",
  textAlign: "center" as const,
  maxWidth: "520px",
  margin: "24px auto 0",
  padding: "0 16px",
}

const recommendSection = {
  padding: "40px 32px 0",
}

const recommendTitle = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#0e181b",
  margin: "0 0 24px",
}

const studiosGrid = {
  display: "flex",
  gap: "16px",
}

const studioCardLink = {
  textDecoration: "none",
  flex: "1",
  display: "block",
}

const studioImg = {
  width: "100%",
  height: "190px",
  objectFit: "cover" as const,
  borderRadius: "8px",
  display: "block",
  marginBottom: "12px",
}

const studioName = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#0e181b",
  margin: "0 0 4px",
}

const studioMeta = {
  fontSize: "13px",
  color: "rgba(14,24,27,0.5)",
  margin: "0",
}

const voucherSection = {
  padding: "40px 32px",
}

const voucherCard = {
  padding: "40px 32px",
  backgroundColor: "rgba(18,125,161,0.05)",
  borderRadius: "12px",
  border: "2px dashed rgba(18,125,161,0.3)",
  textAlign: "center" as const,
}

const giftIcon = {
  fontSize: "36px",
  margin: "0 0 16px",
}

const voucherTitle = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#0e181b",
  margin: "0 0 8px",
}

const voucherText = {
  fontSize: "15px",
  color: "rgba(14,24,27,0.7)",
  lineHeight: "1.6",
  margin: "0 0 24px",
  maxWidth: "400px",
  marginLeft: "auto",
  marginRight: "auto",
}

const codeBox = {
  backgroundColor: "#ffffff",
  border: "1px solid #e7f0f3",
  borderRadius: "8px",
  padding: "12px 24px",
  display: "inline-block",
  marginBottom: "16px",
}

const codeText = {
  fontSize: "20px",
  fontWeight: "700",
  fontFamily: "monospace",
  letterSpacing: "3px",
  color: "#127da1",
  margin: "0",
}

const voucherMeta = {
  fontSize: "11px",
  color: "rgba(14,24,27,0.4)",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0",
}

const ctaSection = {
  padding: "0 32px 48px",
  textAlign: "center" as const,
}

const ctaButton = {
  backgroundColor: "#0e181b",
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "700",
  padding: "18px 40px",
  borderRadius: "999px",
  textDecoration: "none",
  display: "inline-block",
}

const browseLink = {
  display: "block",
  color: "#127da1",
  fontSize: "14px",
  fontWeight: "500",
  textDecoration: "none",
  marginTop: "16px",
}

const footer = {
  padding: "40px 32px",
  backgroundColor: "#f9fafb",
  borderTop: "1px solid #e7f0f3",
  textAlign: "center" as const,
}

const socialLinks = {
  marginBottom: "24px",
  fontSize: "10px",
  letterSpacing: "2px",
  fontWeight: "700",
  color: "rgba(14,24,27,0.5)",
}

const socialLink = {
  color: "rgba(14,24,27,0.5)",
  textDecoration: "none",
  fontSize: "10px",
  letterSpacing: "2px",
  fontWeight: "700",
}

const copyright = {
  fontSize: "11px",
  color: "rgba(14,24,27,0.4)",
  margin: "0 0 8px",
}

const footerSmall = {
  fontSize: "10px",
  color: "rgba(14,24,27,0.4)",
  lineHeight: "1.6",
  maxWidth: "360px",
  marginLeft: "auto",
  marginRight: "auto",
}

const unsubLink = {
  color: "rgba(14,24,27,0.4)",
  textDecoration: "underline",
}
```

