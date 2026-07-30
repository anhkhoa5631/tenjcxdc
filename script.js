// Dữ liệu bài tập chuẩn hóa đa ngôn ngữ
const exerciseDatabase = {
    javascript: {
        filename: "solution.js",
        snippets: {
            sum: `function sum(a, b) {\n    return a + b;\n}`,
            array_double: `const numbers = [1, 2, 3];\nconst doubled = numbers.map(n => n * 2);`,
            loop_hello: `for (let i = 0; i < 5; i++) {\n    console.log("Hello CodeES");\n}`
        }
    },
    html: {
        filename: "index.html",
        snippets: {
            html_card: `<div class="card">\n    <h2>CodeES</h2>\n    <p>Rèn luyện tư duy lập trình</p>\n</div>`
        }
    },
    css: {
        filename: "style.css",
        snippets: {
            css_flex: `.container {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}`
        }
    },
    python: {
        filename: "main.py",
        snippets: {
            sum: `def sum_two_numbers(a, b):\n    return a + b`,
            loop_hello: `for i in range(5):\n    print("Hello CodeES")`
        }
    },
    cpp: {
        filename: "main.cpp",
        snippets: {
            cpp_max: `int findMax(int a, int b) {\n    if (a > b) return a;\n    return b;\n}`
        }
    }
};

const codeDisplay = document.getElementById('code-display');
const codeInput = document.getElementById('code-input');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timerDisplay = document.getElementById('timer');
const resetBtn = document.getElementById('reset-btn');
const languageSelect = document.getElementById('language-select');
const tabTitle = document.getElementById('tab-title');
const exerciseItems = document.querySelectorAll('.exercise-list li');

let timer = 30;
let maxTime = 30;
let timeElapsed = 0;
let interval = null;
let isPlaying = false;
let selectedCode = "";
let totalTyped = 0;
let errors = 0;

function initGame(specificSnippetId = null) {
    clearInterval(interval);
    timer = maxTime;
    timeElapsed = 0;
    isPlaying = false;
    errors = 0;
    totalTyped = 0;
    
    timerDisplay.innerText = timer;
    wpmDisplay.innerText = 0;
    accuracyDisplay.innerText = 100;
    codeInput.value = "";
    codeInput.disabled = false;

    const currentLang = languageSelect.value;
    const langData = exerciseDatabase[currentLang];
    
    tabTitle.innerText = langData.filename;

    // Chọn snippet dựa trên cấu hình người dùng nhấn hoặc chọn ngẫu nhiên
    const snippetKeys = Object.keys(langData.snippets);
    let chosenKey = snippetKeys[0];

    if (specificSnippetId && langData.snippets[specificSnippetId]) {
        chosenKey = specificSnippetId;
    } else {
        // Tự động tìm kiếm key khớp nhất với lựa chọn sidebar
        const activeSidebarItem = document.querySelector('.exercise-list li.active');
        if (activeSidebarItem) {
            const sidebarId = activeSidebarItem.getAttribute('data-id');
            if (langData.snippets[sidebarId]) {
                chosenKey = sidebarId;
            }
        }
    }

    selectedCode = langData.snippets[chosenKey] || langData.snippets[snippetKeys[0]];
    
    // Render text
    codeDisplay.innerHTML = "";
    selectedCode.split("").forEach((char, index) => {
        const span = document.createElement('span');
        span.classList.add('char');
        if (index === 0) span.classList.add('current');
        
        if (char === "\n") {
            span.innerHTML = "↵\n";
        } else {
            span.innerText = char;
        }
        codeDisplay.appendChild(span);
    });

    codeInput.focus();
}

function startTimer() {
    interval = setInterval(() => {
        if (timer > 0) {
            timer--;
            timeElapsed++;
            timerDisplay.innerText = timer;
            calculateStats();
        } else {
            endGame();
        }
    }, 1000);
}

function calculateStats() {
    const minutes = timeElapsed / 60;
    if (minutes > 0) {
        const wpm = Math.round(((totalTyped - errors) / 5) / minutes);
        wpmDisplay.innerText = wpm < 0 ? 0 : wpm;
    }
    
    if (totalTyped > 0) {
        const accuracy = Math.round(((totalTyped - errors) / totalTyped) * 100);
        accuracyDisplay.innerText = accuracy < 0 ? 0 : accuracy;
    }
}

function endGame() {
    clearInterval(interval);
    codeInput.disabled = true;
    saveScoreToLeaderboard(Number(wpmDisplay.innerText), Number(accuracyDisplay.innerText));
    alert(`⏱️ Hoàn thành! Kết quả rèn luyện tại CodeES:\n- Tốc độ: ${wpmDisplay.innerText} WPM\n- Độ chính xác: ${accuracyDisplay.innerText}%`);
}

codeInput.addEventListener('input', () => {
    const spans = codeDisplay.querySelectorAll('.char');
    const inputVal = codeInput.value;
    totalTyped = inputVal.length;

    if (!isPlaying && inputVal.length > 0) {
        isPlaying = true;
        startTimer();
    }

    errors = 0;

    spans.forEach((span, index) => {
        const inputChar = inputVal[index];
        span.classList.remove('correct', 'incorrect', 'current');

        if (inputChar == null) {
            if (index === inputVal.length) {
                span.classList.add('current');
            }
        } else {
            const expectedChar = selectedCode[index];
            if (inputChar === expectedChar) {
                span.classList.add('correct');
            } else {
                span.classList.add('incorrect');
                errors++;
            }
        }
    });

    calculateStats();

    if (inputVal === selectedCode) {
        clearInterval(interval);
        saveScoreToLeaderboard(Number(wpmDisplay.innerText), Number(accuracyDisplay.innerText));
        setTimeout(() => {
            alert(`🎉 Chúc mừng bạn đã gõ chính xác đoạn mã tại CodeES!\n- Tốc độ: ${wpmDisplay.innerText} WPM`);
            initGame();
        }, 300);
    }
});

// Sự kiện đổi Ngôn ngữ từ Bộ Lọc
languageSelect.addEventListener('change', () => {
    const currentLang = languageSelect.value;
    // Đồng bộ kích hoạt lớp active ở cột trái nếu ngôn ngữ hỗ trợ bài đó
    const langData = exerciseDatabase[currentLang];
    const availableKeys = Object.keys(langData.snippets);
    
    exerciseItems.forEach(item => {
        const itemId = item.getAttribute('data-id');
        if (availableKeys.includes(itemId)) {
            item.style.opacity = "1";
            item.style.pointerEvents = "auto";
        } else {
            item.style.opacity = "0.4"; // Làm mờ các bài không thuộc ngôn ngữ này
            item.style.pointerEvents = "none";
        }
    });

    // Reset active về phần tử hợp lệ đầu tiên
    const firstValidItem = Array.from(exerciseItems).find(item => availableKeys.includes(item.getAttribute('data-id')));
    if (firstValidItem) {
        exerciseItems.forEach(i => i.classList.remove('active'));
        firstValidItem.classList.add('active');
    }

    initGame();
});

// Sự kiện click chọn bài ở Cột trái Sidebar
exerciseItems.forEach(item => {
    item.addEventListener('click', () => {
        exerciseItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const exerciseId = item.getAttribute('data-id');
        
        // Tìm ngôn ngữ chứa bài tập này và tự động switch bộ lọc
        for (const [lang, data] of Object.entries(exerciseDatabase)) {
            if (data.snippets[exerciseId]) {
                languageSelect.value = lang;
                break;
            }
        }
        initGame(exerciseId);
    });
});

codeDisplay.addEventListener('click', () => codeInput.focus());
resetBtn.addEventListener('click', () => initGame());

// Khởi động
initGame();
/* ============================================================
   CodeES — Phần 2: Đăng nhập, Bảng xếp hạng, Thảo luận, Kỳ thi
   Lưu ý: đây là bản demo phía trình duyệt (localStorage), chưa
   có máy chủ thật nên mật khẩu không được mã hoá an toàn.
   ============================================================ */

const STORAGE_KEYS = {
    users: 'codees_users',
    session: 'codees_session',
    scores: 'codees_scores',
    posts: 'codees_posts',
    examRegistrations: 'codees_exam_regs'
};

function loadJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
        return fallback;
    }
}

function saveJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Không thể lưu dữ liệu:', e);
    }
}

function getCurrentUser() {
    return loadJSON(STORAGE_KEYS.session, null);
}

/* ---------------- VIEW SWITCHING ---------------- */
const viewEls = {
    home: document.getElementById('view-home'),
    leaderboard: document.getElementById('view-leaderboard'),
    discussion: document.getElementById('view-discussion'),
    exam: document.getElementById('view-exam')
};

function showView(name) {
    Object.entries(viewEls).forEach(([key, el]) => {
        if (!el) return;
        el.classList.toggle('active-view', key === name);
    });
    document.querySelectorAll('#nav-menu li').forEach(li => {
        li.classList.toggle('active', li.getAttribute('data-view') === name);
    });
    if (name === 'leaderboard') renderLeaderboard();
    if (name === 'discussion') renderDiscussion();
    if (name === 'exam') renderExams();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('#nav-menu li').forEach(li => {
    li.addEventListener('click', (e) => {
        const target = li.getAttribute('data-view');
        if (!target) return; // liên kết thường (vd: CV của tôi) -> để trình duyệt điều hướng bình thường
        e.preventDefault();
        showView(target);
        if (li.id === 'nav-exercises') {
            setTimeout(() => {
                document.querySelector('.practice-area')?.scrollIntoView({ behavior: 'smooth' });
            }, 150);
        }
    });
});

/* ---------------- AUTH ---------------- */
const authModal = document.getElementById('auth-modal');
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');
const btnLogout = document.getElementById('btn-logout');
const modalClose = document.getElementById('modal-close');
const navAuth = document.getElementById('nav-auth');
const navUser = document.getElementById('nav-user');
const userNameLabel = document.getElementById('user-name-label');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

function openModal(defaultTab) {
    authModal.classList.add('open');
    switchAuthTab(defaultTab || 'login');
    loginError.textContent = '';
    registerError.textContent = '';
}

function closeModal() {
    authModal.classList.remove('open');
}

function switchAuthTab(tab) {
    const isLogin = tab === 'login';
    tabLogin.classList.toggle('active', isLogin);
    tabRegister.classList.toggle('active', !isLogin);
    loginForm.style.display = isLogin ? 'flex' : 'none';
    registerForm.style.display = isLogin ? 'none' : 'flex';
}

btnLogin.addEventListener('click', () => openModal('login'));
btnRegister.addEventListener('click', () => openModal('register'));
modalClose.addEventListener('click', closeModal);
authModal.addEventListener('click', (e) => {
    if (e.target === authModal) closeModal();
});
tabLogin.addEventListener('click', () => switchAuthTab('login'));
tabRegister.addEventListener('click', () => switchAuthTab('register'));

function refreshAuthUI() {
    const user = getCurrentUser();
    if (user) {
        navAuth.style.display = 'none';
        navUser.style.display = 'flex';
        userNameLabel.textContent = user.username;
    } else {
        navAuth.style.display = 'flex';
        navUser.style.display = 'none';
    }
    const locked = document.getElementById('discussion-locked');
    const form = document.getElementById('discussion-form');
    if (locked && form) {
        form.style.display = user ? 'flex' : 'none';
        locked.style.display = user ? 'none' : 'block';
    }
}

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;

    if (username.length < 3) {
        registerError.textContent = 'Tên đăng nhập cần ít nhất 3 ký tự.';
        return;
    }
    if (password.length < 4) {
        registerError.textContent = 'Mật khẩu cần ít nhất 4 ký tự.';
        return;
    }

    const users = loadJSON(STORAGE_KEYS.users, []);
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        registerError.textContent = 'Tên đăng nhập đã tồn tại.';
        return;
    }

    users.push({ username, password });
    saveJSON(STORAGE_KEYS.users, users);
    saveJSON(STORAGE_KEYS.session, { username });
    closeModal();
    refreshAuthUI();
    registerForm.reset();
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    const users = loadJSON(STORAGE_KEYS.users, []);
    const match = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

    if (!match) {
        loginError.textContent = 'Sai tên đăng nhập hoặc mật khẩu.';
        return;
    }

    saveJSON(STORAGE_KEYS.session, { username: match.username });
    closeModal();
    refreshAuthUI();
    loginForm.reset();
});

btnLogout.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEYS.session);
    refreshAuthUI();
});

document.getElementById('discussion-login-hint')?.addEventListener('click', () => openModal('login'));

/* ---------------- LEADERBOARD ---------------- */
function saveScoreToLeaderboard(wpm, accuracy) {
    if (!wpm || wpm <= 0) return;
    const user = getCurrentUser();
    const scores = loadJSON(STORAGE_KEYS.scores, []);
    scores.push({
        username: user ? user.username : 'Khách',
        wpm,
        accuracy,
        lang: languageSelect.value,
        date: new Date().toLocaleDateString('vi-VN')
    });
    saveJSON(STORAGE_KEYS.scores, scores);
}

function renderLeaderboard() {
    const body = document.getElementById('leaderboard-body');
    const empty = document.getElementById('leaderboard-empty');
    const scores = loadJSON(STORAGE_KEYS.scores, [])
        .slice()
        .sort((a, b) => b.wpm - a.wpm)
        .slice(0, 20);

    body.innerHTML = '';

    if (scores.length === 0) {
        empty.style.display = 'block';
        document.getElementById('leaderboard-table').style.display = 'none';
        return;
    }

    empty.style.display = 'none';
    document.getElementById('leaderboard-table').style.display = 'table';

    scores.forEach((s, i) => {
        const rank = i + 1;
        const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="rank-badge ${rankClass}">${rank}</span></td>
            <td>${escapeHTML(s.username)}</td>
            <td class="wpm-cell">${s.wpm}</td>
            <td class="acc-cell">${s.accuracy}%</td>
            <td><span class="lang-tag">${escapeHTML(s.lang)}</span></td>
            <td>${escapeHTML(s.date)}</td>
        `;
        body.appendChild(tr);
    });
}

/* ---------------- DISCUSSION ---------------- */
const DEFAULT_POSTS = [
    {
        title: 'Hướng dẫn cách tối ưu WPM khi gõ dấu ngoặc { }',
        content: 'Một số mẹo nhỏ giúp gõ dấu ngoặc nhanh và chính xác hơn khi luyện code.',
        author: 'admin',
        date: '01/07/2026'
    },
    {
        title: 'Lỗi tự động thụt đầu dòng khi nhấn phím Tab',
        content: 'Mình gặp lỗi này khi luyện bài C++, mọi người có cách khắc phục không?',
        author: 'tuanhuy213',
        date: '03/07/2026'
    }
];

function getAllPosts() {
    const stored = loadJSON(STORAGE_KEYS.posts, null);
    return stored || DEFAULT_POSTS;
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
}

function renderDiscussion() {
    const posts = getAllPosts().slice().reverse();
    const list = document.getElementById('discussion-list-full');
    list.innerHTML = '';
    posts.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#">${escapeHTML(p.title)}</a>
            <p class="post-content">${escapeHTML(p.content)}</p>
            <span class="author">bởi [${escapeHTML(p.author)}] · ${escapeHTML(p.date)}</span>
        `;
        list.appendChild(li);
    });
    renderDiscussionPreview();
}

function renderDiscussionPreview() {
    const preview = document.getElementById('discussion-widget-preview');
    if (!preview) return;
    const posts = getAllPosts().slice().reverse().slice(0, 2);
    preview.innerHTML = '';
    posts.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#">${escapeHTML(p.title)}</a>
            <span class="author">bởi [${escapeHTML(p.author)}]</span>
        `;
        preview.appendChild(li);
    });
}

document.getElementById('discussion-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) {
        openModal('login');
        return;
    }
    const titleInput = document.getElementById('discussion-title');
    const contentInput = document.getElementById('discussion-content');
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    if (!title || !content) return;

    const posts = getAllPosts();
    posts.push({
        title,
        content,
        author: user.username,
        date: new Date().toLocaleDateString('vi-VN')
    });
    saveJSON(STORAGE_KEYS.posts, posts);
    titleInput.value = '';
    contentInput.value = '';
    renderDiscussion();
});

/* ---------------- EXAM ---------------- */
const EXAM_LIST = [
    { id: 'exam_js_basic', lang: 'JavaScript', title: 'Kỳ thi JS cơ bản: Vòng lặp & Hàm', date: '20/07/2026' },
    { id: 'exam_cpp_stack', lang: 'C++', title: 'Kỳ thi cấu trúc dữ liệu: Stack & Queue', date: '27/07/2026' },
    { id: 'exam_html_css', lang: 'HTML/CSS', title: 'Kỳ thi dựng giao diện: Flexbox thực chiến', date: '03/08/2026' }
];

function renderExams() {
    const user = getCurrentUser();
    const regs = loadJSON(STORAGE_KEYS.examRegistrations, {});
    const userRegs = user ? (regs[user.username] || []) : [];
    const grid = document.getElementById('exam-grid');
    grid.innerHTML = '';

    EXAM_LIST.forEach(exam => {
        const isRegistered = userRegs.includes(exam.id);
        const card = document.createElement('div');
        card.className = 'exam-card';
        card.innerHTML = `
            <div class="exam-lang">${escapeHTML(exam.lang)}</div>
            <h4>${escapeHTML(exam.title)}</h4>
            <div class="exam-date">📅 ${escapeHTML(exam.date)}</div>
            <button class="btn-action ${isRegistered ? 'registered' : ''}" data-exam-id="${exam.id}">
                ${isRegistered ? '✓ Đã đăng ký' : 'Đăng ký tham gia'}
            </button>
        `;
        grid.appendChild(card);
    });

    grid.querySelectorAll('button[data-exam-id]').forEach(btn => {
        btn.addEventListener('click', () => {
            const currentUser = getCurrentUser();
            if (!currentUser) {
                openModal('login');
                return;
            }
            const examId = btn.getAttribute('data-exam-id');
            const allRegs = loadJSON(STORAGE_KEYS.examRegistrations, {});
            const mine = allRegs[currentUser.username] || [];
            const idx = mine.indexOf(examId);
            if (idx >= 0) {
                mine.splice(idx, 1);
            } else {
                mine.push(examId);
            }
            allRegs[currentUser.username] = mine;
            saveJSON(STORAGE_KEYS.examRegistrations, allRegs);
            renderExams();
        });
    });

    renderExamPreview();
}

function renderExamPreview() {
    const preview = document.getElementById('exam-widget-preview');
    if (!preview) return;
    const next = EXAM_LIST[0];
    preview.innerHTML = `
        <p class="empty-text">📅 <b>${escapeHTML(next.date)}</b> — ${escapeHTML(next.title)}</p>
    `;
}

/* ---------------- KHỞI ĐỘNG PHẦN 2 ---------------- */
refreshAuthUI();
renderDiscussionPreview();
renderExamPreview();
showView('home');