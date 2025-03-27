class FeedReplacer {
    constructor() {
        this.subreddits = [
            'worldnews',
            'UpliftingNews',
            'NeutralPolitics',
            'geopolitics',
            'anime_tiddies'
        ];
    }

    async fetchNews() {
        const newsItems = [];

        for(const subreddit of this.subreddits) {
            try {
                const response = await fetch(`https://www.reddit.com/r/${subreddit}/top.json?limit=10`);
                const data = await response.json();

                const posts = data.data.children.map(post => ({
                    title: post.data.title,
                    url: `https://reddit.com${post.data.permalink}`,
                    subreddit: subreddit,
                    score: post.data.score
                }));

                newsItems.push(...posts);
            } catch (error) {
                console.error(`Error fetching from ${subreddit}:`, error);
            }
        }

        return newsItems.sort((a,b) => b.score - a.score).slice(0,10);
    }

    async replaceFeed() {
        const feedContainer = await this.waitForElement('.ListingLayout-outerContainer');

        if (!feedContainer) {
            console.error('Could not find Reddit feed container');
            return;
        }

        const newsContainer = document.createElement('div');
        newsContainer.id = 'balanced-news-feed';
        newsContainer.style.padding = '20px';
        newsContainer.innerHTML = '<h2>Balanced News Feed</h2>';

        try {
            const news = await this.fetchNews();

            news.forEach(item => {
                const newsItem = document.createElement('div');
                newsItem.style.marginBottom = '10px';
                newsItem.innerHTML = `
                <a href="${item.url}" target="_blank" style="color: #0066cc; text-decoration: none;">
                    <strong>[${item.subreddit}]</strong> ${item.title}
                </a>
                `;
                newsContainer.appendChild(newsItem);
            });

            feedContainer.innerHTML = '';
            feedContainer.appendChild(newsContainer);
        } catch (error) {
            newsContainer.innerHTML += '<p>Failed to load news.</p>';
            feedContainer.appendChild(newsContainer);
        }
    }
    waitForElement(selector, timeout = 5000) {
        return new Promise((resolve) => {
            const startTime = Date.now();

            function checkForElement() {
                const element = document.querySelector(selector);

                if (element) {
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    console.error(`Element ${selector} not found within timeout`);
                    resolve(null);
                } else {
                    requestAnimationFrame(checkforElement);
                }
            }

            checkForElement();
        });
    }

}

function initializeExtension() {
    const replacer = new ReddditFeedReplacer();
    replacer.replaceFeed();
}

if (window.location.hostname.includes('reddit.com')) {
    initializeExtension();
}

browser.runtime.onMessage.addListener((message) => {
    if (message.action === "replaceFeed") {
        const replacer = new ReddditFeedReplace();
        replacer.replaceFeed();
    }
});