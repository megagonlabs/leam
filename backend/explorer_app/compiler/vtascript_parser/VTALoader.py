import sys
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
        return self.rows.append({"type": "assignment", "value": self.current})

    def enterExpr(self, ctx):
        if ctx.parentCtx.getRuleIndex() == VTAParser.VTAParser.RULE_assign:
            print("expr has parent assign!")
        else:
            self.current = []

    def exitExpr(self, ctx):
        if ctx.parentCtx.getRuleIndex() != VTAParser.VTAParser.RULE_assign:
            return self.rows.append({"type": "expression", "value": self.current})


def parseVTAScript(script):
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
    parseVTAScript(example_one)
