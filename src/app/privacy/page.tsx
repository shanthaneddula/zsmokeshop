import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { LegalSection, LEGAL_ADDRESS, LEGAL_EMAIL, LEGAL_PHONE } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Z Smoke Shop collects, uses and protects personal information, and how to use your privacy rights.',
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <LegalSection title="Who we are">
        <p>
          Z Smoke Shop (&quot;we&quot;, &quot;us&quot;) runs retail stores in Austin, Texas and this website. This website is a
          product catalog only: we do not sell, ship or deliver anything online. This policy explains what personal
          information we collect through the website and our stores&apos; digital services, how we use it, and the rights you
          have, including under the Texas Data Privacy and Security Act (TDPSA).
        </p>
      </LegalSection>

      <LegalSection title="Information we collect">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Age confirmation.</strong> When you confirm you are 21 or older, your browser stores that answer for the
            current session (session storage). We do not receive or keep it.
          </li>
          <li>
            <strong>Messages you send us.</strong> If you email, call, or use the website chat, we receive what you choose to
            share, such as your name, phone number, email address and your message. The chat is provided by Tawk.to, which
            processes chat messages for us.
          </li>
          <li>
            <strong>Past pickup orders.</strong> Before online ordering was turned off, customers who placed pickup orders gave
            us a name, phone number and/or email address and the items ordered. We keep these records only as long as needed
            for business, tax and legal purposes.
          </li>
          <li>
            <strong>Text messages.</strong> If you agreed to receive order text messages, we used your phone number only for
            those messages. See our <a href="/sms-terms.html" className="underline">SMS Terms</a>.
          </li>
          <li>
            <strong>Technical data.</strong> Our hosting provider and services automatically process basic technical data
            (such as IP address, browser type and pages requested) to deliver and secure the website.
          </li>
        </ul>
        <p>
          We do not collect sensitive personal data (as defined by the TDPSA) through this website, and we do not knowingly
          collect information from anyone under 21.
        </p>
      </LegalSection>

      <LegalSection title="How we use information">
        <ul className="list-disc pl-5 space-y-2">
          <li>To answer your questions and provide customer service.</li>
          <li>To run, secure and improve the website.</li>
          <li>To keep records required by law and to protect our legal rights.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Sale, targeted advertising and sharing">
        <p>
          <strong>We do not sell personal data, and we do not use it for targeted advertising or for profiling</strong> that
          produces legal or similarly significant effects. We share personal data only with service providers that process it
          for us under contract: Vercel (website hosting), Redis Cloud (data storage), Tawk.to (live chat), Resend (email) and
          Twilio (text messages), or when the law requires it. Phone numbers and text-message opt-in consent are never shared
          with third parties for their marketing.
        </p>
      </LegalSection>

      <LegalSection title="Your privacy rights (Texas residents)">
        <p>Subject to the TDPSA, you can ask us to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>confirm whether we process your personal data and give you access to it;</li>
          <li>correct inaccurate personal data;</li>
          <li>delete personal data you provided or that we have about you;</li>
          <li>give you a copy of your personal data in a portable format; and</li>
          <li>opt out of the sale of personal data, targeted advertising, or profiling (we do none of these).</li>
        </ul>
        <p>
          To make a request, email <a href={`mailto:${LEGAL_EMAIL}`} className="underline">{LEGAL_EMAIL}</a> with the subject
          &quot;Privacy request&quot;, or call {LEGAL_PHONE}. We may need to verify your identity. We will respond within 45 days
          (we may extend once by another 45 days if reasonably necessary and will tell you why). We will not discriminate
          against you for using your rights.
        </p>
        <p>
          <strong>Appeals.</strong> If we decline your request, you can appeal by replying to our decision or emailing{' '}
          {LEGAL_EMAIL} with the subject &quot;Privacy appeal&quot; within a reasonable time. We will respond to an appeal within
          60 days. If you are not satisfied, you can contact the Texas Attorney General at{' '}
          <a href="https://www.texasattorneygeneral.gov/consumer-protection" className="underline" rel="noopener noreferrer" target="_blank">
            texasattorneygeneral.gov
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Retention and security">
        <p>
          We keep personal data only as long as needed for the purposes above or as required by law, then delete it. We use
          reasonable administrative, technical and physical safeguards to protect it. No method of transmission or storage is
          completely secure.
        </p>
      </LegalSection>

      <LegalSection title="Changes and contact">
        <p>
          We may update this policy and will change the date above when we do. Questions:{' '}
          <a href={`mailto:${LEGAL_EMAIL}`} className="underline">{LEGAL_EMAIL}</a>, {LEGAL_PHONE}, or {LEGAL_ADDRESS}. See also our{' '}
          <Link href="/terms" className="underline">Terms of Use</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
