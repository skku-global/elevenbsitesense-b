import { ViteReactSSG } from 'vite-react-ssg'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Service from './pages/Service.jsx'
import Services from './pages/Services.jsx'
import Abroad from './pages/Abroad.jsx'
import Contact from './pages/Contact.jsx'
import FAQ from './pages/FAQ.jsx'
import Projects from './pages/Projects.jsx'
import AdminPage from './admin/AdminPage.jsx'
import { services } from './data/site.js'
import './styles.css'

// One real, pre-rendered page per route.
export const routes = [
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
]

export const createRoot = ViteReactSSG({ routes })
