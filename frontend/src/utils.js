
import news from './abcnews.json';

/**
 * Generate random data for use in examples.
 */
export function generateRandomList() {
  const list = [];
  for (var i = 0; i < news.length; i++) {
    const newsArticle = news[i];
    list.push({
      index: i,
      id: newsArticle["id"],
      publishDate: newsArticle["publish_date"],
      text: newsArticle["headline_text"],
      size: 75,
    });
  }
  return list;
}