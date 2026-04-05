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
