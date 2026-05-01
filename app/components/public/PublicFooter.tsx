import Link from 'next/link';
import { Globe, Image, BriefcaseBusiness, Mail, Phone, MessageCircle } from 'lucide-react';
import NextImage from 'next/image';

export function PublicFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <NextImage
              src="/zafirix-logo.png"
              alt="ZAFIRIX PRO"
              width={140}
              height={40}
              className="h-9 w-auto"
            />
            <p className="text-sm text-gray-500 mt-2 max-w-md">
              Plateforme SaaS de comptabilité, facturation et fiscalité au Maroc — pensée pour les PME, cabinets et groupes.
              تجربة حديثة، سهلة، ومهنية.
            </p>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                <a className="hover:underline" href="mailto:contact@zafirix.group">contact@zafirix.group</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                <a className="hover:underline" href="tel:+212600000000">+212 6 00 00 00 00</a>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">Liens rapides</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><Link className="hover:text-gray-900" href="/pricing">Pricing</Link></li>
              <li><Link className="hover:text-gray-900" href="/login">Login</Link></li>
              <li><Link className="hover:text-gray-900" href="/signup">Sign Up</Link></li>
              <li><a className="hover:text-gray-900" href="mailto:contact@zafirix.group">Contact</a></li>
              <li><Link className="hover:text-gray-900" href="/terms">Terms of Service</Link></li>
              <li><Link className="hover:text-gray-900" href="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">Social</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50" href="#" aria-label="Facebook">
                <Globe size={16} /> Facebook
              </a>
              <a className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50" href="#" aria-label="Instagram">
                <Image size={16} /> Instagram
              </a>
              <a className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50" href="#" aria-label="LinkedIn">
                <BriefcaseBusiness size={16} /> LinkedIn
              </a>
              <a className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50" href="https://wa.me/212600000000" aria-label="WhatsApp">
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} ZAFIRIX GROUP. Tous droits réservés.</span>
          <span>Maroc · Comptabilité · Fiscalité · Facturation</span>
        </div>
      </div>
    </footer>
  );
}

