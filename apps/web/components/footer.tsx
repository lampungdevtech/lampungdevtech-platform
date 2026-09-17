import { Link } from '@/i18n/routing';
import { Github, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';
import { FaTelegramPlane } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import Threads from '@/components/icons/threads';
import { useTranslations } from 'next-intl';

const Footer = () => {
  const t = useTranslations('footer');

  return (
    <footer className="bg-primary text-primary-foreground w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-2xl font-bold">LampungDevTech</h3>
            <p className="text-primary-foreground/80">
              {t('description')}
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://github.com/lampungdevtech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-foreground/80"
                  aria-label="GitHub LampungDevTech"
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
                  aria-label="Twitter LampungDevTech"
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
                  aria-label="LinkedIn LampungDevTech"
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
                  aria-label="Telegram LampungDevTech"
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
                  aria-label="Instagram LampungDevTech"
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
                  aria-label="Threads LampungDevTech"
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
                  aria-label="YouTube LampungDevTech"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </Button>
            </div>
            <p className="text-sm text-primary-foreground/80">
              {t('rights')}
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold mb-4">{t('community')}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary-foreground/80"
                >
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link
                  href="/vision-mission"
                  className="hover:text-primary-foreground/80"
                >
                  {t('visionMission')}
                </Link>
              </li>
              <li>
                <Link
                  href="/partners"
                  className="hover:text-primary-foreground/80"
                >
                  {t('partners')}
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-primary-foreground/80">
                  {t('jobs')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold mb-4">{t('resources')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="hover:text-primary-foreground/80">
                  {t('blog')}
                </Link>
              </li>
              <li>
                <Link
                  href="/showcase"
                  className="hover:text-primary-foreground/80"
                >
                  {t('showcase')}
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="hover:text-primary-foreground/80"
                >
                  {t('resourceLinks')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold mb-4">{t('legal')}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/code-of-conduct"
                  className="hover:text-primary-foreground/80"
                >
                  {t('codeOfConduct')}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary-foreground/80"
                >
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary-foreground/80"
                >
                  {t('terms')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold mb-4">{t('contact')}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary-foreground/80"
                >
                  {t('contactLink')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-foreground/80">
                  {t('faq')}
                </Link>
              </li>
              <li>
                <Link
                  href="/sponsor"
                  className="hover:text-primary-foreground/80"
                >
                  {t('sponsor')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <p className="text-center text-primary-foreground/80">
            {t('openSourceText')}{` `}
            <a
              href="https://github.com/lampungdevtech/lampungdevtech-platform"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-foreground hover:underline"
            >
              {t('openSourceLink')}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
