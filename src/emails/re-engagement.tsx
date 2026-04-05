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
