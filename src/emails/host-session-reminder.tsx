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
  baseUrl = "https://lcntships.com",
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
              <span style={logoText}>lcntships</span>
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
              studio on lcntships.
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
