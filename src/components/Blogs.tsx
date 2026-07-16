import React, { useState, useEffect, useRef } from 'react';
import { Blog } from '../types';
import { Search, Calendar, Clock, ArrowLeft, Send, CheckCircle, MessageSquare } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';

interface BlogsProps {
  blogs: Blog[];
  setActiveTab: (tab: string) => void;
}

export const Blogs: React.FC<BlogsProps> = ({ blogs, setActiveTab }) => {
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [scrollPercent, setScrollPercent] = useState(0);

  // Comments state for each blog (persisted in session)
  const [comments, setComments] = useState<Record<string, { author: string; text: string; date: string }[]>>({
    "1": [
      { author: "Rajesh Kumar", text: "Extremely informative article. We are planning a house build in Madipakkam, and soil testing was something our contractor wanted to skip. We are now insisting on a borehole test!", date: "12-Jul-2026" },
      { author: "Deepika R.", text: "How deep do you go for the borehole test in coastal areas like ECR?", date: "14-Jul-2026" }
    ],
    "2": [
      { author: "Suresh Mani", text: "The comparison between Red Brick and AAC blocks is clear. Thank you for the structural explanation.", date: "10-Jul-2026" }
    ]
  });

  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Monitor search and custom navigation events
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

  // Monitor Scroll for reading progress bar
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

  // Category filtration
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
      const offset = 100; // offset for sticky navbar
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

    // Table of Contents headings defined statically for quality
    const tocItems = [
      { id: "intro", label: "1. Executive Introduction" },
      { id: "technical", label: "2. Technical Foundation Parameters" },
      { id: "comparative", label: "3. Comparative Industry Standards" },
      { id: "summary", label: "4. Summary & Expert Advice" }
    ];

    return (
      <div className="bg-white min-h-screen pt-24 pb-16 relative">
        
        {/* Dynamic Reading Progress Bar */}
        <div className="scroll-progress-container">
          <div className="scroll-progress-bar" style={{ width: `${scrollPercent}%` }} />
        </div>

        {/* Breadcrumb Navigation */}
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 text-left">
          
          <button
            onClick={() => setSelectedBlogId(null)}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[#1A6DB5] text-xs font-bold uppercase tracking-wider mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blogs</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Content Column */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Cover Image & Metadata */}
              <div>
                <span className="text-xs font-bold text-[#F47B20] bg-orange-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                  {selectedBlog.category}
                </span>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A2332] mt-4 leading-tight">
                  {selectedBlog.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedBlog.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{selectedBlog.readTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#1A6DB5] font-semibold">
                    <span>By: Chief Civil Engineer, Lifehut</span>
                  </div>
                </div>
              </div>

              {/* Blog body with target anchors for Table of Contents */}
              <article className="prose max-w-none text-slate-600 text-sm sm:text-base leading-relaxed flex flex-col gap-6">
                
                <div id="intro" className="scroll-mt-28">
                  <h3 className="text-lg font-bold text-[#1A2332] font-display mb-3">1. Executive Introduction</h3>
                  <p>
                    Every residential structure is only as reliable as the ground it rests upon and the materials that support it. In luxury home construction, planning errors made in the initial weeks can compound into severe structural settlement or moisture penetration down the road. This technical breakdown serves as an engineering manual for homeowners.
                  </p>
                </div>

                <div className="my-2 p-5 bg-slate-50 rounded-2xl border-l-4 border-[#1A6DB5] text-xs sm:text-sm font-medium text-slate-700 italic">
                  "Soil bearing capacity testing and Fe 550 grade reinforcement steel must never be compromised, regardless of project scale."
                </div>

                <div id="technical" className="scroll-mt-28">
                  <h3 className="text-lg font-bold text-[#1A2332] font-display mb-3">2. Technical Foundation Parameters</h3>
                  <p>
                    Before excavating, borehole testing must establish the soil stress parameters. In many parts of Chennai (such as ECR or OMR), loose sand or high clay content requires deeper pile structures or specialized raft foundations. Standard isolated footings may risk settlement in water-logged seasons. Always demand structural certificates with calculation stamps.
                  </p>
                  <p className="mt-2">
                    {selectedBlog.content}
                  </p>
                </div>

                <div id="comparative" className="scroll-mt-28">
                  <h3 className="text-lg font-bold text-[#1A2332] font-display mb-3">3. Comparative Industry Standards</h3>
                  <p>
                    Most contractors use standard commercial steel ratios that hover around 3.5% of total concrete volume. At Lifehut Developers, we model structural frames on finite-element software to calculate exact live and wind load parameters. This ensures wind-loading thresholds up to 180 km/h, securing your family against extreme weather cycles.
                  </p>
                </div>

                <div id="summary" className="scroll-mt-28">
                  <h3 className="text-lg font-bold text-[#1A2332] font-display mb-3">4. Summary & Expert Advice</h3>
                  <p>
                    Always demand invoice-backed material auditing. Confirm that the exact brand of wire (FR range), plumbing (CPVC schedule 80), and cement matches your signed service agreement. Transparent financial dashboards protect both the builder and the client from inflation delays.
                  </p>
                </div>

              </article>

              {/* Dynamic Comments System */}
              <div className="border-t border-slate-100 pt-8 mt-8 text-left">
                <h3 className="text-lg font-bold font-display text-[#1A2332] flex items-center gap-2 mb-6">
                  <MessageSquare className="w-5.5 h-5.5 text-[#1A6DB5]" />
                  <span>Discussion ({blogComments.length})</span>
                </h3>

                {/* List Comments */}
                <div className="flex flex-col gap-4 mb-8">
                  {blogComments.map((comment, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-bold text-xs text-slate-800">{comment.author}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{comment.date}</div>
                      </div>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{comment.text}</p>
                    </div>
                  ))}

                  {blogComments.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      No comments yet. Start the conversation!
                    </div>
                  )}
                </div>

                {/* Add Comment Form */}
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl">
                  <h4 className="text-sm font-bold text-[#1A2332] mb-4">Leave an Expert Comment</h4>
                  
                  {commentSuccess && (
                    <div className="flex items-center gap-2 text-green-500 text-xs bg-green-500/10 p-3 rounded-xl border border-green-500/20 mb-4">
                      <CheckCircle className="w-4 h-4" />
                      <span>Comment submitted successfully! Under moderation.</span>
                    </div>
                  )}

                  <form onSubmit={handleAddComment} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        required
                        value={commentName}
                        onChange={(e) => setCommentName(e.target.value)}
                        placeholder="Your Name..."
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#1A6DB5] text-slate-800"
                      />
                    </div>
                    <textarea
                      required
                      rows={3}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Type your comment / construction inquiry..."
                      className="bg-white border border-slate-200 rounded-xl p-4 text-xs outline-none focus:border-[#1A6DB5] text-slate-800"
                    />
                    <button
                      type="submit"
                      className="bg-[#1A6DB5] hover:bg-[#1558a0] text-white px-6 py-2.5 rounded-xl text-xs font-bold self-start flex items-center gap-1.5 transition-all shadow-md shadow-[#1A6DB5]/15"
                    >
                      <span>Post Comment</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

              </div>

            </div>

            {/* Right Sticky Table of Contents (TOC) */}
            <div className="lg:col-span-4 sticky top-28 flex flex-col gap-6">
              
              {/* TOC Glass card */}
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl shadow-sm text-left">
                <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">Table of Contents</h3>
                <ul className="flex flex-col gap-3 list-none p-0 m-0 text-xs">
                  {tocItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => handleTocClick(item.id)}
                        className="text-left text-slate-600 hover:text-[#1A6DB5] font-semibold transition-colors focus:outline-none focus:underline"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Author profile card */}
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl shadow-sm text-left">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Reviewed By</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1A6DB5] text-white font-extrabold text-xs flex items-center justify-center">
                    LH
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Er. Saravanan, B.E. Civil</div>
                    <div className="text-[10px] text-slate-400">Principal structural structural engineering engineer</div>
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
    <section className="bg-slate-50 min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-grid-blueprint relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Title */}
        <div className="text-center mb-12">
          <span className="inline-block bg-orange-500/10 text-[#F47B20] text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-3">
            Lifehut Chronicles
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#1A2332]">
            Elite Construction Manuals & Guides
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto mt-3">
            Knowledge is structural safety. Browse verified engineering articles compiled directly by our site leads.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          
          {/* Categories select pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#1A6DB5] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search guides..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-2 outline-none focus:bg-white focus:border-[#1A6DB5]"
            />
          </div>

        </div>

        {/* Blogs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBlogId(b.id)}
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-300 cursor-pointer text-left flex flex-col justify-between h-[420px]"
            >
              <div>
                {/* Cover representation */}
                <div className="aspect-[16/10] bg-[#1A2332] relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-white opacity-10 pointer-events-none" />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-[9px] font-extrabold tracking-widest text-[#F47B20] bg-black/60 border border-[#F47B20]/40 px-2 py-1 rounded-full uppercase">
                      {b.category}
                    </span>
                  </div>
                  <div className="w-full h-full flex items-center justify-center p-6 text-white text-center">
                    <div className="font-display font-bold text-sm tracking-wide text-sky-200 line-clamp-3">{b.title}</div>
                  </div>
                </div>

                {/* Article Info */}
                <div className="p-6">
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{b.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{b.readTime}</span>
                    </div>
                  </div>
                  <h3 className="font-display text-sm sm:text-base font-extrabold text-[#1A2332] hover:text-[#1A6DB5] line-clamp-2 transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                    {b.content}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 pt-0 border-t border-slate-50 flex items-center justify-between text-[11px] font-bold text-[#1A6DB5]">
                <span>Read Full Article</span>
                <span className="text-slate-300">Lifehut Guides</span>
              </div>
            </div>
          ))}

          {filteredBlogs.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400 text-sm">
              No articles match your criteria.
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
