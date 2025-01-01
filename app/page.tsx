'use client'

import { TaxComparisonChart } from "@/components/TaxComparisonChart";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start sm:justify-start md:justify-center p-4 sm:p-8 md:p-12 lg:p-24">
      <div className="w-full max-w-[1500px] mb-4 sm:mb-8 md:-mt-4 sm:-mt-8 hidden md:block">
        <Button asChild className="float-right text-xs sm:text-sm">
          <Link href="https://github.com/renchris/tax-chart" target="_blank" rel="noopener noreferrer">
            <Star className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Star on GitHub
          </Link>
        </Button>
      </div>
      <div className="flex justify-center w-full">
        <div className="flex flex-col items-center max-w-[1500px] w-full">
          <div className="w-full h-full mb-12 lg:mb-0 lg:hidden">
            <TaxComparisonChart />
          </div>
          <div className="flex flex-col lg:flex-row items-center w-full">
            <div className="w-full lg:w-1/3 lg:pr-8 mb-6 lg:mb-0">
              <ul className="list-disc space-y-2 font-mono text-xs sm:text-sm pl-4">
                <li>Built with <pre className="bg-muted p-1 rounded inline">shadcn charts</pre> / <pre className="bg-muted p-1 rounded inline">recharts</pre></li>
                <li>Compare Canadian and US tax systems</li>
                <li>Canadian tax includes Federal and BC Provincial</li>
                <li>US tax shows Federal tax only</li>
                <li>All amounts in CAD (1 USD = 1.44 CAD)</li>
              </ul>
              <div className="border-t mt-4 pt-4 text-left text-xs sm:text-sm text-foreground">
                made by <Link href="https://github.com/renchris" target="_blank" rel="noopener noreferrer"><u>renchris</u></Link>
              </div>
            </div>
            <div className="w-full lg:w-2/3 h-full hidden lg:block">
              <TaxComparisonChart />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center mt-6 md:hidden">
        <Button asChild className="text-xs sm:text-sm">
          <Link href="https://github.com/renchris/tax-chart" target="_blank" rel="noopener noreferrer">
            <Star className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Star on GitHub
          </Link>
        </Button>
      </div>
    </main>
  );
}
