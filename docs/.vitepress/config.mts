import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "SSO Portal Docs",
  description: "Dokumentasi Integrasi Single Sign-On",
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', href: '/sso_logo.png' }]
  ],
  themeConfig: {
    logo: '/sso_logo.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Panduan', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/endpoints' }
    ],

    sidebar: [
      {
        text: 'Pendahuluan',
        items: [
          { text: 'Memulai', link: '/guide/getting-started' },
          { text: 'Alur OAuth2 (Authorization Code)', link: '/guide/oauth-flow' }
        ]
      },
      {
        text: 'Referensi API',
        items: [
          { text: 'Endpoints SSO', link: '/api/endpoints' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Inur123/sso-v3' }
    ],

    footer: {
      message: 'Dirilis di bawah Lisensi MIT.',
      copyright: 'Copyright © 2026 Zainur Portal'
    }
  }
})
