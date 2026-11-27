import { ViteReactSSG } from 'vite-react-ssg'
import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import { Icon } from './components/Visuals.jsx'
import Home from './pages/Home.jsx'
import Service from './pages/Service.jsx'
import Services from './pages/Services.jsx'
import Abroad from './pages/Abroad.jsx'
import Contact from './pages/Contact.jsx'
import FAQ from './pages/FAQ.jsx'
import Projects from './pages/Projects.jsx'
import AdminPage from './admin/AdminPage.jsx'
import { BRAND, services } from './data/site.js'
import './styles.css'

function PageError() {
  return (
    <main className="page-error">
      <a className="logo" href="/">
        <span className="brand-mark"><Icon name="mark" /></span>
        <span>{BRAND.toUpperCase()}</span>
      </a>
      <h1>We couldn’t open this page</h1>
      <button className="btn" type="button" onClick={() => window.location.reload()}>Try again</button>
      <a href="/">Back to home</a>
    </main>
  )
}

// One real, pre-rendered page per route.
function siteRoutes() {
  return [{
    errorElement: <PageError />,
    children: [
      { path: '/admin', element: <AdminPage /> },
      {
        path: '/',
        element: <Layout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'services', element: <Services /> },
          { path: 'build-from-abroad', element: <Abroad /> },
          { path: 'contact', element: <Contact /> },
          { path: 'faq', element: <FAQ /> },
          { path: 'projects', element: <Projects /> },
          ...services.map((s) => ({ path: s.slug, element: <Service slug={s.slug} /> })),
        ],
      },
    ],
  }]
}

export const routes = siteRoutes()
export const createRoot = ViteReactSSG({
  routes,
  // Vite React SSG adds manifest loaders to its routes. These pages already
  // have their data in the app, so use fresh routes for browser navigation.
  customCreateRouter: (_ssgRoutes, options) => createBrowserRouter(siteRoutes(), options),
})
