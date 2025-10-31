export default {
  logo: <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>📖 简单圣经</span>,
  project: {
    link: 'https://github.com/yourusername/easy-bible'
  },
  docsRepositoryBase: 'https://github.com/yourusername/easy-bible/tree/main',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – 简单圣经'
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="简单圣经 - 在线阅读圣经" />
      <meta name="og:title" content="简单圣经" />
      <meta name="og:description" content="在线阅读圣经，包含旧约和新约" />
    </>
  ),
  banner: {
    key: 'welcome-banner',
    text: (
      <span>
        🎉 欢迎使用简单圣经在线阅读平台
      </span>
    )
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true
  },
  footer: {
    text: (
      <span>
        MIT {new Date().getFullYear()} © 简单圣经
      </span>
    )
  },
  editLink: {
    text: '在 GitHub 上编辑此页 →'
  },
  feedback: {
    content: '有问题？给我们反馈 →',
    labels: 'feedback'
  },
  toc: {
    backToTop: true,
    title: '本页目录'
  },
  search: {
    placeholder: '搜索圣经内容...'
  },
  navigation: {
    prev: true,
    next: true
  },
  darkMode: true,
  primaryHue: {
    dark: 200,
    light: 210
  }
}

