import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ExportCSV() {
  return (
    <>
      Export{" "}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Button
          asChild
          className="flex h-auto flex-col items-center justify-center px-4 py-4 text-center"
        >
          <Link href="/api/exportcsv?campaign=morrisons">
            Export Morrisons nurture
          </Link>
        </Button>

        <Button
          asChild
          className="flex h-auto flex-col items-center justify-center px-4 py-4 text-center"
        >
          <a
            href="/api/exportnurtures?campaign=sainsburys"
            target="_blank"
            rel="noopener noreferrer"
          >
            Export all Sainsburys nurtures
          </a>
        </Button>

        <Button
          asChild
          className="flex h-auto flex-col items-center justify-center px-4 py-4 text-center"
        >
          <Link href="/api/exportcsv?campaign=asda">Export Asda nurture</Link>
        </Button>

        <Button
          asChild
          className="flex h-auto flex-col items-center justify-center px-4 py-4 text-center"
        >
          <Link href="/api/exportcsv?campaign=coop">Export Coop nurture</Link>
        </Button>

        <Button
          asChild
          className="flex h-auto flex-col items-center justify-center px-4 py-4 text-center"
        >
          <Link href="/api/exportcsv?campaign=next">Export Next nurture</Link>
        </Button>

        <Button
          asChild
          className="flex h-auto flex-col items-center justify-center px-4 py-4 text-center"
        >
          <a
            href="/api/exportnurtures?campaign=justeat"
            target="_blank"
            rel="noopener noreferrer"
          >
            Export all JustEat nurtures
          </a>
        </Button>

        <Button
          asChild
          className="flex h-auto flex-col items-center justify-center px-4 py-4 text-center"
        >
          <Link href="/api/exportcsv?campaign=bolt">Export Bolt nurture</Link>
        </Button>
      </div>
    </>
  );
}
