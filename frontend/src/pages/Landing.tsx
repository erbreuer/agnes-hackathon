import { Hero } from '../components/landing/Hero'
import { BeforeAfterSlider } from '../components/landing/BeforeAfterSlider'
import { HowItWorks } from '../components/landing/HowItWorks'
import { Shoppable } from '../components/landing/Shoppable'
import { ValueGrid } from '../components/landing/ValueGrid'
import { StatsBand } from '../components/landing/StatsBand'
import { FinalCTA } from '../components/landing/FinalCTA'

export default function Landing() {
  return (
    <>
      <Hero />
      <BeforeAfterSlider />
      <HowItWorks />
      <Shoppable />
      <ValueGrid />
      <StatsBand />
      <FinalCTA />
    </>
  )
}
