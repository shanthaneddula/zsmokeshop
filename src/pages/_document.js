import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Ensure proper viewport settings */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        
        {/* Prevent any external scripts or stylesheets that might be causing conflicts */}
        <meta name="next-head-count" content="3" />
      </Head>
      <body>
        {/* Only render Next.js components */}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
