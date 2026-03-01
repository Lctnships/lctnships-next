import { Metadata } from "next"
import { Link } from "@/i18n/routing"
import { CheckCircle2, CreditCard, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Betaling gelukt | lcntships",
  description: "Je strippenkaart is succesvol aangekocht",
}

export default function CreditsSuccessPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Betaling gelukt!</h1>
            <p className="text-muted-foreground">
              Je credits zijn toegevoegd aan je account en zijn direct
              beschikbaar voor boekingen.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-black" />
            </div>
            <div className="text-left">
              <p className="font-medium">Credits bijgeschreven</p>
              <p className="text-sm text-muted-foreground">
                Bekijk je saldo in je dashboard
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Link href="/studios" className="block">
              <Button className="w-full" size="lg">
                Boek een studio
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/credits" className="block">
              <Button variant="outline" className="w-full" size="lg">
                Bekijk je credits
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
