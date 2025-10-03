/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_SECRET: "8OHhYWbkDu9Aj1G/W76K+jdXRzMCL5AnD0RMVNcbGxQ=",
  },
  reactStrictMode: false,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "v2ma.fairpayforall.co.uk",
      },
    ],
  },
  async rewrites() {
    return [
      /*       {
        source: "/justeat/:params*",
        destination: "/p/justeat/:params*",
      },
      {
        source: "/justeat",
        destination: "/p/justeat",
      },
      {
        source: "/j/:params*",
        destination: "/p/justeat/:params*",
      },
      {
        source: "/j",
        destination: "/p/justeat",
      }, */
      {
        source: "/sainsburys/:params*",
        destination: "/p/sainsburys/:params*",
      },
      {
        source: "/sainsburys",
        destination: "/p/sainsburys",
      },
      {
        source: "/s/:params*",
        destination: "/p/sainsburys/:params*",
      },
      {
        source: "/s",
        destination: "/p/sainsburys",
      },
      {
        source: "/morrisons/:params*",
        destination: "/p/morrisons/:params*",
      },
      {
        source: "/morrisons",
        destination: "/p/morrisons",
      },
      {
        source: "/m/:params*",
        destination: "/p/morrisons/:params*",
      },
      {
        source: "/m",
        destination: "/p/morrisons",
      },
      {
        source: "/asda/:params*",
        destination: "/p/asda/:params*",
      },
      {
        source: "/asda",
        destination: "/p/asda",
      },
      {
        source: "/a/:params*",
        destination: "/p/asda/:params*",
      },
      {
        source: "/a",
        destination: "/p/asda",
      },
      {
        source: "/coop/:params*",
        destination: "/p/coop/:params*",
      },
      {
        source: "/coop",
        destination: "/p/coop",
      },
      {
        source: "/c/:params*",
        destination: "/p/coop/:params*",
      },
      {
        source: "/c",
        destination: "/p/coop",
      },
      {
        source: "/next/:params*",
        destination: "/p/next/:params*",
      },
      {
        source: "/next",
        destination: "/p/next",
      },
      {
        source: "/n/:params*",
        destination: "/p/next/:params*",
      },
      {
        source: "/n",
        destination: "/p/next",
      },
      {
        source: "/bolt/:params*",
        destination: "/p/bolt/:params*",
      },
      {
        source: "/bolt",
        destination: "/p/bolt",
      },
      {
        source: "/b/:params*",
        destination: "/p/bolt/:params*",
      },
      {
        source: "/b",
        destination: "/p/bolt",
      },
    ];
  },
};

export default nextConfig;
