// Blog articles data - can be migrated to Supabase later
export interface BlogArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  categorySlug: string
  author: {
    name: string
    role: string
    avatar: string
  }
  coverImage: string
  readTime: string
  publishedAt: string
  featured?: boolean
  tags: string[]
}

export const blogCategories = [
  { name: "All Stories", slug: "all" },
  { name: "Studio Tips", slug: "studio-tips" },
  { name: "Interviews", slug: "interviews" },
  { name: "Production Guides", slug: "production-guides" },
  { name: "Creator Spotlight", slug: "creator-spotlight" },
]

export const blogArticles: BlogArticle[] = [
  {
    id: "1",
    slug: "the-art-of-natural-light",
    title: "The Art of Natural Light: Why Studio B is a Photographer's Dream",
    excerpt: "Discover how organic lighting transforms your creative process in our most sought-after minimalist space.",
    content: `
      <p class="text-xl italic text-primary/80 mb-10 font-medium leading-relaxed">
        The landscape of studio photography is undergoing a profound transformation. As we move further into an era defined by high-fidelity experiences, the role of natural lighting has never been more critical.
      </p>

      <p>For creative professionals, this shift represents both a challenge and an unprecedented opportunity to redefine how we connect with audiences. In a world saturated with artificial lighting setups, the pursuit of organic, natural light has become the new standard for luxury and professional photography.</p>

      <h2>The Shift to Natural Aesthetics</h2>

      <p>We are no longer merely "lighting" subjects; we are crafting environments. The convergence of architectural design, window placement, and time-of-day awareness means that the quality of our natural light must match the sophistication of our creative vision.</p>

      <p>Studio B was designed with this philosophy at its core. Floor-to-ceiling windows facing north provide consistent, soft light throughout the day. The white-washed walls act as natural reflectors, creating a luminous atmosphere that flatters every subject.</p>

      <h2>Why Photographers Love It</h2>

      <p>Effective storytelling now requires a multi-dimensional approach. It's about the silence between frames as much as the content within them. Studio B offers that rare combination of technical excellence and creative inspiration that photographers seek.</p>

      <p>As we look toward the future, the integration of natural and artificial light will continue to evolve. However, the human element—the soul, the intent, and the narrative arc—will remain the differentiating factor between good photography and exceptional visual storytelling.</p>
    `,
    category: "Studio Tips",
    categorySlug: "studio-tips",
    author: {
      name: "Julian Thorne",
      role: "Creative Director",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop",
    readTime: "8 min read",
    publishedAt: "2024-10-24",
    featured: true,
    tags: ["NATURAL LIGHT", "PHOTOGRAPHY", "STUDIO DESIGN"]
  },
  {
    id: "2",
    slug: "inside-the-loft-sarah-chen",
    title: "Inside the Loft: A Chat with Minimalist Designer Sarah Chen",
    excerpt: "How this award-winning designer uses space and light to create stunning visual narratives.",
    content: `
      <p class="text-xl italic text-primary/80 mb-10 font-medium leading-relaxed">
        Sarah Chen's work has redefined what minimalism means in the digital age. We sat down with her to discuss her creative process.
      </p>

      <p>When you step into Sarah Chen's studio, the first thing you notice is the absence of clutter. Every object has its place, every surface serves a purpose. This isn't just aesthetic preference—it's a philosophy that permeates her entire creative practice.</p>

      <h2>The Power of Negative Space</h2>

      <p>"People often think minimalism is about removing things," Sarah explains, adjusting the single orchid on her desk. "But it's really about making space for what matters. In photography, that negative space is just as important as the subject."</p>

      <p>Her recent campaign for a luxury watch brand exemplifies this approach. Shot entirely in our Studio C, the images feature vast expanses of white, with the timepiece appearing almost to float in space.</p>

      <h2>Advice for Emerging Creatives</h2>

      <p>"Start with intention," she advises. "Before you set up a single light or position your camera, ask yourself: what story am I telling? Everything else flows from that question."</p>
    `,
    category: "Creator Spotlight",
    categorySlug: "creator-spotlight",
    author: {
      name: "Emma Rodriguez",
      role: "Features Editor",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
    },
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=1000&fit=crop",
    readTime: "6 min read",
    publishedAt: "2024-10-20",
    tags: ["MINIMALISM", "INTERVIEW", "DESIGN"]
  },
  {
    id: "3",
    slug: "5-essential-props-editorial-shoot",
    title: "5 Essential Props for Your Next Editorial Shoot",
    excerpt: "Curated items that elevate any production without overwhelming the frame.",
    content: `
      <p class="text-xl italic text-primary/80 mb-10 font-medium leading-relaxed">
        The right props can transform a good shoot into an extraordinary one. Here are our top picks for 2024.
      </p>

      <h2>1. The Sculptural Vase</h2>
      <p>A single, architecturally interesting vase can anchor an entire composition. Look for organic shapes that catch light beautifully.</p>

      <h2>2. Textured Fabrics</h2>
      <p>Linen, raw silk, and cashmere add depth and tactile interest. Neutral tones work best for versatility.</p>

      <h2>3. Vintage Books</h2>
      <p>Aged leather-bound books bring instant sophistication. Stack them at varying heights for visual interest.</p>

      <h2>4. Marble Surfaces</h2>
      <p>A small marble board or tray serves as both backdrop and prop. The natural veining adds organic beauty.</p>

      <h2>5. Fresh Botanicals</h2>
      <p>Never underestimate the power of a single stem or branch. Eucalyptus, olive branches, and dried pampas grass are perennial favorites.</p>
    `,
    category: "Production Guides",
    categorySlug: "production-guides",
    author: {
      name: "Marcus Webb",
      role: "Prop Stylist",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    coverImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
    readTime: "4 min read",
    publishedAt: "2024-10-18",
    tags: ["PROPS", "STYLING", "EDITORIAL"]
  },
  {
    id: "4",
    slug: "how-lctnships-changing-rental-game",
    title: "How lctnships is Changing the Rental Game",
    excerpt: "A look at how our platform is democratizing access to premium studio spaces.",
    content: `
      <p class="text-xl italic text-primary/80 mb-10 font-medium leading-relaxed">
        The traditional studio rental model is broken. We're fixing it.
      </p>

      <p>For decades, accessing premium studio space meant navigating a maze of phone calls, deposits, and minimum booking requirements. Independent creators were often priced out entirely, forced to make do with makeshift setups or settle for subpar locations.</p>

      <h2>The lctnships Difference</h2>

      <p>We built lctnships on a simple premise: beautiful spaces should be accessible to everyone with a creative vision. Our platform connects space owners with creators, streamlining the entire booking process.</p>

      <p>No phone tag. No hidden fees. Just beautiful spaces, available when you need them.</p>

      <h2>Community First</h2>

      <p>Beyond the transaction, we're building a community. Our creators share tips, collaborate on projects, and support each other's growth. That's the real magic of lctnships.</p>
    `,
    category: "Studio News",
    categorySlug: "studio-news",
    author: {
      name: "Alex Kim",
      role: "Co-Founder",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
    },
    coverImage: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=800&fit=crop",
    readTime: "3 min read",
    publishedAt: "2024-10-15",
    tags: ["PLATFORM", "COMMUNITY", "INNOVATION"]
  },
  {
    id: "5",
    slug: "maximizing-small-spaces",
    title: "Maximizing Small Spaces for High-End Productions",
    excerpt: "Techniques for making compact studios feel expansive and luxurious.",
    content: `
      <p class="text-xl italic text-primary/80 mb-10 font-medium leading-relaxed">
        Square footage isn't everything. Here's how to make any space work for your vision.
      </p>

      <p>The belief that you need a massive studio for professional results is one of the biggest myths in our industry. Some of the most iconic images in fashion and commercial photography were created in surprisingly modest spaces.</p>

      <h2>The Power of Perspective</h2>

      <p>Wide-angle lenses, strategic camera placement, and careful composition can make a 400-square-foot space feel like a vast loft. The key is understanding how your lens sees the world differently than your eyes.</p>

      <h2>Light is Your Best Friend</h2>

      <p>Proper lighting doesn't just illuminate—it defines space. Use shadows strategically to create depth and dimension. A well-lit small space will always outperform a poorly lit large one.</p>

      <h2>Declutter Ruthlessly</h2>

      <p>Every item in frame should earn its place. When working in compact spaces, this principle becomes even more critical. Edit your props down to the essentials.</p>
    `,
    category: "Studio Tips",
    categorySlug: "studio-tips",
    author: {
      name: "Nina Patel",
      role: "Director of Photography",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    },
    coverImage: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=1000&fit=crop",
    readTime: "8 min read",
    publishedAt: "2024-10-12",
    tags: ["SMALL SPACES", "TECHNICAL", "LIGHTING"]
  },
  {
    id: "6",
    slug: "new-wave-independent-directors",
    title: "The New Wave of Independent Directors",
    excerpt: "Meet the filmmakers redefining visual storytelling on their own terms.",
    content: `
      <p class="text-xl italic text-primary/80 mb-10 font-medium leading-relaxed">
        A new generation of directors is proving that compelling cinema doesn't require Hollywood budgets.
      </p>

      <p>The democratization of filmmaking tools has unleashed a wave of creative talent that's reshaping the industry. These directors aren't waiting for permission—they're creating their own opportunities.</p>

      <h2>Technology as Equalizer</h2>

      <p>Cinema-quality cameras that once cost hundreds of thousands now fit in a backpack. Editing software that rivals professional suites is available to anyone with a laptop. The technical barriers have all but vanished.</p>

      <h2>The Rise of Hybrid Spaces</h2>

      <p>Modern filmmakers need versatile locations that can transform from corporate boardroom to indie film set. That's exactly what lctnships offers—spaces that adapt to your vision.</p>
    `,
    category: "Interviews",
    categorySlug: "interviews",
    author: {
      name: "David Chen",
      role: "Film Critic",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face"
    },
    coverImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=800&fit=crop",
    readTime: "12 min read",
    publishedAt: "2024-10-08",
    tags: ["FILM", "DIRECTORS", "INDIE"]
  },
  {
    id: "7",
    slug: "gear-every-cinematographer-needs",
    title: "The Gear Every Emerging Cinematographer Needs",
    excerpt: "Building your kit without breaking the bank—our expert recommendations.",
    content: `
      <p class="text-xl italic text-primary/80 mb-10 font-medium leading-relaxed">
        You don't need everything, but you do need the right things. Here's what actually matters.
      </p>

      <h2>The Essentials</h2>

      <p>A reliable camera body, two versatile prime lenses, a sturdy tripod, and basic lighting. That's genuinely all you need to start creating professional work.</p>

      <h2>Where to Invest</h2>

      <p>Spend more on glass than on bodies. A good lens will serve you for decades; camera bodies are constantly evolving. Your 50mm f/1.4 from ten years ago still produces beautiful images.</p>

      <h2>The Studio Advantage</h2>

      <p>One of the smartest investments isn't gear at all—it's access to professional spaces with built-in equipment. Why own expensive lighting setups when you can rent studios that include them?</p>
    `,
    category: "Production Guides",
    categorySlug: "production-guides",
    author: {
      name: "James Liu",
      role: "Equipment Specialist",
      avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=face"
    },
    coverImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop",
    readTime: "10 min read",
    publishedAt: "2024-10-05",
    tags: ["GEAR", "CINEMATOGRAPHY", "EQUIPMENT"]
  }
]

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return blogArticles.find(article => article.slug === slug)
}

export function getFeaturedArticle(): BlogArticle | undefined {
  return blogArticles.find(article => article.featured)
}

export function getRelatedArticles(currentSlug: string, limit: number = 3): BlogArticle[] {
  return blogArticles
    .filter(article => article.slug !== currentSlug)
    .slice(0, limit)
}
