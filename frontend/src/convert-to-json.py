# script to convert the "abcnews-date-text.csv" file into .json
# so can use as mock data for demo

import csv
import json

# csvfile = open('abcnews-date-text.csv', 'r')
# jsonfile = open('abcnews-date-text.json', 'w')

# fieldnames = ('publish_date', 'headline_text')
# reader = csv.DictReader(csvfile, fieldnames)
# c = 0
# news_articles = []
# for row in reader:
#   newRow = row
#   newRow.update({'id': str(c)})
#   newRow.move_to_end('id', last=False)
#   news_articles.append(newRow)
#   c += 1
# json.dump(news_articles, jsonfile)


txtfile = open('stopwords.txt', 'r')
jsonfile = open('stopwords.json', 'w')
lines = txtfile.readlines()
txtfile.close()

words = []
for line in lines:
  word = line.replace("\n", "")
  words.append(word)
json.dump(words, jsonfile)
