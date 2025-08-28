document.addEventListener('DOMContentLoaded', function() {
    console.log("JavaScript file loaded successfully!");

    let profileData = {};
    let articlesData = [];
    
    // Load profile data
    async function loadProfile() {
        try {
            const response = await fetch('profile.json');
            profileData = await response.json();
            renderProfile();
            console.log("Profile loaded successfully!");
        } catch (error) {
            console.error('Error loading profile:', error);
            document.getElementById('profile-name').textContent = "Profile Loading Error";
            document.getElementById('profile-title').textContent = "Could not load profile.json";
            document.getElementById('profile-bio').innerHTML = `
                <div class="edit-prompt">
                    ⚠️ Could not load profile.json. Make sure the file exists in the same directory as your HTML file.
                </div>
            `;
        }
    }
    
    // Render profile information
    function renderProfile() {
        // Basic info
        document.getElementById('profile-name').textContent = profileData.name;
        document.getElementById('profile-title').textContent = profileData.title;
        document.getElementById('profile-bio').textContent = profileData.bio;
        
        // Profile image
        const imageContainer = document.getElementById('profile-image-container');
        if (profileData.profileImage && profileData.profileImage !== 'your-photo.jpg') {
            imageContainer.innerHTML = `<img src="${profileData.profileImage}" alt="${profileData.name}" class="profile-image">`;
        } else {
            imageContainer.innerHTML = '<div class="placeholder-image">📷</div>';
        }
        
        // Work experience
        const workContainer = document.getElementById('work-experience-container');
        const workHTML = profileData.workExperience.map(job => `
            <div style="margin-bottom: 1rem;">
                <strong>${job.position}</strong> at ${job.company} (${job.years})<br>
                ${job.responsibilities.map(resp => `• ${resp}`).join('<br>')}
            </div>
        `).join('');
        workContainer.innerHTML = workHTML;
        
        // Education
        const educationContainer = document.getElementById('education-container');
        educationContainer.innerHTML = `
            <strong>${profileData.education.degree}</strong><br>
            <strong>${profileData.education.degree2}</strong><br>
            ${profileData.education.institution}, ${profileData.education.year}<br>
            ${profileData.education.details}
        `;
        
        // Skills
        const skillsContainer = document.getElementById('skills-container');
        const skillsHTML = profileData.skills.map(skillGroup => 
            `• ${skillGroup.category}: ${skillGroup.items}`
        ).join('<br>');
        skillsContainer.innerHTML = skillsHTML;
    }
    
    // Simple page navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    // Add some interactive hover effects
    document.querySelectorAll('.cat-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });


    let articlesConfig = [];
    
    // Simple markdown to HTML converter
    function markdownToHtml(markdown) {
        let html = markdown;

        html = html.replace(/```(\w+)?\n([\s\S]*?)\n```/gim, function(match, lang, code) {
            // Escape HTML in code blocks
            const escapedCode = code
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            return `<pre><code>${escapedCode}</code></pre>`;
        });
        
        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Bold
        html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
        
        // Italic
        html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
        
        // Code
        html = html.replace(/`(.*?)`/gim, '<code>$1</code>');
        
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');
        
        // Line breaks and paragraphs
        html = html.replace(/\n\n/gim, '</p><p>');
        html = html.replace(/\n/gim, '<br>');
        
        // Wrap in paragraph tags if not already wrapped
        if (!html.startsWith('<h1>') && !html.startsWith('<h2>') && !html.startsWith('<h3>')) {
            html = '<p>' + html + '</p>';
        } else {
            // Add paragraph tags after headers
            html = html.replace(/(<\/h[1-3]>)([^<])/gim, '$1<p>$2');
            if (!html.endsWith('</p>')) {
                html = html + '</p>';
            }
        }
        
        return html;
    }

    // <!-- Quotes Page -->

    async function loadQuotes() {
        try {
            const response = await fetch('./quotes.json');
            const data = await response.json();
            const container = document.getElementById('quotes-container');
            
            // Clear loading message
            container.innerHTML = '';
            
            // Create quote cards
            data.quotes.forEach(quote => {
            const quoteCard = document.createElement('div');
            quoteCard.className = 'quote-card';
            quoteCard.innerHTML = `
                <img src="${quote.image}" alt="${quote.author}" class="quote-author-image">
                <div class="quote-content">
                <div class="quote-text">${quote.text}</div>
                <div class="quote-author">— ${quote.author}</div>
                ${quote.source ? `<div class="quote-source">${quote.source}</div>` : ''}
                </div>
            `;
            container.appendChild(quoteCard);
            });
        } catch (error) {
            console.error('Error loading quotes:', error);
            document.getElementById('quotes-container').innerHTML = 
            '<div class="error">Sorry, quotes could not be loaded.</div>';
        }
    }
    
    // Load articles configuration
    async function loadArticlesConfig() {
        try {
            const response = await fetch('articles-config.json');
            articlesConfig = await response.json();
            renderArticlesList();
            console.log("Articles configuration loaded successfully!");
        } catch (error) {
            console.error('Error loading articles configuration:', error);
            document.getElementById('articles-list').innerHTML = `
                <div class="edit-prompt">
                    ⚠️ Could not load articles-config.json. Make sure the file exists in the same directory as your HTML file.
                    <br><br>This file should contain metadata for your markdown articles.
                </div>
            `;
        }
    }
    
    // Load a specific markdown article
    async function loadMarkdownArticle(filename) {
        try {
            const response = await fetch(filename);
            const markdownContent = await response.text();
            return markdownToHtml(markdownContent);
        } catch (error) {
            console.error('Error loading markdown article:', error);
            return '<p>Error loading article content.</p>';
        }
    }
    
    // Render the articles list
    function renderArticlesList() {
        const articlesList = document.getElementById('articles-list');
        const articlesHTML = articlesConfig.map((article, index) => {
            const articleCard = `
                <div class="article-preview" data-article="${article.id}">
                    <div class="article-title">${article.title}</div>
                    <div class="article-date">${formatDate(article.date)}</div>
                    <div class="article-excerpt">${article.excerpt}</div>
                    <span class="read-more">Read more →</span>
                </div>`;
            
            // Add separator after each article except the last one
            const separator = index < articlesConfig.length - 1 ? '<div class="article-separator"></div>' : '';
            
            return articleCard + separator;
        }).join('');
        
        articlesList.innerHTML = articlesHTML;
        // Add click listeners to the newly created article previews
        attachArticleListeners();
    }
    
    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long' };
        return `Published ${date.toLocaleDateString('en-US', options)}`;
    }
    
    // Attach click listeners to article previews
    function attachArticleListeners() {
        document.querySelectorAll('.article-preview').forEach(preview => {
            preview.addEventListener('click', function() {
                const articleId = this.getAttribute('data-article');
                showArticle(articleId);
            });
        });
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav links and pages
            navLinks.forEach(l => l.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked nav link
            this.classList.add('active');
            
            // Show corresponding page
            const targetPage = this.getAttribute('data-page');
            document.getElementById(targetPage).classList.add('active');

            // If switching to articles page, make sure we show the main list
            if (targetPage === 'articles') {
                showArticlesList();
                // Load articles config if not already loaded
                if (articlesConfig.length === 0) {
                    loadArticlesConfig();
                }
            }
        });
    });

    // Add some interactive hover effects
    document.querySelectorAll('.cat-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Article navigation functionality
    function showArticlesList() {
        document.getElementById('articles-main').classList.remove('hidden');
        document.getElementById('article-viewer').classList.remove('active');
    }

    async function showArticle(articleId) {
        const article = articlesConfig.find(a => a.id === articleId);
        if (!article) {
            console.error('Article not found:', articleId);
            return;
        }
        
        // Show loading state
        document.getElementById('article-viewer-title').textContent = article.title;
        document.getElementById('article-viewer-date').textContent = formatDate(article.date);
        document.getElementById('article-viewer-content').innerHTML = '<p>Loading article...</p>';
        
        // Show the article viewer
        document.getElementById('articles-main').classList.add('hidden');
        document.getElementById('article-viewer').classList.add('active');
        
        // Load and display the markdown content
        const htmlContent = await loadMarkdownArticle(article.filename);
        document.getElementById('article-viewer-content').innerHTML = htmlContent;
    }

    // Handle back to articles button clicks
    const backButton = document.querySelector('.back-to-articles');
    if (backButton) {
        backButton.addEventListener('click', function() {
            showArticlesList();
        });
    }
    
    // Load profile data immediately since home page is active by default
    loadProfile();

    loadQuotes();
    
    console.log("All event listeners attached successfully!");
});
