grammar VTA;

// top : assign? expr+;
top : (assign | expr)+;

assign : field WS* '=' WS* (expr)?;
expr : field '.' field '(' field  ')' WS*;
field
    :   TEXT	# text
    |   STRING	# string
    |   	    # empty
    ;



TEXT : [a-zA-Z0-9_]+ ;
STRING : '"' ('""'|~'"')* '"' ;
WS  :   [ \t]+ -> skip ; // toss out whitespace
