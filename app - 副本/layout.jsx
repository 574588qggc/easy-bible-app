import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  title: '简单圣经',
  description: '在线阅读圣经，包含旧约和新约',
  icons: {
    icon: '/favicon.ico'
  }
}

const banner = (
  <Banner storageKey="welcome-banner">
    🎉 欢迎使用简单圣经在线阅读平台
  </Banner>
)

const navbar = (
  <Navbar
    logo={<span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>📖 简单圣经</span>}
    projectLink="https://github.com/yourusername/easy-bible"
  />
)

const footer = (
  <Footer>
    <span>
      MIT {new Date().getFullYear()} © 简单圣经
    </span>
  </Footer>
)

export default async function RootLayout({ children }) {
  return (
    <html lang="zh-CN" dir="ltr" suppressHydrationWarning>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="简单圣经 - 在线阅读圣经" />
      </Head>
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/yourusername/easy-bible/tree/main"
          footer={footer}
          sidebar={{
            defaultMenuCollapseLevel: 1,
            toggleButton: true
          }}
          toc={{
            backToTop: true,
            title: '本页目录'
          }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}

