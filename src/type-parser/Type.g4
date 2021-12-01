grammar Type;
top : type EOF ;

type : explicit | unconstrained | constrained ;

explicit : EID paramsList? ;
unconstrained: GID ;
constrained: GID rightLowerBounds
           | GID upperBounds
           | leftLowerBounds GID upperBounds
           ;

paramsList : '[' type (',' type)* ']' ;
rightLowerBounds : '>:' boundsList ;
leftLowerBounds : boundsList '<:' ;
upperBounds : '<:' boundsList ;
boundsList : bound (',' bound)* ;
bound : unconstrained | explicit ;

GID : [a-zA-Z] ;
EID : [a-zA-Z][a-zA-Z0-9_]+ ;

WS : [ \t]+ -> skip ;
