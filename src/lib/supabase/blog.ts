import { createClient } from './server'

export interface BlogAuthor {
  id: string
  name: string
  role: string | null
  avatar_url: string | null
}

export interface BlogArticle {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  category: string
  category_slug: string
  cover_image: string | null
  read_time: string | null
  is_featured: boolean
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  author: BlogAuthor | null
  tags: string[]
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  order_index: number
}

/**
 * Get all published blog articles
 */
export async function getBlogArticles(): Promise<BlogArticle[]> {
  const supabase = await createClient()

  const { data: articles, error } = await supabase
    .from('blog_articles')
    .select(`
      *,
      author:blog_authors(id, name, role, avatar_url)
    `)
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog articles:', error)
    return []
  }

  // Fetch tags for all articles
  const articleIds = articles.map(a => a.id)
  const { data: tagsData } = await supabase
    .from('blog_article_tags')
    .select('article_id, tag')
    .in('article_id', articleIds)

  // Map tags to articles
  const tagsMap = new Map<string, string[]>()
  tagsData?.forEach(t => {
    const existing = tagsMap.get(t.article_id) || []
    tagsMap.set(t.article_id, [...existing, t.tag])
  })

  return articles.map(article => ({
    ...article,
    tags: tagsMap.get(article.id) || []
  }))
}

/**
 * Get featured article
 */
export async function getFeaturedArticle(): Promise<BlogArticle | null> {
  const supabase = await createClient()

  const { data: article, error } = await supabase
    .from('blog_articles')
    .select(`
      *,
      author:blog_authors(id, name, role, avatar_url)
    `)
    .eq('is_published', true)
    .eq('is_featured', true)
    .single()

  if (error || !article) {
    return null
  }

  // Fetch tags
  const { data: tagsData } = await supabase
    .from('blog_article_tags')
    .select('tag')
    .eq('article_id', article.id)

  return {
    ...article,
    tags: tagsData?.map(t => t.tag) || []
  }
}

/**
 * Get article by slug
 */
export async function getArticleBySlug(slug: string): Promise<BlogArticle | null> {
  const supabase = await createClient()

  const { data: article, error } = await supabase
    .from('blog_articles')
    .select(`
      *,
      author:blog_authors(id, name, role, avatar_url)
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !article) {
    return null
  }

  // Fetch tags
  const { data: tagsData } = await supabase
    .from('blog_article_tags')
    .select('tag')
    .eq('article_id', article.id)

  return {
    ...article,
    tags: tagsData?.map(t => t.tag) || []
  }
}

/**
 * Get related articles (excluding current article)
 */
export async function getRelatedArticles(currentSlug: string, limit: number = 3): Promise<BlogArticle[]> {
  const supabase = await createClient()

  const { data: articles, error } = await supabase
    .from('blog_articles')
    .select(`
      *,
      author:blog_authors(id, name, role, avatar_url)
    `)
    .eq('is_published', true)
    .neq('slug', currentSlug)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching related articles:', error)
    return []
  }

  // Fetch tags for all articles
  const articleIds = articles.map(a => a.id)
  const { data: tagsData } = await supabase
    .from('blog_article_tags')
    .select('article_id, tag')
    .in('article_id', articleIds)

  const tagsMap = new Map<string, string[]>()
  tagsData?.forEach(t => {
    const existing = tagsMap.get(t.article_id) || []
    tagsMap.set(t.article_id, [...existing, t.tag])
  })

  return articles.map(article => ({
    ...article,
    tags: tagsMap.get(article.id) || []
  }))
}

/**
 * Get all blog categories
 */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching blog categories:', error)
    return []
  }

  return categories
}

/**
 * Get all article slugs (for static generation)
 */
export async function getAllArticleSlugs(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blog_articles')
    .select('slug')
    .eq('is_published', true)

  if (error) {
    console.error('Error fetching article slugs:', error)
    return []
  }

  return data.map(a => a.slug)
}
