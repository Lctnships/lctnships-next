-- Blog articles table
CREATE TABLE IF NOT EXISTS public.blog_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    category_slug TEXT NOT NULL,
    cover_image TEXT,
    read_time TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog authors table
CREATE TABLE IF NOT EXISTS public.blog_authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link articles to authors
ALTER TABLE public.blog_articles
ADD COLUMN author_id UUID REFERENCES public.blog_authors(id);

-- Blog article tags
CREATE TABLE IF NOT EXISTS public.blog_article_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES public.blog_articles(id) ON DELETE CASCADE,
    tag TEXT NOT NULL
);

-- Blog categories
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    order_index INTEGER DEFAULT 0
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_articles_slug ON public.blog_articles(slug);
CREATE INDEX IF NOT EXISTS idx_blog_articles_published ON public.blog_articles(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_articles_featured ON public.blog_articles(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_blog_articles_category ON public.blog_articles(category_slug);
CREATE INDEX IF NOT EXISTS idx_blog_article_tags_article ON public.blog_article_tags(article_id);

-- Enable Row Level Security
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- Public read access for published articles
CREATE POLICY "Published articles are viewable by everyone"
    ON public.blog_articles FOR SELECT
    USING (is_published = TRUE);

-- Public read access for authors
CREATE POLICY "Authors are viewable by everyone"
    ON public.blog_authors FOR SELECT
    USING (TRUE);

-- Public read access for tags
CREATE POLICY "Tags are viewable by everyone"
    ON public.blog_article_tags FOR SELECT
    USING (TRUE);

-- Public read access for categories
CREATE POLICY "Categories are viewable by everyone"
    ON public.blog_categories FOR SELECT
    USING (TRUE);

-- Insert default categories
INSERT INTO public.blog_categories (name, slug, order_index) VALUES
    ('All Stories', 'all', 0),
    ('Studio Tips', 'studio-tips', 1),
    ('Interviews', 'interviews', 2),
    ('Production Guides', 'production-guides', 3),
    ('Creator Spotlight', 'creator-spotlight', 4),
    ('Studio News', 'studio-news', 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample authors
INSERT INTO public.blog_authors (id, name, role, avatar_url) VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Julian Thorne', 'Creative Director', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Emma Rodriguez', 'Features Editor', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face'),
    ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Marcus Webb', 'Prop Stylist', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'),
    ('d4e5f6a7-b8c9-0123-def0-234567890123', 'Alex Kim', 'Co-Founder', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'),
    ('e5f6a7b8-c9d0-1234-ef01-345678901234', 'Nina Patel', 'Director of Photography', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face')
ON CONFLICT DO NOTHING;

-- Insert sample articles
INSERT INTO public.blog_articles (slug, title, excerpt, content, category, category_slug, cover_image, read_time, is_featured, is_published, published_at, author_id) VALUES
(
    'the-art-of-natural-light',
    'The Art of Natural Light: Why Studio B is a Photographer''s Dream',
    'Discover how organic lighting transforms your creative process in our most sought-after minimalist space.',
    '<p class="text-xl italic text-primary/80 mb-10 font-medium leading-relaxed">The landscape of studio photography is undergoing a profound transformation. As we move further into an era defined by high-fidelity experiences, the role of natural lighting has never been more critical.</p><p>For creative professionals, this shift represents both a challenge and an unprecedented opportunity to redefine how we connect with audiences. In a world saturated with artificial lighting setups, the pursuit of organic, natural light has become the new standard for luxury and professional photography.</p><h2>The Shift to Natural Aesthetics</h2><p>We are no longer merely "lighting" subjects; we are crafting environments. The convergence of architectural design, window placement, and time-of-day awareness means that the quality of our natural light must match the sophistication of our creative vision.</p><p>Studio B was designed with this philosophy at its core. Floor-to-ceiling windows facing north provide consistent, soft light throughout the day. The white-washed walls act as natural reflectors, creating a luminous atmosphere that flatters every subject.</p><h2>Why Photographers Love It</h2><p>Effective storytelling now requires a multi-dimensional approach. It''s about the silence between frames as much as the content within them. Studio B offers that rare combination of technical excellence and creative inspiration that photographers seek.</p><p>As we look toward the future, the integration of natural and artificial light will continue to evolve. However, the human element—the soul, the intent, and the narrative arc—will remain the differentiating factor between good photography and exceptional visual storytelling.</p>',
    'Studio Tips',
    'studio-tips',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop',
    '8 min read',
    TRUE,
    TRUE,
    NOW() - INTERVAL '4 days',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
),
(
    'inside-the-loft-sarah-chen',
    'Inside the Loft: A Chat with Minimalist Designer Sarah Chen',
    'How this award-winning designer uses space and light to create stunning visual narratives.',
    '<p class="text-xl italic text-primary/80 mb-10 font-medium leading-relaxed">Sarah Chen''s work has redefined what minimalism means in the digital age. We sat down with her to discuss her creative process.</p><p>When you step into Sarah Chen''s studio, the first thing you notice is the absence of clutter. Every object has its place, every surface serves a purpose. This isn''t just aesthetic preference—it''s a philosophy that permeates her entire creative practice.</p><h2>The Power of Negative Space</h2><p>"People often think minimalism is about removing things," Sarah explains, adjusting the single orchid on her desk. "But it''s really about making space for what matters. In photography, that negative space is just as important as the subject."</p><p>Her recent campaign for a luxury watch brand exemplifies this approach. Shot entirely in our Studio C, the images feature vast expanses of white, with the timepiece appearing almost to float in space.</p><h2>Advice for Emerging Creatives</h2><p>"Start with intention," she advises. "Before you set up a single light or position your camera, ask yourself: what story am I telling? Everything else flows from that question."</p>',
    'Creator Spotlight',
    'creator-spotlight',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=1000&fit=crop',
    '6 min read',
    FALSE,
    TRUE,
    NOW() - INTERVAL '8 days',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'
),
(
    '5-essential-props-editorial-shoot',
    '5 Essential Props for Your Next Editorial Shoot',
    'Curated items that elevate any production without overwhelming the frame.',
    '<p class="text-xl italic text-primary/80 mb-10 font-medium leading-relaxed">The right props can transform a good shoot into an extraordinary one. Here are our top picks for 2024.</p><h2>1. The Sculptural Vase</h2><p>A single, architecturally interesting vase can anchor an entire composition. Look for organic shapes that catch light beautifully.</p><h2>2. Textured Fabrics</h2><p>Linen, raw silk, and cashmere add depth and tactile interest. Neutral tones work best for versatility.</p><h2>3. Vintage Books</h2><p>Aged leather-bound books bring instant sophistication. Stack them at varying heights for visual interest.</p><h2>4. Marble Surfaces</h2><p>A small marble board or tray serves as both backdrop and prop. The natural veining adds organic beauty.</p><h2>5. Fresh Botanicals</h2><p>Never underestimate the power of a single stem or branch. Eucalyptus, olive branches, and dried pampas grass are perennial favorites.</p>',
    'Production Guides',
    'production-guides',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
    '4 min read',
    FALSE,
    TRUE,
    NOW() - INTERVAL '10 days',
    'c3d4e5f6-a7b8-9012-cdef-123456789012'
),
(
    'how-lcntships-changing-rental-game',
    'How lcntships is Changing the Rental Game',
    'A look at how our platform is democratizing access to premium studio spaces.',
    '<p class="text-xl italic text-primary/80 mb-10 font-medium leading-relaxed">The traditional studio rental model is broken. We''re fixing it.</p><p>For decades, accessing premium studio space meant navigating a maze of phone calls, deposits, and minimum booking requirements. Independent creators were often priced out entirely, forced to make do with makeshift setups or settle for subpar locations.</p><h2>The lcntships Difference</h2><p>We built lcntships on a simple premise: beautiful spaces should be accessible to everyone with a creative vision. Our platform connects space owners with creators, streamlining the entire booking process.</p><p>No phone tag. No hidden fees. Just beautiful spaces, available when you need them.</p><h2>Community First</h2><p>Beyond the transaction, we''re building a community. Our creators share tips, collaborate on projects, and support each other''s growth. That''s the real magic of lcntships.</p>',
    'Studio News',
    'studio-news',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=800&fit=crop',
    '3 min read',
    FALSE,
    TRUE,
    NOW() - INTERVAL '13 days',
    'd4e5f6a7-b8c9-0123-def0-234567890123'
),
(
    'maximizing-small-spaces',
    'Maximizing Small Spaces for High-End Productions',
    'Techniques for making compact studios feel expansive and luxurious.',
    '<p class="text-xl italic text-primary/80 mb-10 font-medium leading-relaxed">Square footage isn''t everything. Here''s how to make any space work for your vision.</p><p>The belief that you need a massive studio for professional results is one of the biggest myths in our industry. Some of the most iconic images in fashion and commercial photography were created in surprisingly modest spaces.</p><h2>The Power of Perspective</h2><p>Wide-angle lenses, strategic camera placement, and careful composition can make a 400-square-foot space feel like a vast loft. The key is understanding how your lens sees the world differently than your eyes.</p><h2>Light is Your Best Friend</h2><p>Proper lighting doesn''t just illuminate—it defines space. Use shadows strategically to create depth and dimension. A well-lit small space will always outperform a poorly lit large one.</p><h2>Declutter Ruthlessly</h2><p>Every item in frame should earn its place. When working in compact spaces, this principle becomes even more critical. Edit your props down to the essentials.</p>',
    'Studio Tips',
    'studio-tips',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=1000&fit=crop',
    '8 min read',
    FALSE,
    TRUE,
    NOW() - INTERVAL '16 days',
    'e5f6a7b8-c9d0-1234-ef01-345678901234'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert tags for articles
INSERT INTO public.blog_article_tags (article_id, tag)
SELECT a.id, t.tag
FROM public.blog_articles a
CROSS JOIN (VALUES ('NATURAL LIGHT'), ('PHOTOGRAPHY'), ('STUDIO DESIGN')) AS t(tag)
WHERE a.slug = 'the-art-of-natural-light';

INSERT INTO public.blog_article_tags (article_id, tag)
SELECT a.id, t.tag
FROM public.blog_articles a
CROSS JOIN (VALUES ('MINIMALISM'), ('INTERVIEW'), ('DESIGN')) AS t(tag)
WHERE a.slug = 'inside-the-loft-sarah-chen';

INSERT INTO public.blog_article_tags (article_id, tag)
SELECT a.id, t.tag
FROM public.blog_articles a
CROSS JOIN (VALUES ('PROPS'), ('STYLING'), ('EDITORIAL')) AS t(tag)
WHERE a.slug = '5-essential-props-editorial-shoot';

INSERT INTO public.blog_article_tags (article_id, tag)
SELECT a.id, t.tag
FROM public.blog_articles a
CROSS JOIN (VALUES ('PLATFORM'), ('COMMUNITY'), ('INNOVATION')) AS t(tag)
WHERE a.slug = 'how-lcntships-changing-rental-game';

INSERT INTO public.blog_article_tags (article_id, tag)
SELECT a.id, t.tag
FROM public.blog_articles a
CROSS JOIN (VALUES ('SMALL SPACES'), ('TECHNICAL'), ('LIGHTING')) AS t(tag)
WHERE a.slug = 'maximizing-small-spaces';

-- Updated at trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for blog_articles
DROP TRIGGER IF EXISTS update_blog_articles_updated_at ON public.blog_articles;
CREATE TRIGGER update_blog_articles_updated_at
    BEFORE UPDATE ON public.blog_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
