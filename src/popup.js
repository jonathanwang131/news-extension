class NewsAggregator {
    constructor() {
        this.subreddits = [
            'news',
            'worldnews',
            'UpliftingNews',
            'geopolitics',
            'anime_titties'

        ];
    }

    async fetchNews() {
        const newsItems = [];

        for(const subreddit of this.subreddits) {
            try {

                const response = await fetch(`https://www.reddit.com/r/${subreddit}/top.json?limit=5`);
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
}

document.addEventListener('DOMContentLoaded', async () => {
    const popupContent = document.createElement('div');
    const newsList = document.createElement('div');
    newsList.id = 'news-list';

    const replaceButton = document.createElement('button');
    replaceButton.textContent = 'Replace Reddit Feed';
    replaceButton.style.marginBottom = '10px';
    replaceButton.addEventListener('click', () => {
        browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
                browser.tabs.sendMessage(tabs[0].id, {action: "replaceFeed"});
                window.close();
            }
        });
    });

    const fetchNewsButton = document.createElement('button');
    fetchNewsButton.textContent = 'Load News in Popup';
    fetchNewsButton.style.marginBottom = '10px';
    fetchNewsButton.style.marginLeft = '10px';
    fetchNewsButton.addEventListener('click', async () => {
        try {
            const aggregator = new NewsAggregator();
            const news = await aggregator.fetchNews();

            newsList.innerHTML = '';
            news.forEach(item => {
                const newsItem = document.createElement('div');
                newsItem.innerHTML = `
                <a href="${item.url}" target="_blank">
                    <strong>[${item.subreddit}]</strong> ${item.title}
                </a>
                `;
                newsList.appendChild(newsItem);
            });
        } catch (error) {
            newsList.textContent = 'Failed to load news. Please try again';
            console.error('News fetching error:', error);
        }
    });

    const buttonsContainer = document.createElement('div');
    buttonsContainer.appendChild(replaceButton);
    buttonsContainer.appendChild(fetchNewsButton);

    popupContent.appendChild(buttonsContainer);
    popupContent.appendChild(newsList);

    document.body.appendChild(popupContent);
});