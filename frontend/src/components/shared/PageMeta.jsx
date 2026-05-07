import { Helmet } from 'react-helmet-async'

export default function PageMeta({
  title,
  description = 'Premium unstitched fabric — lawn, khaddar, cotton & more. Nationwide COD delivery.',
  image
}) {
  const fullTitle = title
    ? `${title} | Kapra Store`
    : 'Kapra Store — Premium Unstitched Fabric'

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
    </Helmet>
  )
}
