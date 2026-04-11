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
}