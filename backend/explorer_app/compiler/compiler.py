import json
import os
import pickle
from explorer_app import log

"""

Example: Run lowercase operator on dataframe + update text column "review"
{
  "coordinate": [
    {
      "view": "explorer.data",
      "data": { "columns": ["review"], "source": "small_reviews.csv" },  // alternatively, could be a list of source columns (from diff datasets too)
      "operator": {
        "class": "project",
        "type": "lowercase",
        "on_complete": { "action": "update" }
      }
    },
    {
      "view": "explorer.table",
      "on_response": {
        "action": "update",
        "dest": "column",
        "name": "review"
      }
    }
  ]
}

"""


def compile_vta(vta_spec):
    """
    Args: vta_spec: JSON specification of vta commands
    Returns: bool (whether VTA compiler successfully compiled & executed the specification)
    """
    # vta_spec_dict = json.loads(vta_spec)
    # TODO: throw some sort of error if JSON decoder fails
    # parsed_vta_spec = parse_vta(vta_spec_dict)
    success = run_vta(vta_spec)
    return success


# def parse_vta(vta_spec):
#     for key, val in vta_spec.items():
#         if key == 'coordinate':
#             if not isinstance(val, list):
#                 # TODO: throw special VTA parsing error
#                 pass
#             for view_spec in val:
#                 parse_vta_view(view_spec)

#     return vta_spec


# def parse_vta_view(view_spec):
#     if 'view' not in view_spec:
#         # TODO: throw VTA parsing exception: view not found
#         pass
#     if not isinstance(view_spec['view'], str):
#         # TODO: throw VTA parsing exception, view is not string
#         pass
#     if view_spec['view'] not in ['explorer.data, explorer.table']:
#         # TODO: throw VTA parsing exception, wrong view target
#         pass

#     # TODO: add more parsing rules!


def run_vta(parsed_vta_spec):
    for cmd in parsed_vta_spec["coordinate"]:
        if cmd["view"] == "explorer.data":
            run_vta_view(cmd)
        # TODO: add the rest of the view handlers

    return True


def run_vta_view(vta_view_cmd):
    data_spec = vta_view_cmd["data"]
    dataset_name = data_spec["source"]
    dataset_columns = data_spec["columns"]
    dataset_pkl_name = "/app/" + dataset_name.split(".")[0] + ".pkl"
    if os.path.exists(dataset_pkl_name):
        tdf = pickle.load(open(dataset_pkl_name, "rb"))
    else:
        raise Exception("tex df pickle file doesnt exist!")
    operator_spec = vta_view_cmd["operator"]
    operator_class, operator_type = operator_spec["class"], operator_spec["type"]
    operator_action = operator_spec["on_complete"]["action"]
    tdf.run_operator(dataset_columns, operator_class, operator_type, operator_action)
    pickle.dump(tdf, open(dataset_pkl_name, "wb"))
