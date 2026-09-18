import Hero from './sections/Hero'
import Services from './sections/Services'
import Works from './sections/Works'
import Contact from './sections/Contact'

export default function App() {
  return (
    <div className="min-h-screen bg-black">
      <Hero />
      <Services />
      <Works />
      <Contact />
    </div>
  )
}
