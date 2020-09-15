from enum import Enum
import pickle
from typing import List
from .texdf import tex_df
from .texdf import tex_column
from .types import SelectionType, VTAColumnType, ActionType, VisType
from sklearn.metrics import confusion_matrix
import keras
from keras.preprocessing import text, sequence


class VTAModel:
    """
    VTAModel - interface for using keras models
    """

    # selection_type: SelectionType
    texdf: tex_df.TexDF
    model_name: str

    def __init__(self, texdf, model):
        # self.selection_type = SelectionType.column
        self.texdf = texdf
        self.model_name = model

    def predict(self, col_name, action=ActionType.Create):
        model_path = "/app/" + self.model_name
        model = keras.models.load_model(model_path)
        column_value = self.texdf.get_dataview_column(col_name)
        assert self.texdf.get_column_type(col_name) is VTAColumnType.TEXT
        max_features = 4000
        maxlen = 50
        tokenizer = text.Tokenizer(num_words=max_features)
        tokenizer.fit_on_texts(column_value)
        tokenized_train = tokenizer.texts_to_sequences(column_value)
        column_value = sequence.pad_sequences(tokenized_train, maxlen=maxlen)
        pred = model.predict_classes(column_value)

        new_col_name = col_name + "_prediction"
        if action is ActionType.Create:
            self.texdf.create_dataview_column(new_col_name, VTAColumnType.INT, pred)
            return new_col_name
        else:
            raise Exception(
                "[model.predict] unknown action performed on column: %s", col_name
            )

