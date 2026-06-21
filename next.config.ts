import type { NextConfig } from "next";
import { withDomscribe } from "@domscribe/next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default process.env.NODE_ENV === "development"
  ? withDomscribe()(nextConfig)
  : nextConfig;
