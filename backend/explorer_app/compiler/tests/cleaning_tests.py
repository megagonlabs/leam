from .test_utils import create_pickled_df, clean_pickled_df

# from .. import compile_vta


def test_answer():
    ds_name = "test_reviews_small"
    tdf_name = create_pickled_df(ds_name)
    print("name of pkl file -> ", tdf_name)
    assert 3 == 3
    clean_pickled_df(ds_name)


if __name__ == "__main__":
    test_answer()

