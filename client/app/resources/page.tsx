"use client";
import { DashboardLayout } from "@/components/ui/DashboardLayout";

const RESOURCES = {
  sheets: [
    { title: "Thita AI — DSA Patterns Sheet", url: "https://thita.ai/dsa-patterns-sheet" },
    { title: "Rising Brain Org Sheet", url: "https://www.risingbrain.org/sheet" },
    { title: "Thita AI — Learning Path", url: "https://thita.ai/dashboard/learning-path" },
    { title: "Google Drive DSA Collection", url: "https://drive.google.com/drive/folders/1f-Le966OmNUgs9NSpvvtWn-D7LCoaOuN" },
  ],
  courses: [
    { title: "MIT 6.006 Introduction to Algorithms", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/" },
    { title: "MIT 6.046 Design and Analysis of Algorithms", url: "https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/" },
  ],
  visualizers: [
    { title: "Visualgo — Algorithm Visualizations", url: "https://visualgo.net/en" },
    { title: "CS Academy Graph Editor", url: "https://csacademy.com/app/graph_editor/" },
    { title: "Algorithm Visualizer", url: "https://algorithm-visualizer.org/" },
  ],
  youtube: [
    { title: "NeetCode — Full DSA Course", url: "https://www.youtube.com/@NeetCode" },
    { title: "Abdul Bari — Algorithms", url: "https://www.youtube.com/watch?v=0IAPZzGSbME&list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O" },
    { title: "William Fiset — Graph Theory", url: "https://www.youtube.com/playlist?list=PLDV1Zeh2NRsDGO4--qE8yH72HFL1Km93P" },
    { title: "Striver — A to Z DSA Sheet", url: "https://www.youtube.com/@takeUforward" },
  ],
  github: [
    { title: "Striver's A2Z DSA Course", url: "https://takeuforward.org/strivers-a2z-dsa-course/" },
    { title: "LeetCode Patterns", url: "https://github.com/seanprashad/leetcode-patterns" },
    { title: "Coding Interview University", url: "https://github.com/jwasham/coding-interview-university" },
    { title: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org/" },
  ],
};

const SECTION_ICONS: Record<string, string> = {
  sheets: "📋",
  courses: "🎓",
  visualizers: "👁",
  youtube: "▶",
  github: "🐙",
};

const SECTION_TITLES: Record<string, string> = {
  sheets: "Curated Sheets",
  courses: "MIT OCW Courses",
  visualizers: "Visualizers",
  youtube: "YouTube Playlists",
  github: "GitHub Repos",
};

export default function ResourcesPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Learning Resources</h1>
          <p className="text-gray-400 mt-1">Curated links for every stage of your DSA journey</p>
        </div>

        <div className="space-y-8">
          {Object.entries(RESOURCES).map(([section, links]) => (
            <div key={section}>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span>{SECTION_ICONS[section]}</span>
                {SECTION_TITLES[section]}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-gray-900 border border-gray-800 hover:border-brand-500 rounded-xl px-4 py-3 transition group"
                  >
                    <span className="text-sm text-gray-300 group-hover:text-white transition line-clamp-1">
                      {link.title}
                    </span>
                    <span className="text-gray-600 group-hover:text-brand-500 ml-3 shrink-0">↗</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
