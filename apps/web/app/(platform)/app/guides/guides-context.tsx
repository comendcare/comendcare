import React, { createContext, useContext, useEffect, useState } from 'react'
import { getNotionDatabaseAndContents } from '@/lib/notion' // adjust import
import { Blog } from '@/components/layout/sections/news'

const GuidesContext = createContext<{ guides: Blog[] }>({ guides: [] })

export const GuidesProvider = ({ children }: { children: React.ReactNode }) => {
  const [guides, setGuides] = useState<Blog[]>([])

  useEffect(() => {
    const init = async () => {
    const faqDBKey = '1f3801a6fddc8010b610f8175f5cccf9'
    const { pages } = await getNotionDatabaseAndContents(faqDBKey, {
        sorts: [{ property: 'Order', direction: 'ascending' }],
    })

    const filteredPages: Blog[] = pages
        .map((page: any) => {
            if (
                process.env.NEXT_PUBLIC_NODE_ENV === 'production' &&
                page?.properties?.['Status']?.status?.name !== 'Published (in production)'
            ) {
                return null
            }

            const title = page?.properties?.['Name']?.title
                ?.map((text: any) => text?.plain_text)
                ?.join(' ')
            const description = page?.properties?.['Description']?.rich_text
                ?.map((text: any) => text?.plain_text)
                ?.join('\n')
            const slug = `/app/guides/${page.id}`
            const image = page?.cover?.external?.url || page?.cover?.file?.url || ''
            const author = page?.properties?.['Author']?.people?.[0]?.name
            const authorAvatar = page?.properties?.['Author']?.people?.[0]?.avatar_url
            const publishDate = new Date(page?.properties?.['Publication Date']?.date?.start)
            const section = page?.properties?.['Section']?.select?.name

            if (!title || !slug || !author || !authorAvatar || !publishDate) return null
            return {
                title,
                description: description || '',
                slug,
                image,
                author,
                authorAvatar,
                date: publishDate,
                section,
            }
            })
        .filter((page) => page !== null)
        .sort((a, b) => b!.date.valueOf() - a!.date.valueOf()) as Blog[]

        setGuides(filteredPages)
    }

    init()
  }, [])

  return <GuidesContext.Provider value={{ guides }}>{children}</GuidesContext.Provider>
}

export const useGuides = () => useContext(GuidesContext)