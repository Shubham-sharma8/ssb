import { MinimalLoader } from "@/components/aceternity/MinimalLoader";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <MinimalLoader
        fullScreen
        label="Loading SSB Practice Module..."
        sublabel="ssb.cogify.me • Psychology • GTO • Personal Interview"
      />
    </div>
  );
}
