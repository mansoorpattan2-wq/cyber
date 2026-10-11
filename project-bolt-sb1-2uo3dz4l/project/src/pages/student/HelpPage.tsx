import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LifeBuoy, ChevronDown, Search, Shield, BookOpen, ClipboardList, Award, Mail, User, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  { category: 'Account', icon: User, question: 'How do I create an account?', answer: 'Click the "Register" link on the login page, fill in your details, and submit the form. After registration, you can log in with your email and password.' },
  { category: 'Account', icon: User, question: 'How do I reset my password?', answer: 'Click "Forgot Password" on the login page. Enter your email and follow the instructions. Note: This is a demo app, so no real email is sent. You\'ll see a confirmation message instead.' },
  { category: 'Account', icon: User, question: 'Can I change my email?', answer: 'Email is tied to your account and cannot be changed in this demo. You can update other profile information from the Profile page.' },
  { category: 'Learning', icon: BookOpen, question: 'How do learning modules work?', answer: 'Browse modules from the Learning Modules page. Click any module to read its content, watch related videos, and take the associated quiz. Mark modules as complete to track your progress.' },
  { category: 'Learning', icon: BookOpen, question: 'What happens when I mark a module complete?', answer: 'Your progress is saved, your dashboard statistics update, and you may unlock new achievements. You can revisit completed modules anytime.' },
  { category: 'Quizzes', icon: ClipboardList, question: 'How do quizzes work?', answer: 'Each quiz has multiple questions. Select an answer for each, navigate between questions, and submit when ready. You\'ll see your score, topic performance, and can review correct answers.' },
  { category: 'Quizzes', icon: ClipboardList, question: 'Can I retake a quiz?', answer: 'Yes! You can retake any quiz as many times as you like. Your best score is always saved.' },
  { category: 'Quizzes', icon: ClipboardList, question: 'What is a mock test?', answer: 'Mock tests are timed exams that simulate real test conditions. The timer counts down and auto-submits when time runs out. You can review your answers after submitting.' },
  { category: 'Achievements', icon: Award, question: 'How do I earn achievements?', answer: 'Achievements are unlocked automatically based on your activity: completing modules, passing quizzes, finishing scenarios, and more. Check the Achievements page to see your progress.' },
  { category: 'Achievements', icon: Award, question: 'How do I get a certificate?', answer: 'Complete at least 50% of modules and 4 quizzes to unlock your certificate. You can then view, print, and download it from the Certificates page.' },
  { category: 'Security', icon: Shield, question: 'Is my data secure?', answer: 'This is a frontend demo application. Your progress is stored locally in your browser. No real authentication or database is used. Do not enter real sensitive information.' },
  { category: 'Security', icon: Shield, question: 'What is Phishing Detective?', answer: 'It\'s an interactive game where you analyze simulated phishing messages and identify warning signs. All examples are fictional and created for educational purposes.' },
  { category: 'General', icon: HelpCircle, question: 'What is "What Would You Do?"', answer: 'These are real-world cybersecurity scenarios where you choose the best action. After selecting, you\'ll see if your choice was safe, along with an explanation and warning signs.' },
  { category: 'General', icon: HelpCircle, question: 'Does my progress sync across devices?', answer: 'No. This demo stores progress in your browser\'s local storage, which is device-specific. Progress will not sync to other devices or browsers.' },
];

const categories = ['All', 'Account', 'Learning', 'Quizzes', 'Achievements', 'Security', 'General'];

export function HelpPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = faqs.filter(f => {
    const matchSearch = !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || f.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Help Center</h1>
        <p className="text-sm text-slate-400 mt-1">Find answers to common questions</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search FAQs..." className="input-field pl-10" aria-label="Search FAQs" />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              category === c ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* FAQ accordion */}
      <div className="space-y-2">
        {filtered.length > 0 ? (
          filtered.map((faq, i) => {
            const Icon = faq.icon;
            const isOpen = openIndex === i;
            return (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-800/40 transition-colors"
                  aria-expanded={isOpen}
                >
                  <Icon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-200 flex-1">{faq.question}</span>
                  <ChevronDown className={cn('w-4 h-4 text-slate-500 transition-transform', isOpen && 'rotate-180')} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pl-13 animate-slide-up">
                    <div className="ml-8 text-sm text-slate-400 leading-relaxed">{faq.answer}</div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="card p-8 text-center">
            <LifeBuoy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400">No FAQs found matching your search</p>
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="card p-6 text-center">
        <LifeBuoy className="w-10 h-10 text-blue-400 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-100">Still need help?</h2>
        <p className="text-sm text-slate-400 mt-1">This is an educational demo platform. For cybersecurity emergencies, contact your local authorities or campus security.</p>
        <div className="flex gap-3 justify-center mt-4">
          <button onClick={() => navigate('/student/dashboard')} className="btn-secondary">
            Go to Dashboard
          </button>
          <button onClick={() => navigate('/student/settings')} className="btn-secondary">
            Account Settings
          </button>
        </div>
      </div>
    </div>
  );
}
