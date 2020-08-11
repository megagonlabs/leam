# Generated from VTA.g4 by ANTLR 4.7.1
# encoding: utf-8
from antlr4 import *
from io import StringIO
from typing.io import TextIO
import sys

def serializedATN():
    with StringIO() as buf:
        buf.write("\3\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964\3\t")
        buf.write("\63\4\2\t\2\4\3\t\3\4\4\t\4\4\5\t\5\3\2\3\2\6\2\r\n\2")
        buf.write("\r\2\16\2\16\3\3\3\3\7\3\23\n\3\f\3\16\3\26\13\3\3\3\3")
        buf.write("\3\7\3\32\n\3\f\3\16\3\35\13\3\3\3\5\3 \n\3\3\4\3\4\3")
        buf.write("\4\3\4\3\4\3\4\3\4\7\4)\n\4\f\4\16\4,\13\4\3\5\3\5\3\5")
        buf.write("\5\5\61\n\5\3\5\2\2\6\2\4\6\b\2\2\2\66\2\f\3\2\2\2\4\20")
        buf.write("\3\2\2\2\6!\3\2\2\2\b\60\3\2\2\2\n\r\5\4\3\2\13\r\5\6")
        buf.write("\4\2\f\n\3\2\2\2\f\13\3\2\2\2\r\16\3\2\2\2\16\f\3\2\2")
        buf.write("\2\16\17\3\2\2\2\17\3\3\2\2\2\20\24\5\b\5\2\21\23\7\t")
        buf.write("\2\2\22\21\3\2\2\2\23\26\3\2\2\2\24\22\3\2\2\2\24\25\3")
        buf.write("\2\2\2\25\27\3\2\2\2\26\24\3\2\2\2\27\33\7\3\2\2\30\32")
        buf.write("\7\t\2\2\31\30\3\2\2\2\32\35\3\2\2\2\33\31\3\2\2\2\33")
        buf.write("\34\3\2\2\2\34\37\3\2\2\2\35\33\3\2\2\2\36 \5\6\4\2\37")
        buf.write("\36\3\2\2\2\37 \3\2\2\2 \5\3\2\2\2!\"\5\b\5\2\"#\7\4\2")
        buf.write("\2#$\5\b\5\2$%\7\5\2\2%&\5\b\5\2&*\7\6\2\2\')\7\t\2\2")
        buf.write("(\'\3\2\2\2),\3\2\2\2*(\3\2\2\2*+\3\2\2\2+\7\3\2\2\2,")
        buf.write("*\3\2\2\2-\61\7\7\2\2.\61\7\b\2\2/\61\3\2\2\2\60-\3\2")
        buf.write("\2\2\60.\3\2\2\2\60/\3\2\2\2\61\t\3\2\2\2\t\f\16\24\33")
        buf.write("\37*\60")
        return buf.getvalue()


class VTAParser ( Parser ):

    grammarFileName = "VTA.g4"

    atn = ATNDeserializer().deserialize(serializedATN())

    decisionsToDFA = [ DFA(ds, i) for i, ds in enumerate(atn.decisionToState) ]

    sharedContextCache = PredictionContextCache()

    literalNames = [ "<INVALID>", "'='", "'.'", "'('", "')'" ]

    symbolicNames = [ "<INVALID>", "<INVALID>", "<INVALID>", "<INVALID>", 
                      "<INVALID>", "TEXT", "STRING", "WS" ]

    RULE_top = 0
    RULE_assign = 1
    RULE_expr = 2
    RULE_field = 3

    ruleNames =  [ "top", "assign", "expr", "field" ]

    EOF = Token.EOF
    T__0=1
    T__1=2
    T__2=3
    T__3=4
    TEXT=5
    STRING=6
    WS=7

    def __init__(self, input:TokenStream, output:TextIO = sys.stdout):
        super().__init__(input, output)
        self.checkVersion("4.7.1")
        self._interp = ParserATNSimulator(self, self.atn, self.decisionsToDFA, self.sharedContextCache)
        self._predicates = None



    class TopContext(ParserRuleContext):

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def assign(self, i:int=None):
            if i is None:
                return self.getTypedRuleContexts(VTAParser.AssignContext)
            else:
                return self.getTypedRuleContext(VTAParser.AssignContext,i)


        def expr(self, i:int=None):
            if i is None:
                return self.getTypedRuleContexts(VTAParser.ExprContext)
            else:
                return self.getTypedRuleContext(VTAParser.ExprContext,i)


        def getRuleIndex(self):
            return VTAParser.RULE_top

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterTop" ):
                listener.enterTop(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitTop" ):
                listener.exitTop(self)




    def top(self):

        localctx = VTAParser.TopContext(self, self._ctx, self.state)
        self.enterRule(localctx, 0, self.RULE_top)
        self._la = 0 # Token type
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 10 
            self._errHandler.sync(self)
            _la = self._input.LA(1)
            while True:
                self.state = 10
                self._errHandler.sync(self)
                la_ = self._interp.adaptivePredict(self._input,0,self._ctx)
                if la_ == 1:
                    self.state = 8
                    self.assign()
                    pass

                elif la_ == 2:
                    self.state = 9
                    self.expr()
                    pass


                self.state = 12 
                self._errHandler.sync(self)
                _la = self._input.LA(1)
                if not ((((_la) & ~0x3f) == 0 and ((1 << _la) & ((1 << VTAParser.T__0) | (1 << VTAParser.T__1) | (1 << VTAParser.TEXT) | (1 << VTAParser.STRING) | (1 << VTAParser.WS))) != 0)):
                    break

        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx

    class AssignContext(ParserRuleContext):

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def field(self):
            return self.getTypedRuleContext(VTAParser.FieldContext,0)


        def WS(self, i:int=None):
            if i is None:
                return self.getTokens(VTAParser.WS)
            else:
                return self.getToken(VTAParser.WS, i)

        def expr(self):
            return self.getTypedRuleContext(VTAParser.ExprContext,0)


        def getRuleIndex(self):
            return VTAParser.RULE_assign

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterAssign" ):
                listener.enterAssign(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitAssign" ):
                listener.exitAssign(self)




    def assign(self):

        localctx = VTAParser.AssignContext(self, self._ctx, self.state)
        self.enterRule(localctx, 2, self.RULE_assign)
        self._la = 0 # Token type
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 14
            self.field()
            self.state = 18
            self._errHandler.sync(self)
            _la = self._input.LA(1)
            while _la==VTAParser.WS:
                self.state = 15
                self.match(VTAParser.WS)
                self.state = 20
                self._errHandler.sync(self)
                _la = self._input.LA(1)

            self.state = 21
            self.match(VTAParser.T__0)
            self.state = 25
            self._errHandler.sync(self)
            _alt = self._interp.adaptivePredict(self._input,3,self._ctx)
            while _alt!=2 and _alt!=ATN.INVALID_ALT_NUMBER:
                if _alt==1:
                    self.state = 22
                    self.match(VTAParser.WS) 
                self.state = 27
                self._errHandler.sync(self)
                _alt = self._interp.adaptivePredict(self._input,3,self._ctx)

            self.state = 29
            self._errHandler.sync(self)
            la_ = self._interp.adaptivePredict(self._input,4,self._ctx)
            if la_ == 1:
                self.state = 28
                self.expr()


        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx

    class ExprContext(ParserRuleContext):

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def field(self, i:int=None):
            if i is None:
                return self.getTypedRuleContexts(VTAParser.FieldContext)
            else:
                return self.getTypedRuleContext(VTAParser.FieldContext,i)


        def WS(self, i:int=None):
            if i is None:
                return self.getTokens(VTAParser.WS)
            else:
                return self.getToken(VTAParser.WS, i)

        def getRuleIndex(self):
            return VTAParser.RULE_expr

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterExpr" ):
                listener.enterExpr(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitExpr" ):
                listener.exitExpr(self)




    def expr(self):

        localctx = VTAParser.ExprContext(self, self._ctx, self.state)
        self.enterRule(localctx, 4, self.RULE_expr)
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 31
            self.field()
            self.state = 32
            self.match(VTAParser.T__1)
            self.state = 33
            self.field()
            self.state = 34
            self.match(VTAParser.T__2)
            self.state = 35
            self.field()
            self.state = 36
            self.match(VTAParser.T__3)
            self.state = 40
            self._errHandler.sync(self)
            _alt = self._interp.adaptivePredict(self._input,5,self._ctx)
            while _alt!=2 and _alt!=ATN.INVALID_ALT_NUMBER:
                if _alt==1:
                    self.state = 37
                    self.match(VTAParser.WS) 
                self.state = 42
                self._errHandler.sync(self)
                _alt = self._interp.adaptivePredict(self._input,5,self._ctx)

        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx

    class FieldContext(ParserRuleContext):

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser


        def getRuleIndex(self):
            return VTAParser.RULE_field

     
        def copyFrom(self, ctx:ParserRuleContext):
            super().copyFrom(ctx)



    class StringContext(FieldContext):

        def __init__(self, parser, ctx:ParserRuleContext): # actually a VTAParser.FieldContext
            super().__init__(parser)
            self.copyFrom(ctx)

        def STRING(self):
            return self.getToken(VTAParser.STRING, 0)

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterString" ):
                listener.enterString(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitString" ):
                listener.exitString(self)


    class TextContext(FieldContext):

        def __init__(self, parser, ctx:ParserRuleContext): # actually a VTAParser.FieldContext
            super().__init__(parser)
            self.copyFrom(ctx)

        def TEXT(self):
            return self.getToken(VTAParser.TEXT, 0)

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterText" ):
                listener.enterText(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitText" ):
                listener.exitText(self)


    class EmptyContext(FieldContext):

        def __init__(self, parser, ctx:ParserRuleContext): # actually a VTAParser.FieldContext
            super().__init__(parser)
            self.copyFrom(ctx)


        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterEmpty" ):
                listener.enterEmpty(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitEmpty" ):
                listener.exitEmpty(self)



    def field(self):

        localctx = VTAParser.FieldContext(self, self._ctx, self.state)
        self.enterRule(localctx, 6, self.RULE_field)
        try:
            self.state = 46
            self._errHandler.sync(self)
            token = self._input.LA(1)
            if token in [VTAParser.TEXT]:
                localctx = VTAParser.TextContext(self, localctx)
                self.enterOuterAlt(localctx, 1)
                self.state = 43
                self.match(VTAParser.TEXT)
                pass
            elif token in [VTAParser.STRING]:
                localctx = VTAParser.StringContext(self, localctx)
                self.enterOuterAlt(localctx, 2)
                self.state = 44
                self.match(VTAParser.STRING)
                pass
            elif token in [VTAParser.T__0, VTAParser.T__1, VTAParser.T__2, VTAParser.T__3, VTAParser.WS]:
                localctx = VTAParser.EmptyContext(self, localctx)
                self.enterOuterAlt(localctx, 3)

                pass
            else:
                raise NoViableAltException(self)

        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx





