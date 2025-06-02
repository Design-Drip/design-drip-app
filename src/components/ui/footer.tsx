import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Design Drip</h3>
            <p className="text-sm text-muted-foreground">
              Your one-stop shop for unique and stylish apparel designs.
            </p>
            <div className="flex space-x-4 pt-2">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Facebook size={18} />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Instagram size={18} />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Twitter size={18} />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/products/t-shirts"
                  className="text-muted-foreground hover:text-foreground"
                >
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link
                  href="/products/hoodies"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Hoodies
                </Link>
              </li>
              <li>
                <Link
                  href="/products/sweatshirts"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Sweatshirts
                </Link>
              </li>
              <li>
                <Link
                  href="/new-arrivals"
                  className="text-muted-foreground hover:text-foreground"
                >
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Customer Care</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Design Drip. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
