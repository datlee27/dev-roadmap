import { Phase, RoadmapConfig, Rule, ScheduleDay, TaskPriority, TrackKey, TrackMeta } from './types';

export const TRACKS: Record<TrackKey, TrackMeta> = {
  react: { label: '⚛ React', color: '#61dafb' },
  backend: { label: '☕ Java Backend', color: '#f89820' },
  lc: { label: '🧩 LeetCode', color: '#ff6b35' },
  docker: { label: '🐳 Docker', color: '#2496ed' },
  ielts: { label: '🗣 IELTS', color: '#c084fc' },
  project: { label: '🚀 Project', color: '#34d399' },
};

export const PHASES: Phase[] = [
  {
    id: 'p1',
    label: 'Phase 1',
    sublabel: 'Tuần 1-4',
    desc: 'Củng cố nền tảng',
    goal: 'React vững core + hooks · Backend CRUD cơ bản · LeetCode quen tay',
    color: '#e8ff47',
    tracks: [
      {
        track: 'react',
        steps: [
          {
            id: 'r1-1',
            title: 'JSX + Props + State',
            detail: 'Hiểu cú pháp JSX, truyền props, dùng useState. Làm Counter / To-do đơn giản.',
          },
          {
            id: 'r1-2',
            title: 'Event + Conditional + List rendering',
            detail: 'onClick, onChange, map(), key, &&, ternary. Làm list filter component.',
          },
          {
            id: 'r1-3',
            title: 'useEffect + useRef',
            detail: 'Lifecycle, side effects, cleanup. Khi nào dùng useRef thay state.',
          },
          {
            id: 'r1-4',
            title: 'useMemo + useCallback',
            detail: 'Re-render optimization. Khi nào thực sự cần dùng - đừng over-optimize.',
          },
          {
            id: 'r1-5',
            title: 'Folder structure + Reusable component',
            detail: 'pages/, components/, hooks/. Tách Button, Input, Modal thành component dùng lại.',
          },
          {
            id: 'r1-6',
            title: 'Custom hooks + API call (axios)',
            detail: 'Tách useApi(), useFetch(). Gọi GET/POST với axios, handle loading + error.',
          },
        ],
      },
      {
        track: 'backend',
        steps: [
          {
            id: 'b1-1',
            title: 'Spring Boot setup',
            detail: 'Tạo project bằng Spring Initializr. Hiểu @SpringBootApplication, application.properties.',
          },
          {
            id: 'b1-2',
            title: 'Controller -> Service -> Repository',
            detail: 'Hiểu 3 layer. @RestController, @Service, @Repository. Dependency Injection.',
          },
          {
            id: 'b1-3',
            title: 'REST API chuẩn + JPA/MySQL',
            detail: 'GET/POST/PUT/DELETE. @Entity, @Id, JpaRepository. Connect MySQL, test bằng Postman.',
          },
          {
            id: 'b1-4',
            title: 'Validation + Exception handling',
            detail: '@Valid, BindingResult, @ExceptionHandler, trả về lỗi có cấu trúc rõ ràng.',
          },
        ],
      },
      {
        track: 'lc',
        steps: [
          {
            id: 'lc1-1',
            title: 'Array cơ bản',
            detail: 'Two Sum, Best Time to Buy, Contains Duplicate, Maximum Subarray.',
          },
          {
            id: 'lc1-2',
            title: 'String cơ bản',
            detail: 'Valid Anagram, Reverse String, Valid Palindrome.',
          },
          {
            id: 'lc1-3',
            title: 'HashMap pattern',
            detail: 'Group Anagrams, Top K Frequent Elements.',
          },
        ],
      },
      {
        track: 'ielts',
        steps: [
          {
            id: 'ie1-1',
            title: 'Listening daily 15-20 phút',
            detail: 'BBC 6 Minute English, IELTS practice tests. Nghe + điền từ.',
          },
          {
            id: 'ie1-2',
            title: 'Speaking shadowing 10 phút',
            detail: 'Chọn 1 đoạn nghe -> nhắc lại -> ghi âm -> so sánh.',
          },
        ],
      },
    ],
  },
  {
    id: 'p2',
    label: 'Phase 2',
    sublabel: 'Tuần 5-8',
    desc: 'Fullstack cơ bản',
    goal: 'Connect React ↔ Spring Boot · Auth JWT · Bắt đầu Docker',
    color: '#61dafb',
    tracks: [
      {
        track: 'react',
        steps: [
          {
            id: 'r2-1',
            title: 'Context API',
            detail: 'createContext, useContext, Provider. Dùng cho theme / auth state.',
          },
          {
            id: 'r2-2',
            title: 'React Router v6',
            detail: 'BrowserRouter, Routes, useParams, useNavigate, Protected route.',
          },
          {
            id: 'r2-3',
            title: 'Form validation - React Hook Form',
            detail: 'register, handleSubmit, errors, yup schema validation.',
          },
          {
            id: 'r2-4',
            title: 'Auth UI + JWT token',
            detail: 'Login form -> nhận token -> lưu -> gắn vào header axios interceptor.',
          },
        ],
      },
      {
        track: 'backend',
        steps: [
          {
            id: 'b2-1',
            title: 'Pagination + Sorting',
            detail: 'Pageable, Page<T>, trả về meta (total, page, size).',
          },
          {
            id: 'b2-2',
            title: 'JWT Authentication',
            detail: 'spring-security + jjwt. Register/Login trả token. Filter xác thực request.',
          },
          {
            id: 'b2-3',
            title: 'CORS config',
            detail: '@CrossOrigin hoặc config global để React (3000) gọi được API (8080).',
          },
        ],
      },
      {
        track: 'docker',
        steps: [
          {
            id: 'd2-1',
            title: 'Image vs Container',
            detail: 'docker pull, docker run, docker ps, docker stop. Hiểu khái niệm cơ bản.',
          },
          {
            id: 'd2-2',
            title: 'Viết Dockerfile',
            detail: 'FROM, COPY, RUN, CMD. Dockerize Spring Boot app. Build + chạy thành công.',
          },
        ],
      },
      {
        track: 'lc',
        steps: [
          {
            id: 'lc2-1',
            title: 'Two Pointers',
            detail: 'Valid Palindrome II, Three Sum, Container With Most Water.',
          },
          {
            id: 'lc2-2',
            title: 'Sliding Window',
            detail: 'Longest Substring Without Repeating, Maximum Average Subarray.',
          },
        ],
      },
    ],
  },
  {
    id: 'p3',
    label: 'Phase 3',
    sublabel: 'Tuần 9-12',
    desc: 'Project + Deploy + CV ready',
    goal: 'Project hoàn chỉnh · Docker Compose · LeetCode 50-100 bài · Sẵn sàng phỏng vấn',
    color: '#34d399',
    tracks: [
      {
        track: 'project',
        steps: [
          {
            id: 'pj-1',
            title: 'Setup project - React TS + Spring Boot',
            detail: 'Tạo 2 repo riêng. Config CORS, kết nối MySQL, test API bằng Postman.',
          },
          {
            id: 'pj-2',
            title: 'CRUD tasks hoàn chỉnh',
            detail: 'Create / Read / Update / Delete. UI đẹp, có loading state, error handling.',
          },
          {
            id: 'pj-3',
            title: 'Auth - Register + Login',
            detail: 'JWT flow end-to-end. Protected routes. Token refresh nếu có thể.',
          },
          {
            id: 'pj-4',
            title: 'Filter + Search + Pagination',
            detail: 'Filter theo status/priority. Search theo tên. Phân trang phía backend.',
          },
          {
            id: 'pj-5',
            title: 'Docker Compose deploy',
            detail: 'docker-compose.yml chạy cả React + Spring Boot + MySQL. README đầy đủ.',
          },
          {
            id: 'pj-6',
            title: 'Push GitHub + viết README',
            detail: 'Demo link, tech stack, how to run, screenshot. Đây là thứ nhà tuyển dụng xem.',
          },
        ],
      },
      {
        track: 'react',
        steps: [
          {
            id: 'r3-1',
            title: 'Zustand - state management',
            detail: 'Thay Context cho auth/cart state. Đơn giản hơn Redux nhiều.',
          },
          {
            id: 'r3-2',
            title: 'Code splitting + lazy loading',
            detail: 'React.lazy, Suspense. Giảm bundle size ban đầu.',
          },
        ],
      },
      {
        track: 'docker',
        steps: [
          {
            id: 'd3-1',
            title: 'Docker Compose',
            detail: 'docker-compose.yml. Kết nối nhiều service: FE + BE + DB trong 1 file.',
          },
        ],
      },
      {
        track: 'lc',
        steps: [
          {
            id: 'lc3-1',
            title: 'Stack + Queue',
            detail: 'Valid Parentheses, Min Stack, Implement Queue using Stacks.',
          },
          {
            id: 'lc3-2',
            title: 'Mock interview',
            detail: 'Giải 2 bài trong 45 phút. Giải thích approach trước khi code.',
          },
        ],
      },
    ],
  },
];

export const DEFAULT_ROADMAP_CONFIG: RoadmapConfig = {
  tracks: TRACKS,
  phases: PHASES,
};

export const SCHEDULE: ScheduleDay[] = [
  {
    day: 'Thứ 2 - Thứ 6',
    color: '#e8ff47',
    slots: [
      {
        time: '10:00-17:00',
        label: 'Ở công ty (intern)',
        color: '#61dafb',
        desc: '80% làm React task. Khi rảnh: đọc codebase, IELTS listening (đeo tai nghe). Ghi lại 1-2 pattern mỗi ngày.',
      },
      {
        time: '19:00-20:30',
        label: 'Backend',
        color: '#f89820',
        desc: 'Học lý thuyết 30p -> code thực hành 60p. Luôn test bằng Postman sau mỗi API.',
      },
      {
        time: '20:30-21:15',
        label: 'LeetCode',
        color: '#ff6b35',
        desc: '1 bài/ngày. Đọc đề 5p -> nghĩ approach -> code -> xem solution. Đừng xem hint sớm.',
      },
      {
        time: '21:15-21:45',
        label: 'IELTS',
        color: '#c084fc',
        desc: 'Listening 15p + Shadowing 10p + Reading 1 đoạn ngắn.',
      },
      {
        time: '21:45-22:30',
        label: 'React side project',
        color: '#61dafb',
        desc: 'Build thêm feature cho Task Manager App. Refactor code. Không học lý thuyết mới.',
      },
    ],
  },
  {
    day: 'Thứ 7',
    color: '#f89820',
    slots: [
      {
        time: 'Sáng (3-4h)',
        label: 'Deep work - Build project',
        color: '#34d399',
        desc: 'Chọn 1 feature lớn -> làm từ BE -> FE -> test -> commit. Chỉ build, không học lý thuyết.',
      },
      {
        time: 'Chiều (1h)',
        label: 'Docker',
        color: '#2496ed',
        desc: 'Dockerfile -> build -> run -> sửa lỗi. Docker Compose từ tuần 6+.',
      },
      {
        time: 'Tối (30-60p)',
        label: 'IELTS Reading/Writing',
        color: '#c084fc',
        desc: '1 bài reading hoặc viết 1 đoạn writing task 1/2 ngắn.',
      },
    ],
  },
  {
    day: 'Chủ nhật',
    color: '#34d399',
    slots: [
      {
        time: '1-2h',
        label: 'IELTS + Review tuần',
        color: '#c084fc',
        desc: 'Xem lại ghi chép tuần. Ôn 3-5 LeetCode đã làm. Không học mới. Ngủ đủ giấc.',
      },
    ],
  },
];

export const RULES: Rule[] = [
  {
    emoji: '🔨',
    title: 'Build, đừng chỉ xem',
    desc: 'Mỗi concept học xong phải có code tay. Xem tutorial mà không code là lãng phí 80% thời gian.',
  },
  {
    emoji: '🚀',
    title: 'Project là thứ duy nhất tính',
    desc: 'CV fresher không có project thực thì không qua được vòng lọc. Task Manager App là ưu tiên tuyệt đối.',
  },
  {
    emoji: '🏢',
    title: 'Intern là lớp học miễn phí tốt nhất',
    desc: 'Mỗi ngày ghi lại 1 thứ học được từ codebase công ty. Sau 3 tháng bạn có kho kiến thức thực chiến.',
  },
  {
    emoji: '🧩',
    title: 'LeetCode: 1 bài/ngày là đủ',
    desc: 'Mục tiêu không phải giỏi thuật toán mà là quen pattern. Đừng dành quá 1 tiếng cho bất kỳ bài nào.',
  },
];

export const PRIORITY_META: Record<TaskPriority, { label: string; color: string; rank: number }> = {
  urgent: { label: 'Khẩn cấp', color: '#ff5d5d', rank: 4 },
  high: { label: 'Cao', color: '#ff8f1f', rank: 3 },
  medium: { label: 'Trung bình', color: '#f0da48', rank: 2 },
  low: { label: 'Thấp', color: '#5cd893', rank: 1 },
};
