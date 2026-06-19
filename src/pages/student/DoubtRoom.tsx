/* ============================================
   VIDYA AI — Doubt Room (Shared)
   ============================================ */
import React, { useState, useEffect } from 'react';
import {
  HelpCircle, Send, Sparkles,
  ArrowLeft, RefreshCw, MessageSquare, Pin
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { AvatarIcon } from '../../components/ui/AvatarIcon';
import { generateAIResponse } from '../../lib/ai-engine';
import { generateId } from '../../lib/utils';
import { db } from '../../lib/db';
import type { DoubtPost, DoubtReply, User, Subject, Chapter } from '../../types';
import './DoubtRoom.css';

interface DoubtWithDetails extends DoubtPost {
  author?: User;
  replies: DoubtReply[];
}

export const DoubtRoomPage: React.FC = () => {
  const { user, studentProfile, teacherProfile } = useAuthStore();
  const role = user?.role ?? 'student';

  // State
  const [posts, setPosts] = useState<DoubtWithDetails[]>([]);
  const [selectedPost, setSelectedPost] = useState<DoubtWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { language } = useAppStore();

  // Curriculum states
  const [dbSubjects, setDbSubjects] = useState<Subject[]>([]);
  const [dbChapters, setDbChapters] = useState<Chapter[]>([]);

  // Form states
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [useAI, setUseAI] = useState(true);

  // Reply state
  const [replyText, setReplyText] = useState('');

  // Load and seed doubts
  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const count = await db.doubtPosts.count();

      // Seed some demo posts if empty
      if (count === 0 && user) {
        const demoPostId1 = generateId();
        const demoPostId2 = generateId();

        // Use the active class code to scope demo posts to the user's classroom
        const activeClassCode = role === 'student' ? studentProfile?.classCode : teacherProfile?.activeClassroomCode;

        await db.doubtPosts.bulkAdd([
          {
            id: demoPostId1,
            userId: 'student_1', // seeded demo user
            chapterId: 'math-algebra-basics',
            question: "I don't understand why combining unlike terms like 3x + 2y is not 5xy. Can someone explain?",
            status: 'answered',
            createdAt: Date.now() - 3600000 * 2, // 2 hrs ago
            synced: true,
            classCode: activeClassCode
          },
          {
            id: demoPostId2,
            userId: 'student_2',
            chapterId: 'science-force-motion',
            question: "What's the difference between mass and weight in physics? Are they measured in the same units?",
            status: 'open',
            createdAt: Date.now() - 3600000 * 5, // 5 hrs ago
            synced: true,
            classCode: activeClassCode
          }
        ]);

        await db.doubtReplies.bulkAdd([
          {
            id: generateId(),
            postId: demoPostId1,
            userId: 'teacher_1',
            content: "Great question! Think of terms as items. 3 apples + 2 bananas cannot be added to make 5 'apple-bananas'. They remain 3 apples and 2 bananas. Similarly, 3x and 2y are unlike because their variables are different.",
            isAIGenerated: false,
            createdAt: Date.now() - 3600000 * 1.5,
            synced: true
          }
        ]);

        // Seed some demo author profiles if they don't exist
        const demoUsers = [
          { id: 'student_1', role: 'student', name: 'Arjun Mehta', avatarId: 'avatar_2', language: 'en', theme: 'dark', createdAt: Date.now(), updatedAt: Date.now() },
          { id: 'student_2', role: 'student', name: 'Priya Sharma', avatarId: 'avatar_5', language: 'en', theme: 'dark', createdAt: Date.now(), updatedAt: Date.now() },
          { id: 'teacher_1', role: 'teacher', name: 'Dr. Anand Rao', avatarId: 'avatar_9', language: 'en', theme: 'dark', createdAt: Date.now(), updatedAt: Date.now() }
        ];

        for (const du of demoUsers) {
          const exists = await db.users.get(du.id);
          if (!exists) {
            await db.users.add(du as User);
          }
        }
      }

      // Query database
      let dbPosts = await db.doubtPosts.reverse().toArray();
      const activeCode = role === 'student' ? studentProfile?.classCode : teacherProfile?.activeClassroomCode;

      // Filter by classroom isolation scope
      if (role === 'student') {
        if (studentProfile?.learningMode === 'classroom' && activeCode) {
          dbPosts = dbPosts.filter(p => p.classCode === activeCode);
        } else {
          // Solo mode: show doubts where classCode is empty or doubts of this user
          dbPosts = dbPosts.filter(p => !p.classCode || p.userId === user?.id);
        }
      } else if (role === 'teacher') {
        if (activeCode) {
          dbPosts = dbPosts.filter(p => p.classCode === activeCode);
        } else {
          dbPosts = [];
        }
      }

      const detailedPosts: DoubtWithDetails[] = [];

      for (const post of dbPosts) {
        let author = await db.users.get(post.userId);
        if (!author && post.userId === user?.id) {
          author = user;
        }

        const replies = await db.doubtReplies
          .where('postId')
          .equals(post.id)
          .toArray();

        detailedPosts.push({
          ...post,
          author,
          replies: replies.sort((a, b) => {
            // Pinned replies first, then by date
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return a.createdAt - b.createdAt;
          })
        });
      }

      setPosts(detailedPosts);

      if (selectedPost) {
        const updatedSelected = detailedPosts.find(p => p.id === selectedPost.id);
        if (updatedSelected) {
          setSelectedPost(updatedSelected);
        }
      }

    } catch (err) {
      console.error('Failed to load doubt posts', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const subjs = await db.subjects.toArray();
        const chaps = await db.chapters.toArray();
        setDbSubjects(subjs);
        setDbChapters(chaps);
        if (subjs.length > 0 && !selectedSubject) {
          setSelectedSubject(subjs[0].id);
        }
      } catch (err) {
        console.error('Failed to load curriculum for DoubtRoom', err);
      }
    };
    fetchCurriculum();
  }, []);

  useEffect(() => {
    loadPosts();
    
    // Listen to classroom switcher changes from the global header
    const handleClassChange = () => {
      loadPosts();
    };
    window.addEventListener('classroomChanged', handleClassChange);
    return () => {
      window.removeEventListener('classroomChanged', handleClassChange);
    };
  }, [user, studentProfile, teacherProfile]);

  const handlePostDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !user) return;

    try {
      const newPostId = generateId();
      const chapterVal = selectedChapter || undefined;

      const classCodeVal = role === 'student' && studentProfile?.learningMode === 'classroom'
        ? studentProfile.classCode
        : (role === 'teacher' ? teacherProfile?.activeClassroomCode : undefined);

      const newPost: DoubtPost = {
        id: newPostId,
        userId: user.id,
        chapterId: chapterVal,
        question: newQuestion,
        status: useAI ? 'answered' : 'open',
        createdAt: Date.now(),
        synced: false,
        classCode: classCodeVal
      };

      await db.doubtPosts.add(newPost);

      // If user toggled instant AI answer
      if (useAI) {
        const aiResponse = generateAIResponse(newQuestion, {
          chapterId: chapterVal,
          subject: selectedSubject,
          grade: role === 'student' ? studentProfile?.grade : 10,
          board: role === 'student' ? studentProfile?.board : 'CBSE'
        }, language);

        await db.doubtReplies.add({
          id: generateId(),
          postId: newPostId,
          userId: 'ai-mascot',
          content: aiResponse,
          isAIGenerated: true,
          createdAt: Date.now() + 1000, // Slightly after post
          synced: false
        });
      }

      // Reset form
      setNewQuestion('');
      setUseAI(true);
      await loadPosts();

    } catch (err) {
      console.error('Failed to post doubt', err);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !user || !selectedPost) return;

    try {
      const reply: DoubtReply = {
        id: generateId(),
        postId: selectedPost.id,
        userId: user.id,
        content: replyText,
        isAIGenerated: false,
        createdAt: Date.now(),
        synced: false
      };

      await db.doubtReplies.add(reply);

      // If teacher replied, mark as answered
      if (role === 'teacher' || role === 'parent') {
        await db.doubtPosts.update(selectedPost.id, { status: 'answered' });
      }

      setReplyText('');
      await loadPosts();

    } catch (err) {
      console.error('Failed to submit reply', err);
    }
  };

  const handlePinReply = async (replyId: string, postId: string) => {
    try {
      // Unpin all other replies for this post
      const replies = await db.doubtReplies.where('postId').equals(postId).toArray();
      for (const r of replies) {
        if (r.id === replyId) {
          await db.doubtReplies.update(r.id, { isPinned: !r.isPinned });
        } else {
          await db.doubtReplies.update(r.id, { isPinned: false });
        }
      }
      await loadPosts();
    } catch (err) {
      console.error('Failed to pin reply', err);
    }
  };

  const handleToggleStatus = async (postId: string, currentStatus: 'open' | 'answered' | 'closed') => {
    const nextStatus = currentStatus === 'open' ? 'answered' : currentStatus === 'answered' ? 'closed' : 'open';
    try {
      await db.doubtPosts.update(postId, { status: nextStatus });
      await loadPosts();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const chaptersForSubject = dbChapters.filter(c => c.subjectId === selectedSubject);

  if (isLoading && posts.length === 0) {
    return (
      <div className="doubts-page" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <RefreshCw className="animate-spin" size={36} color="var(--color-primary)" />
        <p style={{ marginTop: 'var(--sp-4)', color: 'var(--color-text-secondary)' }}>Loading Doubt Room...</p>
      </div>
    );
  }

  // Render detail thread view
  if (selectedPost) {
    const chapterName = dbChapters.find(c => c.id === selectedPost.chapterId)?.title || 'General';
    const subName = dbSubjects.find(s => s.id === (dbChapters.find(c => c.id === selectedPost.chapterId)?.subjectId))?.name || 'General';

    return (
      <div className="doubts-page">
        <button className="doubt-detail__back" onClick={() => setSelectedPost(null)}>
          <ArrowLeft size={16} /> Back to Doubt Room
        </button>

        <Card className="doubt-detail">
          <div className="doubt-item__header">
            <div className="doubt-item__author">
              <span className="doubt-item__avatar" style={{ display: 'flex', alignItems: 'center' }}>
                <AvatarIcon id={selectedPost.author?.avatarId || 'owl'} size={20} />
              </span>
              <div>
                <div className="doubt-item__name">{selectedPost.author?.name || 'Anonymous Student'}</div>
                <div className="doubt-item__time">
                  {new Date(selectedPost.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="doubt-item__tags">
              <span className="doubt-item__subject">{subName} • {chapterName}</span>
              <span
                className={`doubt-item__status doubt-item__status--${selectedPost.status}`}
                onClick={() => role === 'teacher' && handleToggleStatus(selectedPost.id, selectedPost.status)}
                style={{ cursor: role === 'teacher' ? 'pointer' : 'default' }}
              >
                {selectedPost.status}
              </span>
            </div>
          </div>

          <div className="doubt-item__question">{selectedPost.question}</div>

          <div className="doubt-replies">
            <h3>Replies ({selectedPost.replies.length})</h3>

            {selectedPost.replies.length === 0 ? (
              <p style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic', margin: 'var(--sp-4) 0' }}>
                No replies yet. Be the first to answer!
              </p>
            ) : (
              selectedPost.replies.map((reply) => {
                const isAI = reply.userId === 'ai-mascot';
                // Find reply author profile
                const isMe = reply.userId === user?.id;
                let replyAuthorName = reply.userId === 'ai-mascot' ? 'Gyani Mascot' : 'Student';
                let replyAuthorAvatarId = reply.userId === 'ai-mascot' ? 'owl' : 'user';

                if (isMe) {
                  replyAuthorName = 'You';
                  replyAuthorAvatarId = user?.avatarId || 'owl';
                } else if (!isAI) {
                  // Search seeded authors
                  const authUser = posts.find(p => p.author?.id === reply.userId)?.author;
                  if (authUser) {
                    replyAuthorName = authUser.name;
                    replyAuthorAvatarId = authUser.avatarId;
                  } else if (reply.userId.startsWith('teacher')) {
                    replyAuthorName = 'Instructor';
                    replyAuthorAvatarId = 'star';
                  }
                }

                return (
                  <div key={reply.id} className={`doubt-reply ${isAI ? 'doubt-reply--ai' : ''} ${reply.isPinned ? 'doubt-reply--pinned' : ''}`} style={{ borderLeft: reply.isPinned ? '3px solid var(--color-primary)' : '' }}>
                    <div className="doubt-reply__header">
                      <div className="doubt-reply__author">
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          <AvatarIcon id={replyAuthorAvatarId} size={16} />
                        </span>
                        <span>{replyAuthorName}</span>
                        {isAI && <span className="doubt-reply__ai-badge"><Sparkles size={10} /> AI Tutor</span>}
                        {reply.isPinned && (
                          <span style={{
                            background: 'var(--color-primary-light)',
                            color: 'var(--color-primary)',
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                            marginLeft: '8px'
                          }}>
                            <Pin size={10} fill="var(--color-primary)" /> Pinned
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {role === 'teacher' && (
                          <button
                            type="button"
                            onClick={() => handlePinReply(reply.id, selectedPost.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--color-text-secondary)',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title={reply.isPinned ? "Unpin Reply" : "Pin Reply"}
                          >
                            <Pin size={12} fill={reply.isPinned ? "var(--color-primary)" : "none"} />
                          </button>
                        )}
                        <span className="doubt-item__time">
                          {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="doubt-reply__content">{reply.content}</div>
                  </div>
                );
              })
            )}
          </div>

          {/* Post Reply */}
          <form className="reply-input-area" onSubmit={handleReplySubmit}>
            <input
              type="text"
              className="reply-input"
              placeholder={role === 'teacher' ? "Provide professional guidance..." : "Type helpful response..."}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <Button variant="primary" type="submit" icon={Send} disabled={!replyText.trim()}>
              Reply
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="doubts-page">
      <div className="doubts-header">
        <div>
          <h1>Doubt Room</h1>
          <p>Ask questions and learn together with classmates and AI Mascot</p>
        </div>
      </div>

      {/* Ask Doubt Form (for students) */}
      {role === 'student' && (
        <Card className="post-doubt-card">
          <h3>Post a New Doubt</h3>
          <form className="post-doubt-form" onSubmit={handlePostDoubt}>
            <div className="post-doubt-form__row">
              <div>
                <label style={{ fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-bold)', display: 'block', marginBottom: 'var(--sp-1)' }}>SUBJECT</label>
                <select
                  className="post-doubt-form__select"
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setSelectedChapter('');
                  }}
                >
                  {dbSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-bold)', display: 'block', marginBottom: 'var(--sp-1)' }}>CHAPTER (OPTIONAL)</label>
                <select
                  className="post-doubt-form__select"
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                >
                  <option value="">General Subject Query</option>
                  {chaptersForSubject.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-bold)', display: 'block', marginBottom: 'var(--sp-1)' }}>QUESTION</label>
              <textarea
                className="post-doubt-form__textarea"
                placeholder="Describe what you are stuck on. Be specific so classmates or teachers can help!"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
            </div>

            <div className="post-doubt-form__options">
              <label className="post-doubt-form__ai-toggle">
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                />
                <Sparkles size={14} color="var(--color-primary)" />
                <span>Get Instant Mascot Answer</span>
              </label>

              <Button variant="primary" type="submit" disabled={!newQuestion.trim()}>
                Ask Class
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Doubts Threads list */}
      <div className="doubts-layout">
        <h2 style={{ fontSize: 'var(--fs-h4)', fontWeight: 800 }}>Active Discussions</h2>

        {posts.length === 0 ? (
          <Card style={{ padding: 'var(--sp-10)', textAlign: 'center' }}>
            <HelpCircle size={48} color="var(--color-text-tertiary)" style={{ margin: '0 auto var(--sp-4) auto' }} />
            <h3 style={{ fontWeight: 800 }}>No Doubts Yet</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>All quiet! If you have any questions, feel free to ask.</p>
          </Card>
        ) : (
          <div className="doubt-list">
            {posts.map((post) => {
              const chapterName = dbChapters.find(c => c.id === post.chapterId)?.title || 'General';
              const subName = dbSubjects.find(s => s.id === (dbChapters.find(c => c.id === post.chapterId)?.subjectId))?.name || 'General';
              const authorAvatarId = post.author?.avatarId || 'owl';

              return (
                <Card
                  key={post.id}
                  variant="interactive"
                  className="doubt-item"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="doubt-item__header">
                    <div className="doubt-item__author">
                      <span className="doubt-item__avatar" style={{ display: 'flex', alignItems: 'center' }}><AvatarIcon id={authorAvatarId} size={18} /></span>
                      <div>
                        <span className="doubt-item__name">{post.author?.name || 'Anonymous Student'}</span>
                        <span style={{ margin: '0 var(--sp-1)', color: 'var(--color-text-tertiary)' }}>•</span>
                        <span className="doubt-item__time">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="doubt-item__tags">
                      <span className="doubt-item__subject">{subName} • {chapterName}</span>
                      <span className={`doubt-item__status doubt-item__status--${post.status}`}>
                        {post.status}
                      </span>
                    </div>
                  </div>

                  <div className="doubt-item__question" style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {post.question}
                  </div>

                  <div className="doubt-item__footer">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
                      <MessageSquare size={12} /> {post.replies.length} replies
                    </span>
                    {post.replies.some(r => r.userId === 'ai-mascot') && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)', color: 'var(--color-primary)', fontWeight: 'var(--fw-bold)' }}>
                        <Sparkles size={12} /> Mascot Answered
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
