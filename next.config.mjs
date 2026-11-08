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
    ],
  },
};

export default nextConfig;