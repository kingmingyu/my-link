import Image from "next/image";

export default function Home() {
  const projects = [
    {
      title: "SCOI (UMC)",
      description: "편리한 스테이블 코인 결제 플랫폼",
      link: "https://github.com/UMCSCOI",
    },
    {
      title: "WHEREYOUAD",
      description: "광고 성과 및 워크스페이스 관리를 효율적으로 지원하는 웹 서비스",
      link: "https://github.com/WhereYouAd",
    },
    {
      title: "FINSIGHT (Cotato)",
      description: "금융 뉴스 AI 분석 플랫폼: 금융 뉴스를 크롤링하여 AI 기반 요약, 용어 설명, 인사이트, 퀴즈를 자동 생성하는 서비스",
      link: "https://github.com/IT-Cotato/12th-FinSight-BE",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-20 bg-white dark:bg-black font-sans text-foreground">
      <main className="w-full max-w-2xl flex flex-col items-center text-center">
        {/* Profile Header */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">김민규</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-2">
            상명대학교 컴퓨터과학전공 (21학번)
          </p>
          <div className="flex gap-4 justify-center mt-4">
            <a
              href="https://github.com/kingmingyu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:underline text-zinc-800 dark:text-zinc-200"
            >
              GitHub
            </a>
          </div>
        </section>

        {/* Projects Section */}
        <section className="w-full text-left">
          <h2 className="text-xl font-semibold mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            Projects
          </h2>
          <div className="grid gap-6">
            {projects.map((project) => (
              <a
                key={project.title}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-5 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <span className="text-xs text-zinc-400">→</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {project.description}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 text-xs text-zinc-400">
          © {new Date().getFullYear()} Kim Min-gyu. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
