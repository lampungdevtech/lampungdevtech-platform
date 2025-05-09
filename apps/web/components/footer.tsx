import Link from 'next/link';
import { Github, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';
import { FaTelegramPlane } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import Threads from '@/components/icons/threads';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-2xl font-bold">LampungDevTech</h3>
            <p className="text-primary-foreground/80">
              Komunitas developer teknologi di Lampung untuk berbagi
              pengetahuan, pengalaman, dan kesempatan.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://github.com/lampungdevtech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-foreground/80"
                >
                  <Github className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://twitter.com/lampungdevtech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-foreground/80"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://linkedin.com/company/lampungdevtech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-foreground/80"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://t.me/lampungdevtech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-foreground/80"
                >
                  <FaTelegramPlane className="h-5 w-5" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="hover:text-accent-foreground/80"
              >
                <a
                  href="https://instagram.com/lampungdevtech"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="hover:text-accent-foreground/80"
              >
                <a
                  href="https://www.threads.net/@lampungdevtech"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Threads className="h-5 w-5" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="hover:text-accent-foreground/80"
              >
                <a
                  href="https://www.youtube.com/@lampungdevtech"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </Button>
            </div>
            <p className="text-sm text-primary-foreground/80">
              © 2025 LampungDevTech. All rights reserved.
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold mb-4">Komunitas</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary-foreground/80"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link
                  href="/vision-mission"
                  className="hover:text-primary-foreground/80"
                >
                  Visi & Misi
                </Link>
              </li>
              <li>
                <Link
                  href="/partners"
                  className="hover:text-primary-foreground/80"
                >
                  Mitra Komunitas
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-primary-foreground/80">
                  Lowongan
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold mb-4">Sumber Daya</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="hover:text-primary-foreground/80">
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/showcase"
                  className="hover:text-primary-foreground/80"
                >
                  Showcase
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="hover:text-primary-foreground/80"
                >
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/code-of-conduct"
                  className="hover:text-primary-foreground/80"
                >
                  Kode Etik
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary-foreground/80"
                >
                  Privasi
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary-foreground/80"
                >
                  Ketentuan
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold mb-4">Hubungi Kami</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary-foreground/80"
                >
                  Kontak
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-foreground/80">
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/sponsor"
                  className="hover:text-primary-foreground/80"
                >
                  Sponsor
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <p className="text-center text-primary-foreground/80">
            Situs web lampungdev.tech ini {` `}
            <a
              href="https://github.com/lampungdevtech/lampungdevtech-platform"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-foreground hover:underline"
            >
              bersumber terbuka di GitHub
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
