import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true
})

export default withNextra({
  reactStrictMode: true,
  // Turbopack 配置
  turbopack: {
    resolveAlias: {
      'next-mdx-import-source-file': './mdx-components.tsx'
    }
  },
  // Cloudflare Pages 配置
  output: 'export',
  images: {
    unoptimized: true
  }
})

