import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/lib/auth-context';
import { Navigate, Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Users, BookOpen, Settings, AlertTriangle, CheckCircle2, Clock, Trash2, Key, Mail, Shield, User as UserIcon, X, Search, Layers, PlaySquare, Trophy, Plus, HelpCircle, Database, Sparkles, Upload, FileJson } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, getDocs, doc, getDoc, setDoc, addDoc, deleteDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { GoogleGenAI } from '@google/genai';

export function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'ai' | 'settings'>('overview');
  const [contentSubTab, setContentSubTab] = useState<'grammar' | 'vocabulary' | 'practice' | 'exam'>('grammar');
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [contentList, setContentList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editingContent, setEditingContent] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // AI & Import states
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const [targetCollection, setTargetCollection] = useState("flashcards");

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsersList(list);
    } catch (err: any) {
      toast.error("Lỗi khi tải danh sách người dùng: " + err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchContent = async () => {
    setLoadingContent(true);
    try {
      const collectionName = contentSubTab === 'grammar' ? 'grammar' 
                          : contentSubTab === 'vocabulary' ? 'flashcards'
                          : contentSubTab === 'practice' ? 'questions'
                          : 'exams';
                          
      const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setContentList(list);
    } catch (err: any) {
      console.error(err);
      toast.error("Lỗi khi tải nội dung: " + err.message);
    } finally {
      setLoadingContent(false);
    }
  };

  const seedData = async () => {
    if (!window.confirm("Bồ có muốn nạp bộ dữ liệu đầy đủ cho chương trình lớp 10 không? Dữ liệu hiện tại sẽ không bị ảnh hưởng.")) return;
    setUpdating(true);
    try {
      const now = new Date().toISOString();
      
      // Grammar Seeds
      const grammarRef = collection(db, 'grammar');
      const grammarItems = [
      {
        title: 'Thì Hiện Tại Đơn (Present Simple)',
        description: 'Diễn tả thói quen, sự thật hiển nhiên.',
        formula: 'S + V(s/es)',
        signs: ['always', 'usually', 'often', 'every day'],
        structure: 'Khẳng định: S + V(s/es)\nPhủ định: S + do/does + not + V\nNghi vấn: Do/Does + S + V?',
        examples: ['I usually get up at 6 AM.', 'The sun rises in the East.'],
        quiz: {
          question: 'She _____ (watch) TV every evening.',
          options: ['watch', 'watches', 'watching', 'is watch'],
          correct: 'watches'
        },
        createdAt: now
      },
      {
        title: 'Thì Hiện Tại Tiếp Diễn',
        description: 'Đang xảy ra tại thời điểm nói.',
        formula: 'S + am/is/are + V-ing',
        signs: ['now', 'at the moment', 'look', 'listen'],
        structure: 'Khẳng định: S + am/is/are + V-ing\nPhủ định: S + am/is/are + not + V-ing\nNghi vấn: Am/Is/Are + S + V-ing?',
        examples: ['She is reading a book now.', 'They are playing soccer.'],
        quiz: {
          question: 'Look! They _____ (run) over there.',
          options: ['run', 'runs', 'are running', 'is running'],
          correct: 'are running'
        },
        createdAt: now
      },
        {
          title: 'Câu Bị Động (Passive Voice)',
          description: 'Nhấn mạnh vào hành động thay vì người thực hiện.',
          formula: 'S + be + V3/ed',
          signs: ['by', 'made in', 'born in'],
          structure: 'Hiện tại đơn: S + am/is/are + V3/ed\nQuá khứ đơn: S + was/were + V3/ed',
          examples: ['This cake was made by my mom.', 'English is spoken all over the world.'],
          quiz: {
            question: 'The letter _____ (write) by Alice yesterday.',
            options: ['writes', 'wrote', 'was written', 'is written'],
            correct: 'was written'
          },
          createdAt: now
        },
        {
          title: 'Câu Điều Kiện Loại 1',
          description: 'Sự việc có thể xảy ra ở hiện tại hoặc tương lai.',
          formula: 'If + S + V(s/es), S + will + V',
          signs: ['If', 'unless'],
          structure: 'Mệnh đề If: Hiện tại đơn\nMệnh đề chính: Tương lai đơn (will + V)',
          examples: ['If it rains, I will stay at home.', 'If you study hard, you will pass the exam.'],
          quiz: {
            question: 'If you _____ (not/study), you will fail the test.',
            options: ['don\'t study', 'doesn\'t study', 'not study', 'won\'t study'],
            correct: 'don\'t study'
          },
          createdAt: now
        },
        {
          title: 'Mệnh đề quan hệ (Relative Clauses)',
          description: 'Dùng who, whom, whose, which, that để nối câu.',
          formula: 'Noun + Relative Pronoun + ...',
          signs: ['who', 'whom', 'whose', 'which', 'that'],
          structure: 'Who: thay cho người (chủ ngữ)\nWhom: thay cho người (tân ngữ)\nWhose: chỉ sở hữu\nWhich: thay cho vật',
          examples: ['The man who is standing there is my teacher.', 'The book which I bought yesterday is interesting.'],
          quiz: {
            question: 'The girl _____ is singing is my sister.',
            options: ['who', 'whom', 'whose', 'which'],
            correct: 'who'
          },
          createdAt: now
        },
        {
          title: 'So sánh hơn và So sánh nhất',
          description: 'So sánh giữa các đối tượng.',
          formula: 'adj-er / more adj, the adj-est / the most adj',
          signs: ['than', 'the', 'of all', 'in the world'],
          structure: 'Ngắn: adj + er + than / the + adj + est\nDài: more + adj + than / the most + adj',
          examples: ['He is taller than me.', 'She is the most beautiful girl in the class.'],
          quiz: {
            question: 'This task is _____ (difficult) than that one.',
            options: ['difficult', 'difficulter', 'more difficult', 'the most difficult'],
            correct: 'more difficult'
          },
          createdAt: now
        },
        {
          title: 'Thì Quá Khứ Đơn (Past Simple)',
          description: 'Hành động đã kết thúc trong quá khứ.',
          formula: 'S + V2/ed',
          signs: ['yesterday', 'last week', 'ago', 'in 1990'],
          structure: 'Khẳng định: S + V2/ed\nPhủ định: S + did + not + V\nNghi vấn: Did + S + V?',
          examples: ['I visited my grandmother yesterday.', 'We went to the beach last summer.'],
          quiz: {
            question: 'He _____ (buy) this car 2 years ago.',
            options: ['buy', 'buys', 'bought', 'buying'],
            correct: 'bought'
          },
          createdAt: now
        },
        {
          title: 'Thì Quá Khứ Tiếp Diễn',
          description: 'Hành động đang xảy ra tại một thời điểm trong quá khứ.',
          formula: 'S + was/were + V-ing',
          signs: ['at that time', 'while', 'when', 'at 8 PM yesterday'],
          structure: 'Sử dụng while cho 2 hành động song song, when cho hành động xen vào.',
          examples: ['I was watching TV when he came.', 'While she was cooking, I was reading.'],
          quiz: {
            question: 'What _____ you doing at 9 PM last night?',
            options: ['are', 'was', 'were', 'did'],
            correct: 'were'
          },
          createdAt: now
        },
        {
          title: 'Thì Hiện Tại Hoàn Thành',
          description: 'Hành động bắt đầu ở quá khứ và còn liên quan đến hiện tại.',
          formula: 'S + have/has + V3/ed',
          signs: ['since', 'for', 'already', 'yet', 'just', 'ever', 'never'],
          structure: 'Nhấn mạnh kết quả của hành động.',
          examples: ['I have lived here for 10 years.', 'We have already finished the project.'],
          quiz: {
            question: 'She _____ (not/see) him since last week.',
            options: ['doesn\'t see', 'didn\'t see', 'hasn\'t seen', 'haven\'t seen'],
            correct: 'hasn\'t seen'
          },
          createdAt: now
        },
        {
          title: 'Thì Tương Lai Đơn (Future Simple)',
          description: 'Quyết định tức thì hoặc dự đoán không căn cứ.',
          formula: 'S + will + V',
          signs: ['tomorrow', 'next week', 'soon', 'probably', 'I think'],
          structure: 'Dùng cho lời hứa, lời mời hoặc dự đoán tương lai.',
          examples: ['I think it will rain tomorrow.', 'I will help you with your homework.'],
          quiz: {
            question: 'I promise I _____ (call) you tonight.',
            options: ['call', 'will call', 'called', 'am calling'],
            correct: 'will call'
          },
          createdAt: now
        },
        {
          title: 'Cấu trúc với "Suggest"',
          description: 'Đưa ra lời đề nghị, khuyên bảo.',
          formula: 'Suggest + V-ing hoặc Suggest + (that) + S + should + V',
          signs: ['suggest', 'recommend', 'advise'],
          structure: 'Lưu ý: Sau suggest that luôn dùng V nguyên mẫu (hoặc should V).',
          examples: ['I suggest going to the cinema.', 'He suggested that she should take a rest.'],
          quiz: {
            question: 'My teacher suggests _____ (study) harder.',
            options: ['study', 'to study', 'studying', 'studies'],
            correct: 'studying'
          },
          createdAt: now
        },
        {
          title: 'Cấu trúc "So... that" và "Such... that"',
          description: 'Dùng để nhấn mạnh nguyên nhân - kết quả (Quá ... đến nỗi mà).',
          formula: 'So + adj/adv + that / Such + (a/an) + adj + N + that',
          signs: ['so', 'such', 'too', 'enough'],
          structure: 'So đi với tính từ/trạng từ. Such đi với cụm danh từ.',
          examples: ['The tea is so hot that I can\'t drink it.', 'It was such a cold day that we stayed home.'],
          quiz: {
            question: 'It is _____ a difficult problem that no one can solve it.',
            options: ['so', 'such', 'very', 'too'],
            correct: 'such'
          },
          createdAt: now
        }
      ];
      for (const item of grammarItems) await addDoc(grammarRef, item);

      // Vocabulary Seeds
      const vocabRef = collection(db, 'flashcards');
      const vocabItems = [
        // Unit 1: Family Life
        { word: 'Breadwinner', meaning: 'Người trụ cột (kiếm tiền)', pronunciation: '/ˈbredwɪnə(r)/', example: 'In many families, the father is the breadwinner.', topic: 'Family Life', createdAt: now },
        { word: 'Homemaker', meaning: 'Người nội trợ', pronunciation: '/ˈhəʊmmeɪkə(r)/', example: 'She chose to be a homemaker to look after her children.', topic: 'Family Life', createdAt: now },
        { word: 'Household chores', meaning: 'Công việc vặt trong nhà', pronunciation: '/ˌhaʊshəʊld ˈtʃɔːz/', example: 'We share the household chores equally.', topic: 'Family Life', createdAt: now },
        { word: 'Heavy lifting', meaning: 'Việc nặng nhọc', pronunciation: '/ˌhevi ˈlɪftɪŋ/', example: 'My father usually does the heavy lifting in my family.', topic: 'Family Life', createdAt: now },
        { word: 'Nurture', meaning: 'Nuôi dưỡng', pronunciation: '/ˈnɜːtʃə(r)/', example: 'Parents should nurture their children\'s talents.', topic: 'Family Life', createdAt: now },
        
        // Unit 2: Humans and the Environment
        { word: 'Environment', meaning: 'Môi trường', pronunciation: '/ɪnˈvaɪrənmənt/', example: 'We must protect the environment.', topic: 'Environment', createdAt: now },
        { word: 'Carbon footprint', meaning: 'Dấu chân carbon', pronunciation: '/ˌkɑːbən ˈfʊtprɪnt/', example: 'We should try to reduce our carbon footprint.', topic: 'Environment', createdAt: now },
        { word: 'Eco-friendly', meaning: 'Thân thiện với môi trường', pronunciation: '/ˌiːkəʊ ˈfrendli/', example: 'I prefer using eco-friendly products.', topic: 'Environment', createdAt: now },
        { word: 'Sustainable', meaning: 'Bền vững', pronunciation: '/səˈsteɪnəbl/', example: 'We need sustainable development.', topic: 'Environment', createdAt: now },
        { word: 'Biodiversity', meaning: 'Đa dạng sinh học', pronunciation: '/ˌbaɪəʊdaɪˈvɜːsəti/', example: 'Protecting biodiversity is vital.', topic: 'Environment', createdAt: now },
        
        // Unit 3: Music
        { word: 'Concert', meaning: 'Buổi hòa nhạc', pronunciation: '/ˈkɒnsət/', example: 'The concert was held in the national stadium.', topic: 'Music', createdAt: now },
        { word: 'Audience', meaning: 'Khán giả', pronunciation: '/ˈɔːdiəns/', example: 'The audience cheered loudly after the performance.', topic: 'Music', createdAt: now },
        { word: 'Composer', meaning: 'Nhà soạn nhạc', pronunciation: '/kəmˈpəʊzə(r)/', example: 'Trinh Cong Son was a famous composer.', topic: 'Music', createdAt: now },
        { word: 'Instrument', meaning: 'Nhạc cụ', pronunciation: '/ˈɪnstrʊmənt/', example: 'What musical instrument can you play?', topic: 'Music', createdAt: now },
        { word: 'Talented', meaning: 'Có tài năng', pronunciation: '/ˈtæləntɪd/', example: 'She is a very talented singer.', topic: 'Music', createdAt: now },
        
        // Unit 4: For a Better Community
        { word: 'Volunteer', meaning: 'Tình nguyện viên', pronunciation: '/ˌvɒlənˈtɪə(r)/', example: 'They are working as volunteers at the local hospital.', topic: 'Community', createdAt: now },
        { word: 'Contribution', meaning: 'Sự đóng góp', pronunciation: '/ˌkɒntrɪˈbjuːʃn/', example: 'He made a generous contribution to the charity.', topic: 'Community', createdAt: now },
        { word: 'Disadvantaged', meaning: 'Thiệt thòi, hoàn cảnh khó khăn', pronunciation: '/ˌdɪsədˈvɑːntɪdʒd/', example: 'We help disadvantaged children in rural areas.', topic: 'Community', createdAt: now },
        { word: 'Charity', meaning: 'Từ thiện', pronunciation: '/ˈtʃærəti/', example: 'Many people donate money to charity.', topic: 'Community', createdAt: now },
        
        // Unit 5: Inventions
        { word: 'Technology', meaning: 'Công nghệ', pronunciation: '/tekˈnɒlədʒi/', example: 'Modern technology has changed our lives.', topic: 'Technology', createdAt: now },
        { word: 'Invention', meaning: 'Sự phát minh', pronunciation: '/ɪnˈvenʃn/', example: 'The internet is a great invention.', topic: 'Technology', createdAt: now },
        { word: 'Device', meaning: 'Thiết bị', pronunciation: '/dɪˈvaɪs/', example: 'A smartphone is a versatile device.', topic: 'Technology', createdAt: now },
        { word: 'Portable', meaning: 'Có thể mang theo, di động', pronunciation: '/ˈpɔːtəbl/', example: 'Laptops are portable computers.', topic: 'Technology', createdAt: now },

        // Unit 6: Gender Equality
        { word: 'Equality', meaning: 'Sự bình đẳng', pronunciation: '/iˈkwɒləti/', example: 'Gender equality is a basic human right.', topic: 'Gender Equality', createdAt: now },
        { word: 'Discrimination', meaning: 'Sự phân biệt đối xử', pronunciation: '/dɪˌskrɪmɪˈneɪʃn/', example: 'We should end gender discrimination.', topic: 'Gender Equality', createdAt: now },
        { word: 'Opportunity', meaning: 'Cơ hội', pronunciation: '/ˌɒpəˈtjuːnəti/', example: 'Women should have equal opportunities in education.', topic: 'Gender Equality', createdAt: now },

        // Unit 7: Viet Nam and International Organizations
        { word: 'Organization', meaning: 'Tổ chức', pronunciation: '/ˌɔːɡənaɪˈzeɪʃn/', example: 'The WHO is an international organization.', topic: 'International', createdAt: now },
        { word: 'Participate', meaning: 'Tham gia', pronunciation: '/pɑːˈtɪsɪpeɪt/', example: 'Viet Nam participates in many UN missions.', topic: 'International', createdAt: now },
        { word: 'Development', meaning: 'Sự phát triển', pronunciation: '/dɪˈveləpmənt/', example: 'Sustainable development is crucial.', topic: 'International', createdAt: now },

        // Unit 8: New Ways to Learn
        { word: 'Distance learning', meaning: 'Học từ xa', pronunciation: '/ˈdɪstəns ˈlɜːnɪŋ/', example: 'Distance learning became popular during the pandemic.', topic: 'Education', createdAt: now },
        { word: 'Digital', meaning: 'Kỹ thuật số', pronunciation: '/ˈdɪdʒɪtl/', example: 'Digital devices are essential for online learning.', topic: 'Education', createdAt: now },
        { word: 'Interactive', meaning: 'Tương tác', pronunciation: '/ˌɪntərˈæktɪv/', example: 'Interactive apps make learning fun.', topic: 'Education', createdAt: now },

        // Unit 9: Protecting The Environment
        { word: 'Conservation', meaning: 'Sự bảo tồn', pronunciation: '/ˌkɒnsəˈveɪʃn/', example: 'Nature conservation is our primary duty.', topic: 'Nature', createdAt: now },
        { word: 'Endangered', meaning: 'Đang gặp nguy hiểm (tuyệt chủng)', pronunciation: '/ɪnˈdeɪndʒəd/', example: 'Tigers are an endangered species.', topic: 'Nature', createdAt: now },
        { word: 'Awareness', meaning: 'Sự nhận thức', pronunciation: '/əˈweənəs/', example: 'We must raise awareness about wildlife protection.', topic: 'Nature', createdAt: now },

        // Unit 10: Ecotourism
        { word: 'Ecotourism', meaning: 'Du lịch sinh thái', pronunciation: '/ˈiːkəʊtʊərɪzəm/', example: 'Ecotourism benefits both people and nature.', topic: 'Ecotourism', createdAt: now },
        { word: 'Destination', meaning: 'Điểm đến', pronunciation: '/ˌdestɪˈneɪʃn/', example: 'Phong Nha is a famous ecotourism destination.', topic: 'Ecotourism', createdAt: now },
        { word: 'Environmental', meaning: 'Thuộc về môi trường', pronunciation: '/ɪnˌvaɪrənˈmentl/', example: 'Ecotourism minimizes environmental impact.', topic: 'Ecotourism', createdAt: now }
      ];
      for (const item of vocabItems) await addDoc(vocabRef, item);

      // Practice Seeds
      const practiceRef = collection(db, 'questions');
      const practiceItems = [
        { type: 'multiple_choice', content: 'She (go) ___ to school every day.', options: ['go', 'goes', 'going', 'gone'], correctAnswer: 'goes', difficulty: 'easy', createdAt: now },
        { type: 'multiple_choice', content: 'Listen! The bird (sing) ___ on the tree.', options: ['sing', 'sings', 'is singing', 'was singing'], correctAnswer: 'is singing', difficulty: 'easy', createdAt: now },
        { type: 'multiple_choice', content: 'If I (have) ___ money, I will buy that car.', options: ['have', 'has', 'had', 'having'], correctAnswer: 'have', difficulty: 'medium', createdAt: now },
        { type: 'multiple_choice', content: 'The floor (clean) ___ by Mary yesterday.', options: ['clean', 'cleans', 'was cleaned', 'is cleaned'], correctAnswer: 'was cleaned', difficulty: 'medium', createdAt: now },
        { type: 'multiple_choice', content: 'We (not/see) ___ him since last week.', options: ['don\'t see', 'didn\'t see', 'haven\'t seen', 'hasn\'t seen'], correctAnswer: 'haven\'t seen', difficulty: 'medium', createdAt: now },
        { type: 'multiple_choice', content: 'He is the man ___ son won the prize.', options: ['who', 'whom', 'whose', 'which'], correctAnswer: 'whose', difficulty: 'hard', createdAt: now },
        { type: 'multiple_choice', content: 'You should avoid ___ too much fast food.', options: ['eat', 'to eat', 'eating', 'ate'], correctAnswer: 'eating', difficulty: 'medium', createdAt: now },
        { type: 'multiple_choice', content: 'I wish I ___ a doctor in the future.', options: ['am', 'was', 'were', 'will be'], correctAnswer: 'were', difficulty: 'medium', createdAt: now },
        { type: 'fill_blank', content: 'They usually ___ (play) football on Sundays.', correctAnswer: 'play', difficulty: 'easy', createdAt: now },
        { type: 'fill_blank', content: 'Yesterday, I ___ (buy) a new computer.', correctAnswer: 'bought', difficulty: 'easy', createdAt: now }
      ];
      for (const item of practiceItems) await addDoc(practiceRef, item);

      // Exam Seeds
      const examRef = collection(db, 'exams');
      const examItems = [
        { title: 'Đề thi giữa kỳ I - Tiếng Anh 10', durationMinutes: 45, description: 'Kiểm tra Unit 1, 2, 3.', createdAt: now },
        { title: 'Đề thi học kỳ I - Tiếng Anh 10', durationMinutes: 60, description: 'Tổng hợp kiến thức học kỳ 1.', createdAt: now },
        { title: 'Đề thi Tuyển sinh lớp 10 - Đề mã 01', durationMinutes: 60, description: 'Cấu trúc thi chính thức.', createdAt: now }
      ];
      for (const item of examItems) await addDoc(examRef, item);

      toast.success("Đã nạp toàn bộ dữ liệu mẫu lớp 10 thành công!");
      fetchContent();
    } catch (err: any) {
      toast.error("Lỗi khi nạp dữ liệu: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveContent = async (data: any) => {
    setUpdating(true);
    try {
      const collectionName = contentSubTab === 'grammar' ? 'grammar' 
                          : contentSubTab === 'vocabulary' ? 'flashcards'
                          : contentSubTab === 'practice' ? 'questions'
                          : 'exams';
      
      const payload = {
        ...data,
        updatedAt: new Date().toISOString()
      };

      // Convert comma-separated strings to arrays where needed
      if (payload.examples && typeof payload.examples === 'string') {
        payload.examples = payload.examples.split(',').map((s: string) => s.trim());
      }
      if (payload.options && typeof payload.options === 'string') {
        payload.options = payload.options.split(',').map((s: string) => s.trim());
      }
      if (payload.signs && typeof payload.signs === 'string') {
        payload.signs = payload.signs.split(',').map((s: string) => s.trim());
      }

      // Handle nested quiz object for grammar
      if (contentSubTab === 'grammar' && payload.quizQuestion) {
        payload.quiz = {
          question: payload.quizQuestion,
          options: payload.quizOptions ? payload.quizOptions.split(',').map((s: string) => s.trim()) : [],
          correct: payload.quizCorrect
        };
        // Remove flattened fields to keep DB clean
        delete payload.quizQuestion;
        delete payload.quizOptions;
        delete payload.quizCorrect;
      }

      if (editingContent?.id) {
        await setDoc(doc(db, collectionName, editingContent.id), payload, { merge: true });
        toast.success("Đã cập nhật nội dung thành công!");
      } else {
        payload.createdAt = new Date().toISOString();
        await addDoc(collection(db, collectionName), payload);
        toast.success("Đã thêm nội dung mới thành công!");
      }
      setEditingContent(null);
      fetchContent();
    } catch (err: any) {
      toast.error("Lỗi khi lưu nội dung: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa nội dung này không?")) return;
    setUpdating(true);
    try {
      const collectionName = contentSubTab === 'grammar' ? 'grammar' 
                          : contentSubTab === 'vocabulary' ? 'flashcards'
                          : contentSubTab === 'practice' ? 'questions'
                          : 'exams';
      await deleteDoc(doc(db, collectionName, id));
      toast.success("Đã xóa nội dung thành công!");
      fetchContent();
    } catch (err: any) {
      toast.error("Lỗi khi xóa nội dung: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    // Validate password complexity if a new one is provided
    if (newPassword) {
      const regex = /^[A-Z](?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{7,}$/;
      if (!regex.test(newPassword)) {
        toast.error("Mật khẩu chưa đủ mạnh: Chữ đầu viết hoa, tối thiểu 8 ký tự, có số và ký tự đặc biệt (!@#...)");
        return;
      }
    }

    setUpdating(true);
    try {
      const userRef = doc(db, 'users', editingUser.id);
      const updateData: any = { username: editingUser.username };
      if (newPassword) {
        updateData.password = newPassword;
      }

      await setDoc(userRef, updateData, { merge: true });
      setUsersList(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updateData } : u));
      toast.success("Đã cập nhật thông tin thành công!");
      setEditingUser(null);
      setNewPassword('');
    } catch (err: any) {
      toast.error("Lỗi khi cập nhật: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingData(true);
    setAiResponse("Đang phân tích và khởi tạo dữ liệu mẫu...");
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Chưa cấu hình VITE_GEMINI_API_KEY trong Environment Variables.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const schemas: any = {
        flashcards: {
          type: "object",
          properties: {
            word: { type: "string" },
            meaning: { type: "string" },
            pronunciation: { type: "string" },
            example: { type: "string" },
            topic: { type: "string" }
          },
          required: ["word", "meaning"]
        },
        questions: {
          type: "object",
          properties: {
            type: { type: "string", description: "multiple_choice, fill_blank, sorting, listening" },
            content: { type: "string" },
            options: { type: "array", items: { type: "string" } },
            correctAnswer: { type: "string" },
            explanation: { type: "string" },
            difficulty: { type: "string", description: "easy, medium, hard" }
          },
          required: ["type", "content", "correctAnswer"]
        },
        grammar: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            structure: { type: "string" },
            signs: { type: "array", items: { type: "string" } },
            order: { type: "number" }
          },
          required: ["title", "description", "structure"]
        },
        exams: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            durationMinutes: { type: "number" },
            questions: { type: "array" }
          },
          required: ["title", "durationMinutes"]
        }
      };

      const prompt = `Bạn là chuyên gia về Tiếng Anh và cấu trúc dữ liệu JSON.
Hành động: Phân tích yêu cầu "${aiPrompt}" và tạo ra bộ dữ liệu mẫu phù hợp cho bảng "${targetCollection}".
Lưu ý đặc biệt:
- Nếu yêu cầu là một danh sách từ vựng thô, hãy chia chúng thành các "topic" (chủ đề) Tiếng Anh phù hợp (ví dụ: Family, Work, Nature, Tech...).
- Đảm bảo "pronunciation" (phiên âm) chính xác theo chuẩn IPA.
- Phần "example" phải là một câu Tiếng Anh hay, minh họa rõ cách dùng từ.
- Trả về kết quả là một MẢNG các đối tượng JSON hợp lệ.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "array",
            items: schemas[targetCollection]
          }
        }
      });

      const text = response.text || "";
      setAiResponse(text);
    } catch(err: any) {
      toast.error("Lỗi AI (Flash): " + err.message);
      setAiResponse("");
    } finally {
      setIsGeneratingData(false);
    }
  };

  const handleImportJSON = async (jsonData: string) => {
    try {
      if (!jsonData.trim()) return;
      const data = JSON.parse(jsonData);
      if (!Array.isArray(data)) {
        toast.error("Dữ liệu phải là một mảng JSON (Array [ { ... } ])");
        return;
      }
      if (!window.confirm(`Bồ sắp nhập dữ liệu ${data.length} nội dung vào collection "${targetCollection}". Tiếp tục chứ?`)) return;

      setUpdating(true);
      let count = 0;
      for (const item of data) {
         await addDoc(collection(db, targetCollection), {
            ...item,
            createdAt: new Date().toISOString()
         });
         count++;
      }
      toast.success(`Đã thêm thành công ${count} nội dung!`);
      setAiResponse(""); // Clear sau khi nhập thành công
    } catch(err: any) {
      toast.error("Lỗi Parse/Nhập dữ liệu: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAiResponse(event.target?.result as string);
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input để cho phép tải file cùng tên lần sau nều cần
  };

  useEffect(() => {
    const fetchMaintenance = async () => {
      const docRef = doc(db, 'settings', 'maintenance');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setIsMaintenance(snap.data().active || false);
      }
    };
    fetchMaintenance();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'content') {
      fetchContent();
    }
  }, [activeTab, contentSubTab]);

  const toggleMaintenance = async () => {
    setUpdating(true);
    try {
      const docRef = doc(db, 'settings', 'maintenance');
      await setDoc(docRef, { active: !isMaintenance }, { merge: true });
      setIsMaintenance(!isMaintenance);
      toast.success(`Đã ${!isMaintenance ? 'BẬT' : 'TẮT'} chế độ bảo trì`);
    } catch (err: any) {
      toast.error("Lỗi khi cập nhật bảo trì: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const deleteUserAtAdmin = async (userId: string) => {
    if (!window.confirm("Bồ có chắc muốn xóa tài khoản này không? Thao tác này không thể hoàn tác!")) return;
    
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsersList(prev => prev.filter(u => u.id !== userId));
      toast.success("Đã xóa tài khoản thành công khỏi dữ liệu!");
      toast.error("Lưu ý: Bạn cần vào Firebase Auth để xóa ID đăng nhập chính thức.");
    } catch (err: any) {
      toast.error("Lỗi khi xóa: " + err.message);
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const adminCards = [
    { title: 'Người dùng', value: usersList.length || 'Sẵn sàng', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', trend: 'Nhấn tab Người dùng để xem' },
    { title: 'Bài học', value: '56', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-100', trend: 'Mới cập nhật: Qúa khứ đơn' },
    { title: 'Lượt thi thử', value: '8,420', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: '+45% tháng này' },
  ];

  return (
    <div className="max-w-6xl mx-auto h-full pt-4 pb-20 md:pb-8 space-y-8 px-4 md:px-0">
      <div className="flex gap-2 p-1 bg-white border-2 border-slate-200 rounded-3xl w-full md:w-fit overflow-x-auto no-scrollbar whitespace-nowrap">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 md:px-6 py-2 rounded-2xl font-bold transition-all text-sm md:text-base ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Tổng quan
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 md:px-6 py-2 rounded-2xl font-bold transition-all text-sm md:text-base ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Quản lý Người dùng
        </button>
        <button 
          onClick={() => setActiveTab('content')}
          className={`px-4 md:px-6 py-2 rounded-2xl font-bold transition-all text-sm md:text-base ${activeTab === 'content' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Quản lý Nội dung
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-4 md:px-6 py-2 rounded-2xl font-bold transition-all text-sm md:text-base ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Hệ thống
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="p-6 md:p-8 rounded-[32px] bg-white border-2 border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest">Khu vực quản trị</span>
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 size={12} /> Hệ thống ổn định
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-800">Chào Admin {user.username}!</h1>
              <p className="text-slate-500 font-medium text-sm md:text-base">Bảng điều khiển quản lý hệ thống luyện thi tiếng Anh 10.</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Button onClick={() => setActiveTab('settings')} variant="outline" className="h-12 flex-1 md:flex-none px-6 rounded-2xl font-bold bg-white text-slate-700 border-2 border-slate-100 flex items-center justify-center gap-2">
                <Settings size={18} /> Cài đặt
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {adminCards.map((card, i) => (
              <Card key={i} className="p-1 border-2 border-slate-100 shadow-none hover:border-slate-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}>
                      <card.icon className="w-8 h-8" />
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.title}</div>
                  </div>
                  <div className="text-4xl font-black text-slate-800 mb-1">{card.value}</div>
                  <div className="text-sm font-medium text-slate-500">{card.trend}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[32px] border-2 border-slate-200 shadow-none">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                 <Clock className="text-indigo-600" /> Hoạt động gần đây
              </h2>
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <BookOpen size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">Cập nhật Unit {i + 5}: {i===1 ? 'Quá khứ đơn' : i===2 ? 'Hiện tại tiếp diễn' : 'Tương lai gần'}</div>
                      <div className="text-sm text-slate-400 font-medium">15 phút trước • Người đăng: lekimlam</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-800">Quản lý Người dùng</h2>
                <p className="text-slate-500 font-medium">Danh sách toàn bộ tài khoản học viên và quản trị viên.</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                 <Button onClick={fetchUsers} variant="outline" disabled={loadingUsers} className="rounded-2xl h-12 px-6 font-bold flex items-center gap-2 border-2">
                   <Clock size={18} className={loadingUsers ? 'animate-spin' : ''} />
                   {loadingUsers ? '...' : 'Làm mới dữ liệu'}
                 </Button>
              </div>
           </div>

           <div className="bg-white border-2 border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-400 text-xs uppercase tracking-widest">
                         <th className="px-6 py-5">Người dùng</th>
                         <th className="px-6 py-5">Định danh</th>
                         <th className="px-6 py-5 text-center">Vai trò</th>
                         <th className="px-6 py-5">Mật khẩu</th>
                         <th className="px-6 py-5">Ngày tạo</th>
                         <th className="px-6 py-5 text-right px-8">Thao tác</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 font-medium">
                      {usersList.length === 0 && !loadingUsers ? (
                        <tr>
                           <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold italic">Chưa có người dùng nào được tạo.</td>
                        </tr>
                      ) : (
                        usersList.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                               <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                    {u.username.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-800">{u.username}</div>
                                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{u.id.substring(0, 8)}</div>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600 mb-0.5">
                                  <Mail size={14} className="text-slate-400" /> {u.email}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                 <Shield size={10} /> {u.role === 'admin' ? 'Admin' : 'User'}
                               </span>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2 font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl w-fit border border-indigo-100">
                                  <Key size={14} /> {u.password || '••••••••'}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-400">
                               {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '---'}
                            </td>
                            <td className="px-6 py-4 text-right px-8">
                               <div className="flex justify-end gap-2">
                                  <Link to={`/profile/${u.id}`}>
                                     <Button 
                                       variant="ghost" 
                                       size="icon"
                                       className="w-10 h-10 rounded-xl text-emerald-400 hover:text-emerald-600 hover:bg-slate-100"
                                     >
                                       <UserIcon size={18} />
                                     </Button>
                                  </Link>
                                  <Button 
                                    onClick={() => { setEditingUser(u); setNewPassword(u.password || ''); }}
                                    variant="ghost" 
                                    size="icon"
                                    className="w-10 h-10 rounded-xl text-indigo-400 hover:text-indigo-600 hover:bg-slate-100"
                                  >
                                    <Key size={18} />
                                  </Button>
                                  <Button 
                                    onClick={() => deleteUserAtAdmin(u.id)}
                                    variant="ghost" 
                                    size="icon"
                                    className="w-10 h-10 rounded-xl text-red-400 hover:text-red-700"
                                    disabled={u.role === 'admin'}
                                  >
                                    <Trash2 size={18} />
                                  </Button>
                               </div>
                            </td>
                          </tr>
                        ))
                      )}
                   </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-800">Quản lý Nội dung</h2>
              <p className="text-slate-500 font-medium">Thêm, sửa, xóa các bài học và câu hỏi.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={seedData} 
                variant="outline"
                disabled={updating}
                className="rounded-2xl h-12 px-6 font-bold border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
              >
                <Database size={18} /> Nạp Dữ Liệu Mẫu
              </Button>
              <Button 
                onClick={() => setEditingContent({})} 
                className="bg-indigo-600 text-white rounded-2xl h-12 px-6 font-bold shadow-lg shadow-indigo-100 flex items-center gap-2"
              >
                <Plus size={18} /> Thêm Mới
              </Button>
            </div>
          </div>

          <div className="flex gap-2 p-1 bg-white border-2 border-slate-100 rounded-2xl w-full md:w-fit overflow-x-auto no-scrollbar">
            {[
              { id: 'grammar', name: 'Ngữ pháp', icon: BookOpen },
              { id: 'vocabulary', name: 'Từ vựng', icon: Layers },
              { id: 'practice', name: 'Luyện tập', icon: PlaySquare },
              { id: 'exam', name: 'Thi thử', icon: Trophy }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setContentSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${contentSubTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <tab.icon size={16} /> {tab.name}
              </button>
            ))}
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-400 text-xs uppercase tracking-widest">
                    <th className="px-6 py-5">Nội dung</th>
                    <th className="px-6 py-5">Thông tin thêm</th>
                    <th className="px-6 py-5">Ngày tạo</th>
                    <th className="px-6 py-5 text-right px-8">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {contentList.length === 0 && !loadingContent ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold italic">Chưa có nội dung nào trong mục này.</td>
                    </tr>
                  ) : (
                    contentList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">
                            {contentSubTab === 'grammar' ? item.title 
                              : contentSubTab === 'vocabulary' ? item.word
                              : item.title || item.content?.substring(0, 50) + '...'}
                          </div>
                          <div className="text-xs text-slate-400 font-medium truncate max-w-[300px]">
                            {contentSubTab === 'grammar' ? item.description 
                              : contentSubTab === 'vocabulary' ? item.meaning
                              : item.type}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                            {contentSubTab === 'vocabulary' ? (item.topic || 'Chung') : (item.difficulty || item.durationMinutes + ' min' || 'ID: ' + item.id.substring(0,4))}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-400">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '---'}
                        </td>
                        <td className="px-6 py-4 text-right px-8">
                          <div className="flex justify-end gap-2">
                            <Button 
                              onClick={() => setEditingContent(item)}
                              variant="ghost" 
                              size="icon"
                              className="w-10 h-10 rounded-xl text-indigo-400 hover:text-indigo-600 hover:bg-slate-100"
                            >
                              <Settings size={18} />
                            </Button>
                            <Button 
                              onClick={() => handleDeleteContent(item.id)}
                              variant="ghost" 
                              size="icon"
                              className="w-10 h-10 rounded-xl text-red-400 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                   <Sparkles className="text-amber-500" /> Trợ lý AI & Nhập liệu
                </h2>
                <p className="text-slate-500 font-medium">Sử dụng sức mạnh của Gemini để sinh dữ liệu mẫu hoặc nhập từ file JSON.</p>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="rounded-[32px] border-2 border-slate-200 shadow-none hover:border-slate-300 transition-all overflow-hidden h-fit">
                 <CardHeader className="bg-slate-50 p-6 border-b-2 border-slate-100">
                    <CardTitle className="font-black text-slate-800 flex items-center gap-2">
                       Tạo dữ liệu bằng AI
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-4">
                    <p className="text-sm font-medium text-slate-500">
                       Nhập yêu cầu để Gemini tạo dữ liệu mẫu (Ví dụ: "Tạo 5 flashcards chủ đề gia đình", "Tạo 5 câu trắc nghiệm ngữ pháp quá khứ đơn").
                    </p>
                    <textarea 
                       rows={4}
                       placeholder="Nhập yêu cầu tạo dữ liệu vào đây..."
                       value={aiPrompt}
                       onChange={(e) => setAiPrompt(e.target.value)}
                       className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-medium resize-none focus:border-indigo-500 transition-all"
                    />
                    <Button 
                       onClick={handleGenerateAI}
                       disabled={isGeneratingData || !aiPrompt.trim()}
                       className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                    >
                       {isGeneratingData ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                       ) : (
                          <><Sparkles size={18} /> TẠO DỮ LIỆU JSON</>
                       )}
                    </Button>
                 </CardContent>
              </Card>

              <Card className="rounded-[32px] border-2 border-slate-200 shadow-none hover:border-slate-300 transition-all overflow-hidden">
                 <CardHeader className="bg-slate-50 p-6 border-b-2 border-slate-100 flex flex-row items-center justify-between">
                    <CardTitle className="font-black text-slate-800 flex items-center gap-2">
                       <FileJson size={20} /> Kết quả JSON / Upload
                    </CardTitle>
                    <div>
                       <input 
                         type="file" 
                         accept=".json" 
                         id="json-upload" 
                         className="hidden" 
                         onChange={handleFileUpload} 
                       />
                       <label htmlFor="json-upload" className="cursor-pointer bg-white border-2 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2">
                          <Upload size={14} /> Tải file lên
                       </label>
                    </div>
                 </CardHeader>
                 <CardContent className="p-6 space-y-4">
                    <textarea 
                       rows={8}
                       placeholder="[\n  {\n    'word': 'Sample',\n    'meaning': 'Mẫu'\n  }\n]"
                       value={aiResponse}
                       onChange={(e) => setAiResponse(e.target.value)}
                       className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-mono text-sm tracking-tight resize-none focus:border-indigo-500 transition-all whitespace-pre"
                    />
                    
                    <div className="pt-2 border-t-2 border-slate-100 space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhập vào Collection (Bảng dữ liệu)</label>
                       <div className="flex flex-col md:flex-row gap-4">
                          <select 
                             value={targetCollection}
                             onChange={(e) => setTargetCollection(e.target.value)}
                             className="flex-1 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold focus:border-indigo-500"
                          >
                             <option value="flashcards">Từ vựng (flashcards)</option>
                             <option value="questions">Câu hỏi luyện tập (questions)</option>
                             <option value="grammar">Ngữ pháp (grammar)</option>
                             <option value="exams">Đề thi (exams)</option>
                          </select>
                          <Button 
                             onClick={() => handleImportJSON(aiResponse)}
                             disabled={updating || !aiResponse.trim() || isGeneratingData}
                             className="h-14 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-lg shadow-emerald-200"
                          >
                             {updating ? 'ĐANG NHẬP...' : 'NHẬP VÀO DATABASE'}
                          </Button>
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
           <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
                 <AlertTriangle className="text-amber-400" /> Hệ thống Bảo trì
              </h2>
              <p className="text-slate-400 font-medium mb-8 text-sm">Tính năng này cho phép chặn truy cập người dùng trong lúc nâng cấp.</p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
                  <div>
                    <div className="font-bold text-lg">Chế độ bảo trì</div>
                  </div>
                  <div 
                    onClick={toggleMaintenance}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${isMaintenance ? 'bg-amber-500' : 'bg-slate-700'}`}
                   >
                    <motion.div animate={{ x: isMaintenance ? 24 : 0 }} className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
                <Button onClick={toggleMaintenance} disabled={updating} className="w-full h-14 rounded-2xl font-black bg-indigo-600 text-white">
                  {updating ? 'ĐANG CẬP NHẬT...' : (isMaintenance ? 'TẮT BẢO TRÌ' : 'BẬT BẢO TRÌ')}
                </Button>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] border-2 border-slate-200 flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-4">
                <CheckCircle2 size={40} />
             </div>
             <h3 className="text-xl font-black text-slate-800 mb-2">Hỗ trợ 100% Cài đặt</h3>
             <p className="text-slate-500 font-medium mb-6">Mọi thay đổi bồ thực hiện sẽ có hiệu lực ngay lập tức lên toàn bộ học sinh.</p>
          </div>
        </div>
      )}

      {/* Content Editor Modal */}
      <AnimatePresence>
         {editingContent && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                onClick={() => setEditingContent(null)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-[32px] p-8 w-full max-w-2xl relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">Biên tập nội dung</h3>
                    <p className="text-slate-500 font-medium">Bồ đang chỉnh sửa mục: <span className="text-indigo-600 font-black">{contentSubTab.toUpperCase()}</span></p>
                  </div>
                  <Button variant="ghost" onClick={() => setEditingContent(null)}><X size={24} /></Button>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data: any = {};
                  formData.forEach((value, key) => {
                    data[key] = value;
                  });
                  handleSaveContent(data);
                }} className="space-y-6">
                  
                  {contentSubTab === 'grammar' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tiêu đề bài học</label>
                        <input name="title" defaultValue={editingContent.title} required className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mô tả ngắn</label>
                         <textarea name="description" defaultValue={editingContent.description} required className="w-full h-24 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 font-bold" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dấu hiệu nhận biết</label>
                         <input name="signs" defaultValue={editingContent.signs} className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Công thức chính</label>
                         <input name="formula" defaultValue={editingContent.formula} className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ví dụ (Phân cách bằng dấu phẩy)</label>
                         <textarea name="examples" defaultValue={editingContent.examples} className="w-full h-20 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 font-bold" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cấu trúc (mô tả dài)</label>
                         <textarea name="structure" defaultValue={editingContent.structure} required className="w-full h-24 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 font-bold" />
                      </div>
                      
                      <div className="pt-4 border-t border-slate-100 mt-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Bài kiểm tra nhanh (Tùy chọn)</h4>
                        <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Câu hỏi Quiz</label>
                             <input name="quizQuestion" defaultValue={editingContent.quiz?.question} className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Các lựa chọn (Phân cách bằng dấu phẩy)</label>
                             <input name="quizOptions" defaultValue={editingContent.quiz?.options?.join(', ')} className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Đáp án đúng</label>
                             <input name="quizCorrect" defaultValue={editingContent.quiz?.correct} className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {contentSubTab === 'vocabulary' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Từ vựng</label>
                          <input name="word" defaultValue={editingContent.word} required className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phiên âm</label>
                          <input name="pronunciation" defaultValue={editingContent.pronunciation} className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold" />
                        </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nghĩa của từ</label>
                         <input name="meaning" defaultValue={editingContent.meaning} required className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ví dụ sử dụng</label>
                         <textarea name="example" defaultValue={editingContent.example} className="w-full h-20 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 font-bold" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Chủ đề (Topic)</label>
                         <input name="topic" defaultValue={editingContent.topic} className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold" />
                      </div>
                    </>
                  )}

                  {contentSubTab === 'practice' && (
                    <>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dạng câu hỏi</label>
                         <select name="type" defaultValue={editingContent.type || 'multiple_choice'} className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold">
                            <option value="multiple_choice">Trắc nghiệm</option>
                            <option value="fill_blank">Điền từ</option>
                            <option value="listening">Nghe hiểu</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nội dung câu hỏi</label>
                         <textarea name="content" defaultValue={editingContent.content} required className="w-full h-24 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 font-bold" />
                      </div>
                      {editingContent.type !== 'fill_blank' && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Các lựa chọn (Phân cách bằng dấu phẩy)</label>
                          <input name="options" defaultValue={editingContent.options} required={editingContent.type === 'multiple_choice'} className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold" />
                        </div>
                      )}
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Đáp án đúng</label>
                         <input name="correctAnswer" defaultValue={editingContent.correctAnswer} required className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Độ khó</label>
                         <select name="difficulty" defaultValue={editingContent.difficulty || 'medium'} className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold">
                            <option value="easy">Dễ</option>
                            <option value="medium">Trung bình</option>
                            <option value="hard">Khó</option>
                         </select>
                      </div>
                    </>
                  )}

                  {contentSubTab === 'exam' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tên đề thi</label>
                        <input name="title" defaultValue={editingContent.title} required className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thời gian làm bài (phút)</label>
                         <input name="durationMinutes" type="number" defaultValue={editingContent.durationMinutes || 60} required className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mô tả đề thi</label>
                         <textarea name="description" defaultValue={editingContent.description} className="w-full h-24 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 font-bold" />
                      </div>
                    </>
                  )}

                  <div className="pt-4">
                    <Button type="submit" disabled={updating} className="w-full h-14 rounded-2xl font-black bg-indigo-600 text-white shadow-xl shadow-indigo-100">
                      {updating ? 'ĐANG XỬ LÝ...' : 'LƯU NỘI DUNG'}
                    </Button>
                  </div>
                </form>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
         {editingUser && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                onClick={() => setEditingUser(null)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-[32px] p-8 w-full max-w-md relative z-10 shadow-2xl"
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">Cấu hình User</h3>
                    <p className="text-slate-500 font-medium">Bồ đang chỉnh sửa: <span className="text-indigo-600 font-black">{editingUser.username}</span></p>
                  </div>
                  <Button variant="ghost" onClick={() => setEditingUser(null)}><X size={24} /></Button>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Tên tài khoản</label>
                      <input 
                        type="text" 
                        value={editingUser.username} 
                        onChange={(e) => setEditingUser({...editingUser, username: e.target.value})} 
                        className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Reset Mật Khẩu (Plain Text)</label>
                      <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold" />
                      <p className="text-[10px] text-slate-400 font-medium px-1">
                         Yêu cầu: 8+ ký tự, chữ đầu viết hoa, có số và ký tự đặc biệt
                      </p>
                   </div>
                   <Button onClick={handleUpdateUser} disabled={updating} className="w-full h-14 rounded-2xl font-black bg-indigo-600 text-white">
                      {updating ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
                   </Button>
                </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}
