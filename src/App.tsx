import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import Home from "@/pages/Home";
import Category from "@/pages/Category";
import QuestionDetail from "@/pages/QuestionDetail";
import SearchPage from "@/pages/Search";
import ExamConfigPage from "@/pages/ExamConfig";
import ExamTakePage from "@/pages/ExamTake";
import ExamResultPage from "@/pages/ExamResult";
import ExamHistoryPage from "@/pages/ExamHistory";
import LearningPathList from "@/pages/LearningPathList";
import LearningPathDetail from "@/pages/LearningPathDetail";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-900 flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/learning-paths" element={<LearningPathList />} />
            <Route path="/learning-path/:pathId" element={<LearningPathDetail />} />
            <Route path="/category/:categoryId" element={<Category />} />
            <Route path="/question/:questionId" element={<QuestionDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/exam/config" element={<ExamConfigPage />} />
            <Route path="/exam/take" element={<ExamTakePage />} />
            <Route path="/exam/result" element={<ExamResultPage />} />
            <Route path="/exam/history" element={<ExamHistoryPage />} />
          </Routes>
        </main>
        <footer className="border-t border-dark-700 py-8 mt-auto">
          <div className="container mx-auto px-4 text-center text-dark-500 text-sm">
            <p>程序员面试题库 - 不只是背题，更懂原理</p>
            <p className="mt-2">覆盖 Java · 数据库 · 缓存 · 消息队列 · 系统设计</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
