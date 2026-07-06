import type { NextConfig } from "next";
import os from "os";

const lanIps = Object.values(os.networkInterfaces())
  .flat()
  .filter(
    (iface): iface is os.NetworkInterfaceInfo =>
      iface !== undefined && !iface.internal && iface.family === "IPv4"
  )
  .map((iface) => iface.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: lanIps,
};

export default nextConfig;
