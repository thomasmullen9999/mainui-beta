import type { Metadata } from "next";
export async function generateMetadata({
  params,
}: {
  params: {
    slug: string[];
  };
}): Promise<Metadata> {
  return {
    title: params.slug[0].charAt(0).toUpperCase() + params.slug[0].slice(1),
  };
}
interface MCMasterLayout {
  children: React.ReactNode;
}
export default function MCMasterLayout({ children }: MCMasterLayout) {
  return <>{children}</>;
}
