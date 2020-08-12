import sys, os, pickle
from antlr4 import *
from antlr4.InputStream import InputStream
from explorer_app.compiler.vtascript_parser import VTALexer
from explorer_app.compiler.vtascript_parser import VTAParser
from explorer_app.compiler.vtascript_parser import VTAListener
from explorer_app import log


class VtaLoader(VTAListener.VTAListener):
    def __init__(self):
        self.vars = []
        self.rows = []
        self.current = []
        self.in_assign = False

    def exitString(self, ctx):
        current_len = len(self.current)
        string_type = "Name"
        self.current.append((string_type, ctx.STRING().getText()))

    def exitText(self, ctx):
        current_len = len(self.current)
        text = ctx.TEXT().getText()
        text_type = "None"
        if self.in_assign:
            if current_len == 0:
                # print('leng 0 text: ', text)
                text_type = "Variable"
                self.vars.append(text)
            elif current_len == 1:
                text_type = "Variable"
            elif current_len == 2:
                text_type = "Operator"
        else:
            if current_len == 0 or text in self.vars:
                text_type = "Variable"
            elif current_len == 1:
                text_type = "Operator"

        # print('text, type, len: ', text, text_type, current_len)
        self.current.append((text_type, text))

    def enterAssign(self, ctx):
        self.current = []
        self.in_assign = True

    def exitAssign(self, ctx):
        self.in_assign = False
        return self.rows.append({"type": "Assignment", "value": self.current})

    def enterExpr(self, ctx):
        if ctx.parentCtx.getRuleIndex() == VTAParser.VTAParser.RULE_assign:
            print("expr has parent assign!")
        else:
            self.current = []

    def exitExpr(self, ctx):
        if ctx.parentCtx.getRuleIndex() != VTAParser.VTAParser.RULE_assign:
            return self.rows.append({"type": "Expression", "value": self.current})


def parse_vta_script(script):
    input_stream = InputStream(script)
    lexer = VTALexer.VTALexer(input_stream)
    token_stream = CommonTokenStream(lexer)
    parser = VTAParser.VTAParser(token_stream)
    tree = parser.top()
    log.info("Start Walking...")
    listener = VtaLoader()
    walker = ParseTreeWalker()
    walker.walk(listener, tree)
    log.info("results = %s", listener.rows.__str__())
    log.info("vars = %s", listener.vars.__str__())
    return listener.rows


def convert_vta_script(script_IR):
    """
    Example input: 
        results =  [{'type': 'expression', 'value': [('Variable', 'col'), ('Operator', 'lowercase')]}]
        vars =  []
    """
    symbol_table_pkl_file = "/app/symbol_table.pkl"
    if os.path.exists(symbol_table_pkl_file):
        log.info("reading symbol table from fs")
        symbol_table = pickle.load(open(symbol_table_pkl_file, "rb"))
    else:
        raise Exception("[get-dataset] no symbol table pickle file found!")

    vta_spec = {"coordinate": []}
    for vta_cmd in script_IR:
        # this can be either "Assignment" or "Expression" (for now)
        vta_cmd_type = vta_cmd["type"]
        if vta_cmd_type == "Assignment":
            var_name = vta_cmd["value"][0][1]
            dataset_var = vta_cmd["value"][1][1]
            foreign_id = vta_cmd["value"][3][1].replace('"', "")
            if symbol_table.get(dataset_var) is None:
                log.info("dataset var is: %s", dataset_var)
                raise Exception("dataset variable not recognized!")
            dataset_name = symbol_table.get(dataset_var)

            if symbol_table.get(var_name) is None:
                log.info("[vta-script] session didn't see var: %s", var_name)
                symbol_table[var_name] = {
                    "name": foreign_id,
                    "type": "column",
                    "dataset": dataset_name,
                }
            else:
                log.info(
                    "[vta-script] session recognized var: %s , has value: %s",
                    var_name,
                    symbol_table[var_name].__str__(),
                )
        elif vta_cmd_type == "Expression":
            var_name = vta_cmd["value"][0][1]
            vta_operator = vta_cmd["value"][1][1]
            if symbol_table.get(var_name) is None:
                log.info("[vta-script] session didn't see var: %s", var_name)
            else:
                log.info(
                    "[vta-script] session recognized var: %s , has value: %s",
                    var_name,
                    symbol_table[var_name].__str__(),
                )
            var_info = symbol_table.get(var_name)
            vta_op = {}
            vta_action = "update"
            # TODO: act checks to use create/add actions instead
            vta_op["view"] = "explorer.data"
            vta_op["data"] = {
                "columns": [var_info["name"]],
                "source": var_info["dataset"],
            }
            vta_op["operator"] = {
                "class": "project",
                "type": vta_operator,
                "on_complete": {"action": vta_action},
            }
            vta_spec["coordinate"].append(vta_op)

    pickle.dump(symbol_table, open(symbol_table_pkl_file, "wb"))

    return vta_spec


if __name__ == "__main__":
    # if len(sys.argv) > 1:
    #     input_stream = FileStream(sys.argv[1])
    # else:
    #     input_stream = InputStream(sys.stdin.read())

    # lexer = VTALexer(input_stream)
    # token_stream = CommonTokenStream(lexer)
    # parser = VTAParser(token_stream)
    # tree = parser.top()

    # lisp_tree_str = tree.toStringTree(recog=parser)
    # print(lisp_tree_str)

    # # listener
    # print("Start Walking...")

    # listener = VtaLoader()
    # walker = ParseTreeWalker()
    # walker.walk(listener, tree)
    # print("results = ", listener.rows)
    # print("vars = ", listener.vars)

    example_one = "col = tdf.get_column('review')\ncol.lowercase()"
    parse_vta_script(example_one)
