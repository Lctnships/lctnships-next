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
