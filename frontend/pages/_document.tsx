import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Preconnect to image domains */}
          <link rel="preconnect" href="https://picsum.photos" />
          <link rel="dns-prefetch" href="https://picsum.photos" />
          
          {/* Font optimization */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          
          {/* Critical CSS could be inlined here */}
          <style dangerouslySetInnerHTML={{ __html: `
            /* Critical CSS for immediate rendering */
            html, body {
              overflow-x: hidden;
              height: 100%;
              width: 100%;
              margin: 0;
              padding: 0;
            }
            
            /* Prevent content jumps */
            body {
              display: block;
              min-height: 100vh;
              position: relative;
            }
            
            /* Prevent layout shifts by reserving space for key elements */
            .hero-placeholder {
              background-color: #f3f4f6;
              width: 100%;
              height: 500px;
              position: relative;
              z-index: 10;
              aspect-ratio: 3/1;
              contain: layout size;
            }
            
            .img-placeholder {
              background-color: #e5e7eb;
              aspect-ratio: 16/9;
              contain: layout size;
            }
            
            /* Create stable image containers */
            img, [class*="Image_"] {
              height: auto;
              max-width: 100%;
              object-fit: contain;
            }
            
            /* Force images to maintain aspect ratio */
            .image-container {
              position: relative;
              contain: layout style;
            }
            
            /* Prevent image flash during load */
            main > * {
              opacity: 0;
              animation: fadeIn 0.15s ease-in forwards;
              animation-delay: 0.05s;
            }
            main > *:first-child {
              opacity: 1;
              animation: none;
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 