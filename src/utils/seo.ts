export const seo = ({
  title,
  description,
  keywords,
  image,
  url
}: {
  title: string
  description?: string
  image?: string
  keywords?: string
  url?: string
}) => {
  const tags = [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:creator", content: "@zotodev" },
    { name: "twitter:site", content: "@zotodev" },
    { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
    { name: "og:type", content: "website" },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    ...(image
      ? [
          { name: "twitter:image", content: image },
          { name: "og:image", content: image },
          { name: "og:image:width", content: "1200" },
          { name: "og:image:height", content: "630" }
        ]
      : []),
    ...(url
      ? [
          { name: "twitter:url", content: url },
          { name: "og:url", content: url }
        ]
      : [])
  ]

  return tags
}
