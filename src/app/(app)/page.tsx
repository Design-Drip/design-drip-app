import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FeaturedProducts } from "@/components/products/FeaturedProducts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design Drip - Custom Apparel Design Made Easy",
  description: "Create unique, custom designs for your clothing with our powerful design tools and high-quality printing services. Start designing your dream apparel today!",
  openGraph: {
    title: "Design Drip - Custom Apparel Design Made Easy",
    description: "Create unique, custom designs for your clothing with our powerful design tools and high-quality printing services.",
    images: ["/auth-bg.jpg"],
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/auth-bg.jpg"
            alt="Hero background"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl font-bold mb-6">Design Your Dream Apparel</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Create unique, custom designs for your clothing with our powerful design
            tools and high-quality printing services.
          </p>
          {/* <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100">
              <Link href="/designer/new">Start Designing</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div> */}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white w-full">
        <div className="max-w-none mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-gray-600">Designs Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100+</div>
              <div className="text-gray-600">Product Styles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 w-full">
        <div className="max-w-none mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Design Drip?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center transition-transform hover:scale-105">
              <div className="mb-4">
                <svg
                  className="w-12 h-12 mx-auto text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy-to-Use Designer</h3>
              <p className="text-gray-600">
                Our intuitive design tools make it simple to create professional-looking designs.
              </p>
            </Card>
            <Card className="p-6 text-center transition-transform hover:scale-105">
              <div className="mb-4">
                <svg
                  className="w-12 h-12 mx-auto text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                High-quality materials and printing techniques for long-lasting results.
              </p>
            </Card>
            <Card className="p-6 text-center transition-transform hover:scale-105">
              <div className="mb-4">
                <svg
                  className="w-12 h-12 mx-auto text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Quick turnaround times and reliable shipping to get your designs to you fast.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <FeaturedProducts />

      {/* Design Showcase Section */}
      {/* <section className="py-20 bg-gray-50 w-full">
        <div className="max-w-none mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Design Templates</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="overflow-hidden group cursor-pointer">
              <div className="aspect-square relative">
                <Image
                  src="/shirt-placeholder.webp"
                  alt="Design template"
                  fill
                  className="object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary">Use Template</Button>
                </div>
              </div>
            </Card>
            <Card className="overflow-hidden group cursor-pointer">
              <div className="aspect-square relative">
                <Image
                  src="/shirt-placeholder.webp"
                  alt="Design template"
                  fill
                  className="object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary">Use Template</Button>
                </div>
              </div>
            </Card>
            <Card className="overflow-hidden group cursor-pointer">
              <div className="aspect-square relative">
                <Image
                  src="/shirt-placeholder.webp"
                  alt="Design template"
                  fill
                  className="object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary">Use Template</Button>
                </div>
              </div>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Button asChild size="lg">
              <Link href="/designer/new">Start Designing</Link>
            </Button>
          </div>
        </div>
      </section> */}

      {/* Testimonials Section */}
      <section className="py-20 w-full">
        <div className="max-w-none mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  JD
                </div>
                <div className="ml-4">
                  <div className="font-semibold">John Doe</div>
                  <div className="text-sm text-gray-500">Verified Customer</div>
                </div>
              </div>
              <p className="text-gray-600">
                "The design tools are incredibly intuitive, and the quality of the prints exceeded my expectations. Highly recommended!"
              </p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  JS
                </div>
                <div className="ml-4">
                  <div className="font-semibold">Jane Smith</div>
                  <div className="text-sm text-gray-500">Verified Customer</div>
                </div>
              </div>
              <p className="text-gray-600">
                "Fast delivery and amazing customer service. The team helped me perfect my design. Will definitely order again!"
              </p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  MJ
                </div>
                <div className="ml-4">
                  <div className="font-semibold">Mike Johnson</div>
                  <div className="text-sm text-gray-500">Verified Customer</div>
                </div>
              </div>
              <p className="text-gray-600">
                "Created custom team jerseys for our sports club. The quality is outstanding and everyone loves them!"
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-primary text-white w-full">
        <div className="max-w-none mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Create Your Custom Design?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have brought their design ideas to life.
          </p>
          <Button asChild size="lg" variant="secondary" className="hover:scale-105 transition-transform">
            <Link href="/sign-up">Get Started Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
} 