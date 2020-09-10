from enum import Enum
from typing import List
import pandas as pd
import numpy as np
import spacy
import nltk
import re
from sklearn.decomposition import PCA
from bs4 import BeautifulSoup
from spellchecker import SpellChecker
from .texdf import tex_df
from .types import SelectionType, VTAColumnType, ActionType

spacy_nlp = spacy.load("en_core_web_sm")
nltk.download("vader_lexicon")
spell = SpellChecker()

class Project:
    selection_type: SelectionType
    texdf: tex_df.TexDF
    col_name: str
    col_type: VTAColumnType

    def __init__(self, selection_type, texdf, column, column_type):
        self.selection_type = selection_type
        self.texdf = texdf
        self.col_name = column
        self.col_type = column_type

    def __str__(self):
        col_series = self.texdf.get_dataview_column(self.col_name)
        return col_series.to_string()

    def lowercase(self, action=ActionType.Update):
        column_value = self.texdf.get_dataview_column(self.col_name)
        new_column_value = column_value.str.lower()
        if action is ActionType.Update:
            self.texdf.update_dataview_column(
                self.col_name, VTAColumnType.TEXT, new_column_value
            )
        else:
            raise Exception(
                "[lowercase] unknown action performed on column: %s", self.col_name
            )

    def strip_html(self, action=ActionType.Update):
        column_value = self.texdf.get_dataview_column(self.col_name)

        def strip_html_helper(text):
            soup = BeautifulSoup(text, "html.parser")
            return soup.get_text()

        new_column_value = column_value.map(strip_html_helper)

        if action is ActionType.Update:
            self.texdf.update_dataview_column(
                self.col_name, VTAColumnType.TEXT, new_column_value
            )
        else:
            raise Exception(
                "[strip_html] unknown action performed on column: %s",
                self.col_name,
            )

    def remove_square_brackets(self, action=ActionType.Update):
        column_value = self.texdf.get_dataview_column(self.col_name)

        def remove_sq_brackets_helper(text):
            return re.sub('\[[^]]*\]', '', text)

        new_column_value = column_value.map(remove_sq_brackets_helper)

        if action is ActionType.Update:
            self.texdf.update_dataview_column(
                self.col_name, VTAColumnType.TEXT, new_column_value
            )
        else:
            raise Exception(
                "[remove_square_brackets] unknown action performed on column: %s",
                self.col_name,
            )

    def remove_urls(self, action=ActionType.Update):
        column_value = self.texdf.get_dataview_column(self.col_name)

        def remove_urls_helper(text):
            return re.sub(r'http\S+', '', text)

        new_column_value = column_value.map(remove_urls_helper)

        if action is ActionType.Update:
            self.texdf.update_dataview_column(
                self.col_name, VTAColumnType.TEXT, new_column_value
            )
        else:
            raise Exception(
                "[remove_urls] unknown action performed on column: %s",
                self.col_name,
            )

    def remove_punctuation(self, action=ActionType.Update):
        def remove_punc_helper(token):
            return not token.is_punct

        column_value = self.texdf.get_dataview_column(self.col_name)
        filtered_tokens = []
        for doc in spacy_nlp.pipe(column_value, n_threads=12):
            tokens = [token.text for token in doc if remove_punc_helper(token)]
            filtered_tokens.append(" ".join(tokens))

        if action is ActionType.Update:
            self.texdf.update_dataview_column(
                self.col_name, VTAColumnType.TEXT, filtered_tokens
            )
        else:
            raise Exception(
                "[remove_punctuation] unknown action performed on column: %s",
                self.col_name,
            )

    def remove_stopwords(self, action=ActionType.Update):
        column_value = self.texdf.get_dataview_column(self.col_name)

        def remove_stopwords_helper(text):
            doc = spacy_nlp(text)
            toks = [token.text for token in doc if not token.is_stop]
            return " ".join(toks)

        new_column_value = column_value.map(remove_stopwords_helper)

        if action is ActionType.Update:
            self.texdf.update_dataview_column(
                self.col_name, VTAColumnType.TEXT, new_column_value
            )
        else:
            raise Exception(
                "[remove_stopwords] unknown action performed on column: %s",
                self.col_name,
            )

    def remove_emoji(self, action=ActionType.Update):
        column_value = self.texdf.get_dataview_column(self.col_name)

        def remove_emoji_helper(text):
            emoji_pattern = re.compile('[\U00010000-\U0010ffff]', flags=re.UNICODE)
            return emoji_pattern.sub(r'', text)

        new_column_value = column_value.map(remove_emoji_helper)

        if action is ActionType.Update:
            self.texdf.update_dataview_column(
                self.col_name, VTAColumnType.TEXT, new_column_value
            )
        else:
            raise Exception(
                "[remove_emoji] unknown action performed on column: %s",
                self.col_name,
            )

    def correct_spellings(self, action=ActionType.Update):
        column_value = self.texdf.get_dataview_column(self.col_name)

        def correct_spellings_helper(text):
            corrected_text = []
            misspelled_words = spell.unknown(text.split())
            for word in text.split():
                if word in misspelled_words:
                    corrected_text.append(spell.correction(word))
                else:
                    corrected_text.append(word)
            return " ".join(corrected_text)

        new_column_value = column_value.map(correct_spellings_helper)

        if action is ActionType.Update:
            self.texdf.update_dataview_column(
                self.col_name, VTAColumnType.TEXT, new_column_value
            )
        else:
            raise Exception(
                "[correct_spellings] unknown action performed on column: %s",
                self.col_name,
            )

    def pca(self, action=ActionType.Create):
        column_value = self.texdf.get_dataview_column(self.col_name)
        tfidf_vectors = [v.todense() for v in column_value]
        tfidf_2d = np.vstack(tfidf_vectors)
        tfidf_2d = [list(v) for v in tfidf_2d.A]
        tfidf_2d = np.stack(tfidf_2d, axis=0)
        pca = PCA(n_components=10)
        pca_vectors = pca.fit_transform(tfidf_2d).tolist()

        new_col_name = self.col_name + "_PCA"

        if action is ActionType.Create:
            self.texdf.create_dataview_column(
                new_col_name, VTAColumnType.VECTOR, pca_vectors
            )
            return new_col_name
        else:
            raise Exception(
                "[pca] unknown action performed on column: %s", self.col_name
            )

    def indices(self, indices):
        column_value = self.texdf.get_dataview_column(self.col_name)
        for i in indices:
            col_name_suffix = self.col_name.split("_")[-1]
            new_col_name = col_name_suffix + "_" + str(i)
            new_col_value = column_value.map(lambda x: x[i])
            # float is placeholder for now, could be other types, should infer from VECTOR type
            self.texdf.create_dataview_column(
                new_col_name, VTAColumnType.FLOAT, new_col_value
            )

    def sentiment(self, action=ActionType.Create):
        from nltk.sentiment.vader import SentimentIntensityAnalyzer

        column_value = self.texdf.get_dataview_column(self.col_name)
        sid = SentimentIntensityAnalyzer()
        sentiments = [sid.polarity_scores(r)["compound"] for r in column_value]
        col_name_prefix = self.col_name.split("_")[0]
        new_col_name = col_name_prefix + "_sentiment"

        if action is ActionType.Create:
            self.texdf.create_dataview_column(
                new_col_name, VTAColumnType.FLOAT, sentiments
            )
            return new_col_name
        elif action is ActionType.Update:
            self.texdf.update_dataview_column(
                self.col_name, VTAColumnType.FLOAT, sentiments
            )
        else:
            raise Exception(
                "[sentiment] unknown action performed on column: %s", self.col_name
            )
