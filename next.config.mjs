/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/admin/dashboard",
        permanent: true,
      },
      {
        source: "/dashboard",
        destination: "/admin/dashboard",
        permanent: true,
      },
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: true,
      },
    ];
  },
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination: "http://10.10.28.21:5080/api/:path*", // Proxy to Backend
      },
    ];
  },
  images: {
    domains: [
      "i.ibb.co.com",
      "clinica-admin.s3.eu-north-1.amazonaws.com",
      "lh3.googleusercontent.com",
      "abdullah-sta.s3.eu-north-1.amazonaws.com",
      "alan-apps-storage-323884515383-eu-west-2-an.s3.eu-west-2.amazonaws.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;