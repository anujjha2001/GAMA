import { Metadata } from "next";
import DevicesHubClient from "./DevicesHubClient";

export const metadata: Metadata = {
  title: "Devices Hub | GAMA",
  description: "Connect, manage and monitor all your health devices in one place.",
};

export default function DevicesHubPage() {
  return <DevicesHubClient />;
}
