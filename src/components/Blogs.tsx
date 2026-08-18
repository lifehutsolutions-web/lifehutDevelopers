import React, { useState, useEffect } from 'react';
import { Blog } from '../types';
import { Search, Calendar, Clock, ArrowLeft, Send, CheckCircle, MessageSquare, BookOpen } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { motion } from 'motion/react';

interface BlogsProps {
  blogs: Blog[];
  setActiveTab: (tab: string) => void;
}

export const Blogs: React.FC<BlogsProps> = ({ blogs, setActiveTab }) => {
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [scrollPercent, setScrollPercent] = useState(0);

  const [comments, setComments] = useState<Record<string, { author: string; text: string; date: string }[]>>({
    "1": [
      { author: "Rajesh Kumar", text: "Extremely informative guide on structural footing design and quality materials.", date: "12-Jul-2026" },
      { author: "Deepika R.", text: "How do you recommend sizing plinth beams for multi-floor residences?", date: "14-Jul-2026" }
    ],
    "2": [
      { author: "Suresh Mani", text: "The comparison between Red Brick and AAC blocks is clear and helpful.", date: "10-Jul-2026" }
    ]
  });

  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);

  useEffect(() => {
    const handleNavBlog = (e: Event) => {
      const id = (e as CustomEvent).detail;
      if (id) {
        setSelectedBlogId(id);
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }
    };
    window.addEventListener('nav-blog', handleNavBlog);
    return () => window.removeEventListener('nav-blog', handleNavBlog);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!selectedBlogId) return;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const percent = (window.scrollY / totalHeight) * 100;
        setScrollPercent(percent);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedBlogId]);

  const selectedBlog = blogs.find(b => b.id === selectedBlogId);

  const categories = ['All', 'Structural', 'Materials', 'Budgeting', 'Planning'];
  const filteredBlogs = blogs.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'All' || b.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlogId || !commentName.trim() || !commentText.trim()) return;

    const newComment = {
      author: commentName.trim(),
      text: commentText.trim(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    setComments(prev => ({
      ...prev,
      [selectedBlogId]: [...(prev[selectedBlogId] || []), newComment]
    }));

    setCommentName('');
    setCommentText('');
    setCommentSuccess(true);
    setTimeout(() => setCommentSuccess(false), 4000);
  };

  const handleTocClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (selectedBlog) {
    const blogComments = comments[selectedBlogId || ''] || [];

    const tocItems = [
      { id: "intro", label: "1. Overview & Core Principles" },
      { id: "technical", label: "2. Technical Foundation Parameters" },
      { id: "comparative", label: "3. Comparative Standards" },
      { id: "summary", label: "4. Key Recommendations" }
    ];

    return (
      <div className="bg-grey-50 min-h-screen pt-4 sm:pt-6 pb-12 relative text-left">
        
        {/* Dynamic Reading Progress Bar */}
        <div className="scroll-progress-container">
          <div className="scroll-progress-bar bg-blue-700" style={{ width: `${scrollPercent}%` }} />
        </div>

        <Breadcrumbs
          items={[
            { label: 'Blogs', onClick: () => setSelectedBlogId(null) },
            { label: selectedBlog.title, active: true }
          ]}
          onHomeClick={() => {
            setSelectedBlogId(null);
            setActiveTab('home');
          }}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-6 text-left">
          
          <button
            onClick={() => setSelectedBlogId(null)}
            className="inline-flex items-center gap-2 text-grey-600 hover:text-blue-700 text-xs font-display font-bold uppercase tracking-wider mb-6 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Blogs</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Content Column */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              <div className="bg-white p-7 sm:p-9 rounded-3xl border border-grey-200 shadow-soft">
                <span className="text-xs font-display font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider border border-blue-100">
                  {selectedBlog.category}
                </span>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink mt-4 leading-tight tracking-tight">
                  {selectedBlog.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-5 text-xs text-grey-500 mt-4 border-b border-grey-200 pb-4 font-display font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-700" />
                    <span>{selectedBlog.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-700" />
                    <span>{selectedBlog.readTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                    <span>Lifehut Engineering Editorial</span>
                  </div>
                </div>

                {/* Blog body */}
                <article className="text-grey-600 text-sm sm:text-base leading-relaxed flex flex-col gap-6 mt-6">
                  
                  <div id="intro" className="scroll-mt-28">
                    <h3 className="text-lg font-extrabold text-ink font-display mb-2">1. Overview &amp; Core Principles</h3>
                    <p>
                      Every residential structure is only as reliable as the ground it rests upon and the materials that support it. Planning errors in the initial weeks can lead to settlement issues later. This guide summarizes best civil practices.
                    </p>
                  </div>

                  <div className="p-5 bg-blue-50/70 rounded-2xl border-l-4 border-blue-700 text-sm font-medium text-ink italic">
                    "Engineered structural calculations and Fe 550 grade reinforcement steel must never be compromised, regardless of project scale."
                  </div>

                  <div id="technical" className="scroll-mt-28">
                    <h3 className="text-lg font-extrabold text-ink font-display mb-2">2. Technical Foundation Parameters</h3>
                    <p>
                      Before construction commences, precision optical leveling and structural load detailing establish the exact foundation depths, column placements, and footing configurations for lifetime structural stability.
                    </p>
                    <p className="mt-3 text-grey-600">
                      {selectedBlog.content}
                    </p>
                  </div>

                  <div id="comparative" className="scroll-mt-28">
                    <h3 className="text-lg font-extrabold text-ink font-display mb-2">3. Comparative Standards</h3>
                    <p>
                      Structural frames modeled on finite-element software ensure wind resistance thresholds up to 180 km/h, securing your home against extreme weather.
                    </p>
                  </div>

                  <div id="summary" className="scroll-mt-28">
                    <h3 className="text-lg font-extrabold text-ink font-display mb-2">4. Key Recommendations</h3>
                    <p>
                      Insist on invoice-backed material auditing. Verify brand specifications for steel, cement, CPVC plumbing, and fire-resistant wiring match your agreement.
                    </p>
                  </div>

                </article>
              </div>

              {/* Discussion / Comments */}
              <div className="bg-white p-7 sm:p-9 rounded-3xl border border-grey-200 shadow-soft text-left">
                <h3 className="text-lg font-extrabold font-display text-ink flex items-center gap-2 mb-6">
                  <MessageSquare className="w-5 h-5 text-blue-700" />
                  <span>Discussion ({blogComments.length})</span>
                </h3>

                <div className="flex flex-col gap-3.5 mb-6">
                  {blogComments.map((comment, idx) => (
                    <div key={idx} className="bg-grey-50 p-4 rounded-2xl border border-grey-200">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="font-display font-bold text-xs text-ink">{comment.author}</div>
                        <div className="text-[11px] text-grey-400 font-display">{comment.date}</div>
                      </div>
                      <p className="text-grey-600 text-xs sm:text-sm leading-relaxed">{comment.text}</p>
                    </div>
                  ))}

                  {blogComments.length === 0 && (
                    <div className="text-center py-6 text-grey-400 text-xs">
                      No comments yet. Leave a question or comment below.
                    </div>
                  )}
                </div>

                {/* Add Comment Form */}
                <div className="bg-grey-50 border border-grey-200 p-6 rounded-2xl">
                  <h4 className="text-xs font-display font-bold text-ink uppercase tracking-wider mb-4">Leave a Comment</h4>
                  
                  {commentSuccess && (
                    <div className="flex items-center gap-2 text-emerald-800 text-xs bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 mb-4">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Comment submitted successfully!</span>
                    </div>
                  )}

                  <form onSubmit={handleAddComment} className="flex flex-col gap-3.5">
                    <input
                      type="text"
                      required
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      placeholder="Your Name..."
                      className="bg-white border border-grey-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-700 text-ink"
                    />
                    <textarea
                      required
                      rows={3}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Your question or comment..."
                      className="bg-white border border-grey-200 rounded-xl p-4 text-xs sm:text-sm outline-none focus:border-blue-700 text-ink"
                    />
                    <button
                      type="submit"
                      className="bg-blue-700 hover:bg-blue-900 text-white px-6 py-2.5 rounded-xl text-xs font-display font-bold self-start flex items-center gap-2 transition-all shadow-soft cursor-pointer"
                    >
                      <span>Post Comment</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

              </div>

            </div>

            {/* Right Sticky Sidebar */}
            <div className="lg:col-span-4 sticky top-28 flex flex-col gap-6">
              
              <div className="bg-white border border-grey-200 p-6 rounded-3xl shadow-soft text-left">
                <h3 className="text-xs font-display font-bold tracking-wider text-grey-500 uppercase mb-4">Table of Contents</h3>
                <ul className="flex flex-col gap-2.5 list-none p-0 m-0 text-xs sm:text-sm">
                  {tocItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => handleTocClick(item.id)}
                        className="text-left text-grey-600 hover:text-blue-700 font-medium transition-colors focus:outline-none cursor-pointer"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-grey-200 p-6 rounded-3xl shadow-soft text-left">
                <h4 className="text-xs font-display font-bold uppercase text-grey-500 tracking-wider mb-3">Editorial Lead</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 font-extrabold text-xs flex items-center justify-center border border-blue-100">
                    LH
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-display font-bold text-ink">Lifehut Engineering Team</div>
                    <div className="text-[11px] text-grey-500">Structural &amp; Civil Consultants</div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }

  return (
    <section className="bg-grey-50 min-h-screen pt-6 sm:pt-8 pb-12 sm:pb-16 px-6 lg:px-8 relative text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8 max-w-3xl mx-auto"
        >
          <p className="font-display font-bold text-blue-700 text-sm tracking-wide uppercase">
            Knowledge Hub
          </p>
          <h1 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight text-balance">
            Construction <span className="text-blue-700">Insights &amp; Guides</span>
          </h1>
          <p className="mt-4 text-grey-600 text-base sm:text-lg leading-relaxed">
            Technical articles, structural analysis, and planning guidelines compiled by our in-house civil engineering team.
          </p>
        </motion.div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-10 bg-white p-4 rounded-2xl border border-grey-200 shadow-soft">
          
          {/* Categories select pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-display font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-700 text-white shadow-soft'
                    : 'bg-grey-50 text-grey-600 hover:text-blue-700 hover:bg-grey-100 border border-grey-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search engineering guides..."
              className="w-full text-xs sm:text-sm bg-grey-50 border border-grey-200 rounded-xl pl-9 pr-4 py-2 outline-none focus:bg-white focus:border-blue-700 text-ink"
            />
          </div>

        </div>

        {/* Blogs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((b, idx) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              onClick={() => setSelectedBlogId(b.id)}
              className="bg-white rounded-3xl border border-grey-200 overflow-hidden shadow-soft hover:shadow-card lift-hover transition-all duration-300 cursor-pointer text-left flex flex-col justify-between h-[370px]"
            >
              <div>
                <div className="p-6 pb-4 border-b border-grey-100 flex items-center justify-between">
                  <span className="text-xs font-display font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase">
                    {b.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-grey-400 font-display">
                    <Clock className="w-3.5 h-3.5 text-blue-700" />
                    <span>{b.readTime}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-1.5 text-xs text-grey-400 font-display mb-2.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-700" />
                    <span>{b.date}</span>
                  </div>
                  <h3 className="font-display text-base font-extrabold text-ink hover:text-blue-700 line-clamp-2 transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-grey-600 text-xs sm:text-sm mt-3 line-clamp-3 leading-relaxed">
                    {b.content}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-4 border-t border-grey-100 flex items-center justify-between text-xs font-display font-bold text-blue-700">
                <span>Read Full Article →</span>
                <span className="text-xs font-display font-medium text-grey-400">Lifehut</span>
              </div>
            </motion.div>
          ))}

          {filteredBlogs.length === 0 && (
            <div className="col-span-full text-center py-16 text-grey-400 text-sm">
              No articles match your search criteria.
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
