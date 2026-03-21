import Image from "next/image";

export default function Home() {
  const projects = [
    {
      title: "SCOI (UMC)",
      description: "편리한 스테이블 코인 결제 플랫폼",
      link: "https://github.com/UMCSCOI",
      color: "bg-[#7df7ff]", // Neobrutalism cyan
    },
    {
      title: "WHEREYOUAD",
      description: "광고 성과 및 워크스페이스 관리를 효율적으로 지원하는 웹 서비스",
      link: "https://github.com/WhereYouAd",
      color: "bg-[#ff7db4]", // Neobrutalism pink
    },
    {
      title: "FINSIGHT (Cotato)",
      description: "금융 뉴스 AI 분석 플랫폼: 금융 뉴스를 크롤링하여 AI 기반 요약, 용어 설명, 인사이트, 퀴즈를 자동 생성하는 서비스",
      link: "https://github.com/IT-Cotato/12th-FinSight-BE",
      color: "bg-[#ffde59]", // Neobrutalism yellow
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-8 md:px-12 md:py-20 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      <main className="w-full max-w-5xl flex flex-col items-center">
        {/* Profile Header */}
        <section className="mb-16 w-full flex flex-col md:flex-row items-center justify-between border-4 border-black dark:border-white p-8 md:p-12 bg-white dark:bg-zinc-900 shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)]">
          <div className="text-center md:text-left w-full">
            <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter uppercase text-black dark:text-white">
              김민규
            </h1>
            <p className="text-xl md:text-2xl font-bold mb-8 text-black dark:text-gray-300">
              상명대학교 컴퓨터과학전공
            </p>
            <div className="flex justify-center md:justify-start">
              <a
                href="https://github.com/kingmingyu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 border-4 border-black dark:border-white bg-[#b4ff4c] text-black font-black text-xl uppercase tracking-wider shadow-[6px_6px_0_0_rgba(0,0,0,1)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0_0_rgba(255,255,255,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all"
              >
                GITHUB
              </a>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="w-full mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-10 border-b-8 border-black dark:border-white pb-4 tracking-tighter uppercase text-black dark:text-white">
            PROJECTS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-10">
            {projects.map((project) => (
              <a
                key={project.title}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`group block p-8 border-4 border-black dark:border-white ${project.color} shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0_0_rgba(255,255,255,1)] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all flex flex-col justify-between min-h-[280px]`}
              >
                <div>
                  <h3 className="text-3xl md:text-4xl font-black mb-4 text-black uppercase tracking-tight leading-none bg-white inline-block px-3 py-1 border-2 border-black">
                    {project.title}
                  </h3>
                  <div className="mt-4 bg-white/90 border-2 border-black p-4">
                    <p className="text-lg md:text-xl font-bold text-black leading-snug">
                      {project.description}
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <span className="inline-flex items-center justify-center w-12 h-12 border-4 text-black border-black bg-white font-black text-2xl group-hover:bg-black group-hover:text-white transition-colors rounded-full shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t-8 border-black dark:border-white py-8 text-center bg-white dark:bg-black mt-auto">
          <p className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
            © {new Date().getFullYear()} Kim Min-gyu
          </p>
        </footer>
      </main>
    </div>
  );
}
