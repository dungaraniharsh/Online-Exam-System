// src/js/utils.js
const Utils = {
    // Generate unique ID
    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    },

    // Format time display
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    // Sanitize HTML to prevent XSS
    sanitizeHtml(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `status-message status-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    },

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Deep clone object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Shuffle array
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Calculate score with grade
    calculateGrade(score) {
        if (score >= 90) return { grade: 'A+', class: 'excellent' };
        if (score >= 80) return { grade: 'A', class: 'excellent' };
        if (score >= 70) return { grade: 'B', class: 'good' };
        if (score >= 60) return { grade: 'C', class: 'average' };
        if (score >= 50) return { grade: 'D', class: 'poor' };
        return { grade: 'F', class: 'fail' };
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Format date
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

// src/js/storage.js
const StorageManager = {
    // Keys for localStorage
    KEYS: {
        EXAMS: 'examPro_exams',
        RESULTS: 'examPro_results',
        DRAFTS: 'examPro_drafts',
        SETTINGS: 'examPro_settings'
    },

    // Save exams
    saveExams(exams) {
        try {
            localStorage.setItem(this.KEYS.EXAMS, JSON.stringify(exams));
            return true;
        } catch (error) {
            console.error('Error saving exams:', error);
            Utils.showNotification('Error saving exams', 'error');
            return false;
        }
    },

    // Load exams
    loadExams() {
        try {
            const stored = localStorage.getItem(this.KEYS.EXAMS);
            return stored ? JSON.parse(stored) : this.getDefaultExams();
        } catch (error) {
            console.error('Error loading exams:', error);
            return this.getDefaultExams();
        }
    },

    // Save results
    saveResults(results) {
        try {
            localStorage.setItem(this.KEYS.RESULTS, JSON.stringify(results));
            return true;
        } catch (error) {
            console.error('Error saving results:', error);
            Utils.showNotification('Error saving results', 'error');
            return false;
        }
    },

    // Load results
    loadResults() {
        try {
            const stored = localStorage.getItem(this.KEYS.RESULTS);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading results:', error);
            return [];
        }
    },

    // Export all data
    exportData() {
        try {
            const data = {
                exams: this.loadExams(),
                results: this.loadResults(),
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };

            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `examPro-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
            Utils.showNotification('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            Utils.showNotification('Error exporting data', 'error');
        }
    },

    // Import data
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate data structure
                if (!data.exams && !data.results) {
                    throw new Error('Invalid data format');
                }

                if (data.exams && Array.isArray(data.exams)) {
                    this.saveExams(data.exams);
                    ExamPro.exams = data.exams;
                    ExamManager.displayExamsList();
                    ExamManager.displayAvailableExams();
                }

                if (data.results && Array.isArray(data.results)) {
                    this.saveResults(data.results);
                    ExamManager.displayResults();
                }

                Utils.showNotification('Data imported successfully!', 'success');
            } catch (error) {
                console.error('Import error:', error);
                Utils.showNotification('Error importing data. Please check the file format.', 'error');
            }
        };

        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    },

    // Clear all data
    clearAllData() {
        const confirmMessage = 'Are you sure you want to clear all exams and results? This cannot be undone.';
        
        if (confirm(confirmMessage)) {
            try {
                Object.values(this.KEYS).forEach(key => {
                    localStorage.removeItem(key);
                });

                // Reset application state
                ExamPro.exams = [];
                ExamManager.displayExamsList();
                ExamManager.displayAvailableExams();
                ExamManager.displayResults();

                Utils.showNotification('All data cleared successfully!', 'warning');
            } catch (error) {
                console.error('Error clearing data:', error);
                Utils.showNotification('Error clearing data', 'error');
            }
        }
    },

    // Get default sample exams
    getDefaultExams() {
        return [
            {
                id: Utils.generateId(),
                title: "JavaScript Fundamentals",
                description: "Test your knowledge of JavaScript basics and ES6+ features",
                timeLimit: 20,
                questions: [
                    {
                        text: "Which of the following is used to declare a variable in JavaScript?",
                        type: "multiple",
                        options: ["var", "let", "const", "All of the above"],
                        correctAnswer: 3
                    },
                    {
                        text: "JavaScript is a compiled language.",
                        type: "true-false",
                        options: ["True", "False"],
                        correctAnswer: 1
                    },
                    {
                        text: "What does DOM stand for?",
                        type: "text",
                        correctAnswer: "document object model"
                    },
                    {
                        text: "Which method is used to add an element to the end of an array?",
                        type: "multiple",
                        options: ["push()", "pop()", "shift()", "unshift()"],
                        correctAnswer: 0
                    },
                    {
                        text: "Arrow functions were introduced in ES6.",
                        type: "true-false",
                        options: ["True", "False"],
                        correctAnswer: 0
                    }
                ],
                createdAt: new Date().toISOString()
            },
            {
                id: Utils.generateId(),
                title: "HTML & CSS Basics",
                description: "Fundamental concepts of HTML structure and CSS styling",
                timeLimit: 15,
                questions: [
                    {
                        text: "What does HTML stand for?",
                        type: "text",
                        correctAnswer: "hypertext markup language"
                    },
                    {
                        text: "Which CSS property is used to change text color?",
                        type: "multiple",
                        options: ["color", "text-color", "font-color", "text-style"],
                        correctAnswer: 0
                    },
                    {
                        text: "The <div> element is a block-level element.",
                        type: "true-false",
                        options: ["True", "False"],
                        correctAnswer: 0
                    }
                ],
                createdAt: new Date().toISOString()
            }
        ];
    }
};

// src/js/timer.js
const Timer = {
    interval: null,
    timeRemaining: 0,
    onTimeUp: null,
    onTick: null,

    // Start timer
    start(duration, onTick, onTimeUp) {
        this.timeRemaining = duration;
        this.onTick = onTick;
        this.onTimeUp = onTimeUp;

        this.updateDisplay();
        
        this.interval = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();
            
            if (this.onTick) {
                this.onTick(this.timeRemaining);
            }
            
            if (this.timeRemaining <= 0) {
                this.stop();
                if (this.onTimeUp) {
                    this.onTimeUp();
                }
            }
        }, 1000);
    },

    // Stop timer
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },

    // Update timer display
    updateDisplay() {
        const timerElement = document.getElementById('timeLeft');
        if (timerElement) {
            timerElement.textContent = Utils.formatTime(this.timeRemaining);
            
            // Add warning styles when time is low
            const timerContainer = document.getElementById('timer');
            if (timerContainer) {
                if (this.timeRemaining <= 300) { // 5 minutes
                    timerContainer.style.background = '#ff6b6b';
                    timerContainer.style.animation = 'pulse 1s infinite';
                } else if (this.timeRemaining <= 600) { // 10 minutes
                    timerContainer.style.background = '#ffa726';
                }
            }
        }
    },

    // Get remaining time
    getTimeRemaining() {
        return this.timeRemaining;
    },

    // Add time (for extensions)
    addTime(seconds) {
        this.timeRemaining += seconds;
        this.updateDisplay();
    }
};

// src/js/question-handler.js
const QuestionHandler = {
    questionCount: 0,

    // Add new question
    addQuestion() {
        this.questionCount++;
        const container = document.getElementById('questionsContainer');
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        questionDiv.setAttribute('data-question-id', this.questionCount);
        
        questionDiv.innerHTML = `
            <h4>Question ${this.questionCount}</h4>
            <div class="form-group">
                <label for="questionText${this.questionCount}">Question Text *</label>
                <textarea id="questionText${this.questionCount}" class="question-text" rows="3" 
                         placeholder="Enter your question here" required></textarea>
            </div>
            <div class="form-group">
                <label for="questionType${this.questionCount}">Question Type</label>
                <select id="questionType${this.questionCount}" class="question-type" 
                        onchange="QuestionHandler.updateQuestionOptions(this)">
                    <option value="multiple">Multiple Choice</option>
                    <option value="true-false">True/False</option>
                    <option value="text">Text Answer</option>
                </select>
            </div>
            <div class="options-container">
                ${this.generateMultipleChoiceOptions(this.questionCount)}
            </div>
            <button type="button" class="btn btn-danger" onclick="QuestionHandler.removeQuestion(this)">
                🗑️ Remove Question
            </button>
        `;
        
        container.appendChild(questionDiv);
    },

    // Generate multiple choice options HTML
    generateMultipleChoiceOptions(questionNum) {
        return `
            <div class="form-group">
                <label for="optionA${questionNum}">Option A *</label>
                <input type="text" id="optionA${questionNum}" class="option" placeholder="Option A" required>
                <label class="option-label">
                    <input type="radio" name="correct-${questionNum}" value="0"> Correct Answer
                </label>
            </div>
            <div class="form-group">
                <label for="optionB${questionNum}">Option B *</label>
                <input type="text" id="optionB${questionNum}" class="option" placeholder="Option B" required>
                <label class="option-label">
                    <input type="radio" name="correct-${questionNum}" value="1"> Correct Answer
                </label>
            </div>
            <div class="form-group">
                <label for="optionC${questionNum}">Option C</label>
                <input type="text" id="optionC${questionNum}" class="option" placeholder="Option C">
                <label class="option-label">
                    <input type="radio" name="correct-${questionNum}" value="2"> Correct Answer
                </label>
            </div>
            <div class="form-group">
                <label for="optionD${questionNum}">Option D</label>
                <input type="text" id="optionD${questionNum}" class="option" placeholder="Option D">
                <label class="option-label">
                    <input type="radio" name="correct-${questionNum}" value="3"> Correct Answer
                </label>
            </div>
        `;
    },

    // Update question options based on type
    updateQuestionOptions(select) {
        const container = select.closest('.question-item');
        const optionsContainer = container.querySelector('.options-container');
        const questionNum = container.getAttribute('data-question-id');
        
        if (select.value === 'true-false') {
            optionsContainer.innerHTML = `
                <div class="form-group">
                    <label class="option-label">
                        <input type="radio" name="correct-${questionNum}" value="0"> True
                    </label>
                </div>
                <div class="form-group">
                    <label class="option-label">
                        <input type="radio" name="correct-${questionNum}" value="1"> False
                    </label>
                </div>
            `;
        } else if (select.value === 'text') {
            optionsContainer.innerHTML = `
                <div class="form-group">
                    <label for="correctAnswer${questionNum}">Correct Answer *</label>
                    <input type="text" id="correctAnswer${questionNum}" class="correct-answer" 
                           placeholder="Enter the correct answer" required>
                </div>
            `;
        } else {
            optionsContainer.innerHTML = this.generateMultipleChoiceOptions(questionNum);
        }
    },

    // Remove question
    removeQuestion(button) {
        const questionItem = button.closest('.question-item');
        if (questionItem) {
            questionItem.remove();
        }
    },

    // Validate question data
    validateQuestion(questionElement, index) {
        const questionText = questionElement.querySelector('.question-text').value.trim();
        const questionType = questionElement.querySelector('.question-type').value;
        
        if (!questionText) {
            Utils.showNotification(`Please enter text for question ${index + 1}`, 'error');
            return null;
        }

        const question = {
            text: Utils.sanitizeHtml(questionText),
            type: questionType,
            options: [],
            correctAnswer: null
        };

        if (questionType === 'multiple') {
            const options = questionElement.querySelectorAll('.option');
            let validOptions = 0;
            
            options.forEach(option => {
                const value = option.value.trim();
                if (value) {
                    question.options.push(Utils.sanitizeHtml(value));
                    validOptions++;
                }
            });
            
            if (validOptions < 2) {
                Utils.showNotification(`Question ${index + 1} must have at least 2 options`, 'error');
                return null;
            }
            
            const correctRadio = questionElement.querySelector(`input[name="correct-${questionElement.getAttribute('data-question-id')}"]:checked`);
            if (correctRadio) {
                question.correctAnswer = parseInt(correctRadio.value);
            } else {
                Utils.showNotification(`Please select correct answer for question ${index + 1}`, 'error');
                return null;
            }
            
        } else if (questionType === 'true-false') {
            question.options = ['True', 'False'];
            const correctRadio = questionElement.querySelector(`input[name="correct-${questionElement.getAttribute('data-question-id')}"]:checked`);
            
            if (correctRadio) {
                question.correctAnswer = parseInt(correctRadio.value);
            } else {
                Utils.showNotification(`Please select correct answer for question ${index + 1}`, 'error');
                return null;
            }
            
        } else if (questionType === 'text') {
            const correctAnswer = questionElement.querySelector('.correct-answer');
            if (correctAnswer && correctAnswer.value.trim()) {
                question.correctAnswer = correctAnswer.value.toLowerCase().trim();
            } else {
                Utils.showNotification(`Please provide correct answer for question ${index + 1}`, 'error');
                return null;
            }
        }

        return question;
    },

    // Reset question counter
    resetCounter() {
        this.questionCount = 0;
    }
};

// src/js/exam-manager.js
const ExamManager = {
    currentExam: null,
    currentQuestionIndex: 0,
    userAnswers: [],
    examStartTime: null,

    // Save exam
    saveExam() {
        const title = document.getElementById('examTitle').value.trim();
        const timeLimit = parseInt(document.getElementById('timeLimit').value);
        const description = document.getElementById('examDescription').value.trim();
        
        if (!title) {
            Utils.showNotification('Please enter exam title', 'error');
            return;
        }

        if (!timeLimit || timeLimit < 1) {
            Utils.showNotification('Please enter valid time limit', 'error');
            return;
        }

        const questions = [];
        const questionElements = document.querySelectorAll('.question-item');
        
        if (questionElements.length === 0) {
            Utils.showNotification('Please add at least one question', 'error');
            return;
        }

        // Validate all questions
        for (let i = 0; i < questionElements.length; i++) {
            const question = QuestionHandler.validateQuestion(questionElements[i], i);
            if (!question) {
                return; // Error already shown in validateQuestion
            }
            questions.push(question);
        }

        const exam = {
            id: Utils.generateId(),
            title: Utils.sanitizeHtml(title),
            description: Utils.sanitizeHtml(description),
            timeLimit,
            questions,
            createdAt: new Date().toISOString()
        };

        ExamPro.exams.push(exam);
        StorageManager.saveExams(ExamPro.exams);
        
        // Clear form
        this.clearExamForm();
        this.displayExamsList();
        this.displayAvailableExams();
        
        Utils.showNotification('Exam saved successfully!', 'success');
    },

    // Clear exam creation form
    clearExamForm() {
        document.getElementById('examForm').reset();
        document.getElementById('questionsContainer').innerHTML = '';
        QuestionHandler.resetCounter();
    },

    // Display exams list in admin panel
    displayExamsList() {
        const container = document.getElementById('examsList');
        container.innerHTML = '';
        
        if (ExamPro.exams.length === 0) {
            container.innerHTML = '<p class="text-center">No exams created yet. Create your first exam above!</p>';
            return;
        }
        
        ExamPro.exams.forEach(exam => {
            const examDiv = document.createElement('div');
            examDiv.className = 'exam-card';
            examDiv.innerHTML = `
                <h3>${exam.title}</h3>
                <p>${exam.description}</p>
                <p><strong>Questions:</strong> ${exam.questions.length} | <strong>Time:</strong> ${exam.timeLimit} minutes</p>
                <p><strong>Created:</strong> ${Utils.formatDate(exam.createdAt)}</p>
                <button class="btn btn-danger" onclick="ExamManager.deleteExam('${exam.id}')" 
                        style="margin-top: 10px;">🗑️ Delete</button>
            `;
            container.appendChild(examDiv);
        });
    },

    // Display available exams for students
    displayAvailableExams() {
        const container = document.getElementById('availableExams');
        container.innerHTML = '';
        
        if (ExamPro.exams.length === 0) {
            container.innerHTML = '<p class="text-center">No exams available. Please check back later!</p>';
            return;
        }
        
        ExamPro.exams.forEach(exam => {
            const examDiv = document.createElement('div');
            examDiv.className = 'exam-card';
            examDiv.innerHTML = `
                <h3>${exam.title}</h3>
                <p>${exam.description}</p>
                <p><strong>Questions:</strong> ${exam.questions.length} | <strong>Time:</strong> ${exam.timeLimit} minutes</p>
                <p><strong>Difficulty:</strong> ${this.calculateDifficulty(exam)}</p>
                <button class="btn" onclick="ExamManager.startExam('${exam.id}')" 
                        style="margin-top: 10px;">🚀 Start Exam</button>
            `;
            container.appendChild(examDiv);
        });
    },

    // Calculate exam difficulty
    calculateDifficulty(exam) {
        const questionCount = exam.questions.length;
        const timePerQuestion = exam.timeLimit / questionCount;
        
        if (timePerQuestion >= 3) return 'Easy';
        if (timePerQuestion >= 2) return 'Medium';
        return 'Hard';
    },

    // Delete exam
    deleteExam(examId) {
        if (confirm('Are you sure you want to delete this exam?')) {
            ExamPro.exams = ExamPro.exams.filter(exam => exam.id !== examId);
            StorageManager.saveExams(ExamPro.exams);
            this.displayExamsList();
            this.displayAvailableExams();
            Utils.showNotification('Exam deleted successfully', 'warning');
        }
    },

    // Start exam
    startExam(examId) {
        this.currentExam = ExamPro.exams.find(exam => exam.id === examId);
        if (!this.currentExam) {
            Utils.showNotification('Exam not found', 'error');
            return;
        }

        // Initialize exam state
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.currentExam.questions.length).fill(null);
        this.examStartTime = new Date();

        // Show exam interface
        ExamPro.showTab('examInterface');

        // Setup exam header
        document.getElementById('examHeader').innerHTML = `
            <h2>${this.currentExam.title}</h2>
            <p>${this.currentExam.description}</p>
            <p><strong>Total Questions:</strong> ${this.currentExam.questions.length} | 
               <strong>Time Limit:</strong> ${this.currentExam.timeLimit} minutes</p>
        `;

        // Start timer
        const timerElement = document.getElementById('timer');
        timerElement.classList.remove('hidden');
        
        Timer.start(
            this.currentExam.timeLimit * 60, // Convert minutes to seconds
            (timeRemaining) => {
                // Update progress based on time
                const totalTime = this.currentExam.timeLimit * 60;
                const elapsed = totalTime - timeRemaining;
                const timeProgress = (elapsed / totalTime) * 100;
            },
            () => {
                Utils.showNotification('Time is up! Submitting exam automatically.', 'warning');
                this.submitExam();
            }
        );

        // Setup question navigation
        this.setupQuestionNavigation();
        
        // Display first question
        this.displayQuestion();
    },

    // Setup question navigation
    setupQuestionNavigation() {
        const container = document.getElementById('questionNavigation');
        container.innerHTML = '';
        
        this.currentExam.questions.forEach((_, index) => {
            const btn = document.createElement('button');
            btn.className = 'question-nav-btn';
            btn.textContent = index + 1;
            btn.onclick = () => this.goToQuestion(index);
            btn.setAttribute('aria-label', `Go to question ${index + 1}`);
            container.appendChild(btn);
        });
        
        this.updateQuestionNavigation();
    },

    // Update question navigation status
    updateQuestionNavigation() {
        const buttons = document.querySelectorAll('.question-nav-btn');
        buttons.forEach((btn, index) => {
            btn.classList.remove('current', 'answered');
            if (index === this.currentQuestionIndex) {
                btn.classList.add('current');
            }
            if (this.userAnswers[index] !== null) {
                btn.classList.add('answered');
            }
        });
    },

    // Display current question
    displayQuestion() {
        const question = this.currentExam.questions[this.currentQuestionIndex];
        const container = document.getElementById('currentQuestion');
        
        let questionHTML = `
            <div class="question-item">
                <h3>Question ${this.currentQuestionIndex + 1} of ${this.currentExam.questions.length}</h3>
                <p style="font-size: 18px; margin: 20px 0; font-weight: 600;">${question.text}</p>
        `;

        if (question.type === 'multiple' || question.type === 'true-false') {
            question.options.forEach((option, index) => {
                const checked = this.userAnswers[this.currentQuestionIndex] === index ? 'checked' : '';
                questionHTML += `
                    <label class="option-label">
                        <input type="radio" name="answer" value="${index}" ${checked} 
                               onchange="ExamManager.saveAnswer(${index})">
                        ${option}
                    </label>
                `;
            });
        } else if (question.type === 'text') {
            const value = this.userAnswers[this.currentQuestionIndex] || '';
            questionHTML += `
                <div class="form-group">
                    <textarea placeholder="Enter your answer here..." 
                              onchange="ExamManager.saveAnswer(this.value)" 
                              onkeyup="ExamManager.saveAnswer(this.value)"
                              style="min-height: 100px; font-size: 16px;">${value}</textarea>
                </div>
            `;
        }

        questionHTML += '</div>';
        container.innerHTML = questionHTML;

        // Update progress bar
        const progress = ((this.currentQuestionIndex + 1) / this.currentExam.questions.length) * 100;
        document.getElementById('progressBar').style.width = progress + '%';
        document.getElementById('progressBar').parentElement.setAttribute('aria-valuenow', Math.round(progress));

        this.updateQuestionNavigation();
    },

    // Save user answer
    saveAnswer(answer) {
        this.userAnswers[this.currentQuestionIndex] = answer;
        this.updateQuestionNavigation();
        
        // Auto-save to prevent data loss
        this.autoSaveProgress();
    },

    // Auto-save exam progress
    autoSaveProgress() {
        const progressData = {
            examId: this.currentExam.id,
            currentQuestionIndex: this.currentQuestionIndex,
            userAnswers: this.userAnswers,
            startTime: this.examStartTime,
            timeRemaining: Timer.getTimeRemaining()
        };
        
        sessionStorage.setItem('examProgress', JSON.stringify(progressData));
    },

    // Navigation methods
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentExam.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
        }
    },

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
        }
    },

    goToQuestion(index) {
        if (index >= 0 && index < this.currentExam.questions.length) {
            this.currentQuestionIndex = index;
            this.displayQuestion();
        }
    },

    // Submit exam
    submitExam() {
        if (!confirm('Are you sure you want to submit the exam? You cannot change your answers after submission.')) {
            return;
        }

        Timer.stop();

        // Calculate score
        let correctAnswers = 0;
        const totalQuestions = this.currentExam.questions.length;
        
        this.currentExam.questions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            
            if (question.type === 'text') {
                if (userAnswer && userAnswer.toLowerCase().trim() === question.correctAnswer) {
                    correctAnswers++;
                }
            } else {
                if (userAnswer === question.correctAnswer) {
                    correctAnswers++;
                }
            }
        });

        const score = Math.round((correctAnswers / totalQuestions) * 100);
        const timeSpent = (this.currentExam.timeLimit * 60) - Timer.getTimeRemaining();
        
        // Create result object
        const result = {
            id: Utils.generateId(),
            examId: this.currentExam.id,
            examTitle: this.currentExam.title,
            score: score,
            correctAnswers: correctAnswers,
            totalQuestions: totalQuestions,
            timeSpent: timeSpent,
            completedAt: new Date().toISOString(),
            answers: Utils.deepClone(this.userAnswers),
            grade: Utils.calculateGrade(score)
        };

        // Save result
        const results = StorageManager.loadResults();
        results.push(result);
        StorageManager.saveResults(results);

        // Clear progress data
        sessionStorage.removeItem('examProgress');

        // Show results
        this.showExamResult(result);
    },

    // Show exam result
    showExamResult(result) {
        const container = document.getElementById('currentQuestion');
        const gradeInfo = Utils.calculateGrade(result.score);
        
        container.innerHTML = `
            <div style="text-align: center;">
                <h2>🎉 Exam Completed!</h2>
                <div class="result-card" style="display: inline-block; margin: 20px; max-width: 400px;">
                    <h3>${result.examTitle}</h3>
                    <div class="score ${gradeInfo.class}">${result.score}%</div>
                    <div style="font-size: 1.5em; margin: 10px 0;">Grade: ${gradeInfo.grade}</div>
                    <p>You got ${result.correctAnswers} out of ${result.totalQuestions} questions correct</p>
                    <p>Time spent: ${Utils.formatTime(result.timeSpent)}</p>
                    <p>Completed: ${Utils.formatDate(result.completedAt)}</p>
                </div>
                <div style="margin-top: 20px;">
                    <button class="btn" onclick="ExamPro.showTab('exams')">Take Another Exam</button>
                    <button class="btn" onclick="ExamPro.showTab('results')">View All Results</button>
                    <button class="btn btn-secondary" onclick="ExamManager.reviewExam('${result.id}')">Review Answers</button>
                </div>
            </div>
        `;

        document.getElementById('timer').classList.add('hidden');
        Utils.showNotification(`Exam completed! You scored ${result.score}%`, 'success');
    },

    // Review exam answers
    reviewExam(resultId) {
        const results = StorageManager.loadResults();
        const result = results.find(r => r.id === resultId);
        
        if (!result) {
            Utils.showNotification('Result not found', 'error');
            return;
        }

        const exam = ExamPro.exams.find(e => e.id === result.examId);
        if (!exam) {
            Utils.showNotification('Original exam not found', 'error');
            return;
        }

        // Implementation for review would go here
        Utils.showNotification('Review feature coming soon!', 'info');
    },

    // Display results
    displayResults() {
        const container = document.getElementById('resultsContainer');
        const results = StorageManager.loadResults();
        
        if (results.length === 0) {
            container.innerHTML = '<p class="text-center">No exam results yet. Take an exam to see your results here!</p>';
            return;
        }

        // Sort results by date (newest first)
        results.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

        container.innerHTML = '<div class="results-grid"></div>';
        const grid = container.querySelector('.results-grid');

        results.forEach(result => {
            const gradeInfo = Utils.calculateGrade(result.score);
            const resultDiv = document.createElement('div');
            resultDiv.className = 'result-card';
            resultDiv.innerHTML = `
                <h3>${result.examTitle}</h3>
                <div class="score ${gradeInfo.class}">${result.score}%</div>
                <div style="font-size: 1.2em; margin: 5px 0;">Grade: ${gradeInfo.grade}</div>
                <p>${result.correctAnswers}/${result.totalQuestions} correct</p>
                <p>Time: ${Utils.formatTime(result.timeSpent)}</p>
                <p>Completed: ${Utils.formatDate(result.completedAt)}</p>
                <button class="btn btn-secondary" onclick="ExamManager.reviewExam('${result.id}')" 
                        style="margin-top: 10px;">Review</button>
            `;
            grid.appendChild(resultDiv);
        });

        // Add statistics summary
        this.displayResultsStatistics(results, container);
    },

    // Display results statistics
    displayResultsStatistics(results, container) {
        const totalExams = results.length;
        const averageScore = Math.round(results.reduce((sum, result) => sum + result.score, 0) / totalExams);
        const bestScore = Math.max(...results.map(r => r.score));
        const totalTimeSpent = results.reduce((sum, result) => sum + result.timeSpent, 0);

        const statsDiv = document.createElement('div');
        statsDiv.className = 'stats-summary';
        statsDiv.innerHTML = `
            <h3>Your Statistics</h3>
            <div class="results-grid">
                <div class="result-card">
                    <h4>Total Exams</h4>
                    <div class="score">${totalExams}</div>
                </div>
                <div class="result-card">
                    <h4>Average Score</h4>
                    <div class="score">${averageScore}%</div>
                </div>
                <div class="result-card">
                    <h4>Best Score</h4>
                    <div class="score">${bestScore}%</div>
                </div>
                <div class="result-card">
                    <h4>Total Time</h4>
                    <div class="score" style="font-size: 2em;">${Utils.formatTime(totalTimeSpent)}</div>
                </div>
            </div>
        `;
        
        container.insertBefore(statsDiv, container.firstChild);
    }
};

// src/js/main.js
const ExamPro = {
    exams: [],
    
    // Initialize the application
    init() {
        this.exams = StorageManager.loadExams();
        this.setupEventListeners();
        this.displayAllData();
        this.addFirstQuestion();
        this.setupKeyboardShortcuts();
        this.checkForSavedProgress();
        
        console.log('ExamPro initialized successfully');
    },

    // Setup event listeners
    setupEventListeners() {
        // Auto-save functionality for exam creation
        const autoSaveInputs = ['examTitle', 'examDescription', 'timeLimit'];
        autoSaveInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', Utils.debounce(() => {
                    this.autoSaveDraft();
                }, 2000));
            }
        });

        // Form validation
        document.getElementById('examForm').addEventListener('input', this.validateForm);
        
        // Prevent accidental page refresh during exam
        window.addEventListener('beforeunload', (event) => {
            if (ExamManager.currentExam) {
                event.preventDefault();
                event.returnValue = 'You have an exam in progress. Are you sure you want to leave?';
                return event.returnValue;
            }
        });
    },

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Only apply shortcuts when exam is active
            if (!document.getElementById('examInterface').classList.contains('active')) {
                return;
            }

            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'ArrowLeft':
                        event.preventDefault();
                        ExamManager.previousQuestion();
                        break;
                    case 'ArrowRight':
                        event.preventDefault();
                        ExamManager.nextQuestion();
                        break;
                    case 'Enter':
                        event.preventDefault();
                        if (confirm('Are you sure you want to submit the exam?')) {
                            ExamManager.submitExam();
                        }
                        break;
                }
            }

            // Number keys for question navigation
            if (event.key >= '1' && event.key <= '9') {
                const questionIndex = parseInt(event.key) - 1;
                if (ExamManager.currentExam && questionIndex < ExamManager.currentExam.questions.length) {
                    ExamManager.goToQuestion(questionIndex);
                }
            }
        });
    },

    // Check for saved exam progress
    checkForSavedProgress() {
        const savedProgress = sessionStorage.getItem('examProgress');
        if (savedProgress) {
            const progressData = JSON.parse(savedProgress);
            if (confirm('You have an unfinished exam. Would you like to continue where you left off?')) {
                this.restoreExamProgress(progressData);
            } else {
                sessionStorage.removeItem('examProgress');
            }
        }
    },

    // Restore exam progress
    restoreExamProgress(progressData) {
        const exam = this.exams.find(e => e.id === progressData.examId);
        if (exam) {
            ExamManager.currentExam = exam;
            ExamManager.currentQuestionIndex = progressData.currentQuestionIndex;
            ExamManager.userAnswers = progressData.userAnswers;
            ExamManager.examStartTime = new Date(progressData.startTime);
            
            this.showTab('examInterface');
            // Continue with timer from where it left off
            // Implementation would depend on how much time has passed
        }
    },

    // Auto-save exam draft
    autoSaveDraft() {
        const title = document.getElementById('examTitle').value;
        if (title.trim()) {
            const draft = {
                title: title,
                description: document.getElementById('examDescription').value,
                timeLimit: document.getElementById('timeLimit').value,
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('examDraft', JSON.stringify(draft));
            console.log('Draft auto-saved');
        }
    },

    // Validate exam form
    validateForm() {
        const form = document.getElementById('examForm');
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
            }
        });

        // Enable/disable save button based on validation
        const saveButton = document.querySelector('button[onclick="ExamManager.saveExam()"]');
        if (saveButton) {
            saveButton.disabled = !isValid;
            saveButton.style.opacity = isValid ? '1' : '0.5';
        }
    },

    // Show tab
    showTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Activate selected tab
        const activeButton = document.querySelector(`.tab-btn[onclick="ExamPro.showTab('${tabName}')"]`);
        const activeContent = document.getElementById(tabName);
        
        if (activeButton && activeContent) {
            activeButton.classList.add('active');
            activeButton.setAttribute('aria-selected', 'true');
            activeContent.classList.add('active');
        }
        
        // Load tab-specific data
        if (tabName === 'exams') {
            ExamManager.displayAvailableExams();
        } else if (tabName === 'results') {
            ExamManager.displayResults();
        }
    },

    // Display all data
    displayAllData() {
        ExamManager.displayExamsList();
        ExamManager.displayAvailableExams();
        ExamManager.displayResults();
    },

    // Add first question automatically
    addFirstQuestion() {
        if (document.querySelectorAll('.question-item').length === 0) {
            QuestionHandler.addQuestion();
        }
    },

    // Show help
    showHelp() {
        const helpContent = `
🎓 ExamPro - Help Guide

📝 CREATING EXAMS (Admin Panel):
• Fill in exam title, description, and time limit
• Add questions using "Add Question" button
• Choose question types: Multiple Choice, True/False, or Text
• Set correct answers for each question
• Click "Save Exam" when finished

📚 TAKING EXAMS:
• Go to "Available Exams" tab
• Click "Start Exam" on any available exam
• Answer questions using provided options
• Navigate with arrow buttons or question numbers
• Timer counts down automatically
• Click "Submit Exam" when finished

⌨️ KEYBOARD SHORTCUTS (During Exam):
• Ctrl/Cmd + ← : Previous question
• Ctrl/Cmd + → : Next question
• Ctrl/Cmd + Enter : Submit exam
• Number keys 1-9 : Jump to specific question

📊 VIEWING RESULTS:
• Go to "Results" tab to see all completed exams
• View scores, completion times, and statistics
• Click "Review" to see detailed answers (coming soon)

💾 DATA MANAGEMENT:
• Export: Download backup of all data as JSON
• Import: Restore from previously exported data
• Clear: Reset all data (use with caution!)

💡 TIPS:
• Your answers are auto-saved as you progress
• Exams auto-submit when time expires
• Use question navigation to review answers
• Data is stored locally in your browser

Need more help? Check the documentation or report issues on GitHub!
        `;
        
        alert(helpContent);
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ExamPro.init();
});

// Global error handling
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
    Utils.showNotification('An error occurred. Please try again.', 'error');
});

// Service Worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}