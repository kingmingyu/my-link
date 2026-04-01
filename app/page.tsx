import { DUMMY_LINKS } from "@/data/links";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { RiExternalLinkLine, RiLinkM } from "@remixicon/react";

export default function Page() {
  const visibleLinks = DUMMY_LINKS.filter(link => link.isActive).sort((a, b) => a.order - b.order);

  return (
    <div className="flex min-h-dvh flex-col items-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md mt-10">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold tracking-tight">MyLink Profile</h1>
          <p className="text-muted-foreground mt-2">Check out my links below!</p>
        </div>
        
        <div className="flex flex-col gap-4">
          {visibleLinks.map((link) => (
            <Link 
              key={link.id} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl outline-none"
            >
              <Card className="overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      {link.faviconUrl ? (
                         /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                          src={link.faviconUrl} 
                          alt={`${link.title} icon`} 
                          className="w-6 h-6 object-contain"
                        />
                      ) : null}
                      <span className={`${link.faviconUrl ? 'hidden' : 'flex items-center justify-center'}`}>
                        <RiLinkM className="w-6 h-6 text-slate-500" />
                      </span>
                    </div>
                    <span className="font-semibold text-lg">{link.title}</span>
                  </div>
                  <RiExternalLinkLine className="w-5 h-5 text-muted-foreground opacity-50" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
