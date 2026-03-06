import Link from "next/link"
import Image from "next/image"

export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        <div className="not-found-page">
          <header>
            <Link href="/">
              <Image
                src="/Lctnships-cropped.png"
                alt="lcntships"
                width={140}
                height={62}
                style={{ height: 32, width: "auto" }}
                priority
              />
            </Link>
          </header>

          <main>
            <p className="label">Error 404</p>
            <h1>Page not found</h1>
            <p className="description">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <div className="actions">
              <Link href="/" className="btn-primary">
                Back to home
              </Link>
              <Link href="/en/studios" className="btn-secondary">
                Browse studios
              </Link>
            </div>
          </main>

          <footer>
            <p>&copy; {new Date().getFullYear()} lcntships</p>
          </footer>
        </div>

        <style>{`
          .not-found-page {
            min-height: 100vh;
            background: white;
            display: flex;
            flex-direction: column;
          }
          header {
            padding: 24px;
          }
          main {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 24px;
            text-align: center;
          }
          .label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.3em;
            color: #9ca3af;
            margin-bottom: 24px;
          }
          h1 {
            font-family: 'Newsreader', Georgia, serif;
            font-size: clamp(3rem, 8vw, 4.5rem);
            font-weight: 500;
            letter-spacing: -0.02em;
            color: black;
            margin: 0 0 16px;
          }
          .description {
            color: #6b7280;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 40px;
          }
          .actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            justify-content: center;
          }
          .btn-primary {
            padding: 12px 32px;
            background: black;
            color: white;
            font-size: 14px;
            font-weight: 700;
            border-radius: 9999px;
            text-decoration: none;
            transition: background 0.2s;
          }
          .btn-primary:hover { background: rgba(0,0,0,0.9); }
          .btn-secondary {
            padding: 12px 32px;
            border: 1px solid #e5e7eb;
            font-size: 14px;
            font-weight: 700;
            border-radius: 9999px;
            text-decoration: none;
            color: black;
            transition: background 0.2s;
          }
          .btn-secondary:hover { background: #f9fafb; }
          footer {
            padding: 24px;
            text-align: center;
          }
          footer p {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: #d1d5db;
            font-weight: 700;
          }
        `}</style>
      </body>
    </html>
  )
}
