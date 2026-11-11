import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { LegalSection, LEGAL_ADDRESS, LEGAL_EMAIL, LEGAL_PHONE } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms for using the Z Smoke Shop website: 21+ only, catalog only, in-store sales.',
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use">
      <LegalSection title="Acceptance">
        <p>
          By using zsmokeshop.com you agree to these terms and our{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>. If you do not agree, please do not use the website.
        </p>
      </LegalSection>

      <LegalSection id="age-requirement" title="21+ only">
        <p>
          This website and our stores are only for adults 21 and older. By using the website you confirm you are at least 21.
          Under Texas and federal law, tobacco products, e-cigarettes and related products may only be sold to people 21 or
          older, and we check a valid government-issued photo ID for every purchase, regardless of age.
        </p>
      </LegalSection>

      <LegalSection title="Catalog only, no online sales">
        <p>
          The website is an informational catalog. We do not sell, ship or deliver any product online, and nothing on the
          website is an offer to sell. Products, brands, flavors and options shown may not be in stock at every location and
          can change without notice. Call a store to check availability. Product images and names come from the brands and
          are for reference only.
        </p>
      </LegalSection>

      <LegalSection title="Lawful use of products">
        <p>
          Accessories such as glass, grinders, nectar collectors and quartz are sold for use with legal tobacco and legal
          botanical products only. We do not sell products for any illegal purpose and may refuse any sale.
        </p>
        <p>
          WARNING: Nicotine products contain nicotine. Nicotine is an addictive chemical. Hemp/CBD product statements have not
          been evaluated by the FDA; those products are not intended to diagnose, treat, cure, or prevent any disease.
        </p>
      </LegalSection>

      <LegalSection title="Text messages">
        <p>
          Any text-message program is described in our <a href="/sms-terms.html" className="underline">SMS Terms</a>. Reply STOP
          to stop messages and HELP for help. Message and data rates may apply.
        </p>
      </LegalSection>

      <LegalSection title="Website content and use">
        <p>
          Website content is provided &quot;as is&quot; without warranties of any kind, to the extent the law allows. You agree not
          to misuse the website, try to access areas you are not authorized to use, or interfere with its operation. Trademarks
          belong to their owners.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <p>
          To the extent the law allows, Z Smoke Shop is not liable for indirect or consequential damages arising from use of the
          website. Nothing in these terms limits rights you have under Texas law that cannot be waived.
        </p>
      </LegalSection>

      <LegalSection title="Governing law, changes and contact">
        <p>
          These terms are governed by the laws of the State of Texas. We may update them and will change the date above when we
          do. Questions: <a href={`mailto:${LEGAL_EMAIL}`} className="underline">{LEGAL_EMAIL}</a>, {LEGAL_PHONE}, or {LEGAL_ADDRESS}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
