import { createFileRoute } from "@tanstack/react-router"
import { Footer } from "@/components/home-page/footer"
import { Features } from "@/components/home-page/sections/features"
import { Hero } from "@/components/home-page/sections/hero"
import { Pricing } from "@/components/home-page/sections/pricing"
import { Products } from "@/components/home-page/sections/products"
import { TopNav } from "@/components/home-page/top-nav"

export const Route = createFileRoute("/")({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div
      className={`min-h-screen overflow-x-hidden bg-background text-foreground antialiased [background-image:linear-gradient(hsl(var(--border)/0.05)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.05)_1px,transparent_1px)] [background-size:64px_64px]`}
    >
      <TopNav />
      <Hero />
      <Features />
      <Products />
      <Pricing />
      <Footer />
    </div>
  )
}
