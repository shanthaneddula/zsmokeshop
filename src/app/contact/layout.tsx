import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Z Smoke Shop Austin',
  description:
    'Contact Z Smoke Shop at 719 W William Cannon Dr in Austin, TX. Call (512) 227-9820 or send a message. 21+ only, in-store sales only.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
