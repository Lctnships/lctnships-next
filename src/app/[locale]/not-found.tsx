import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold mt-4">Pagina niet gevonden</h2>
        <p className="text-muted-foreground mt-2">
          De pagina die je zoekt bestaat niet of is verplaatst.
        </p>
        <Link href="/" className="inline-block mt-6">
          <Button>Terug naar home</Button>
        </Link>
      </div>
    </div>
  )
}
