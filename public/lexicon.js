exports.globalLexicon = {
    "let" : { "tk": 0x12, "cls": "keyword" },
    "if" : { "tk": 0x05, "cls": "keyword" },
    "then" : { "tk": 0x06, "cls": "keyword" },
    "else" : { "tk": 0x07, "cls": "keyword" },
    "case" : { "tk": 0x0F, "cls": "keyword" },
    "of" : { "tk": 0x10, "cls": "keyword" },
    "end" : { "tk": 0x11, "cls": "keyword", "length": 0 },

    "true" : { "tk": 0x14, "cls": "val", "length": 0 },
    "false" : { "tk": 0x14, "cls": "val", "length": 0 },

    "equivSyntax" : { "tk": 0x01, "name": "EQUIV-SYNTAX", "cls": "function", "length": 2 , "arity": 2 },
    "equivLiteral" : { "tk": 0x01, "name": "EQUIV-LITERAL", "cls": "function", "length": 2 , "arity": 2 },
    "equivSymbolic" : { "tk": 0x01, "name": "EQUIV-SYMBOLIC", "cls": "function", "length": 2 , "arity": 2 },
    "equivValue" : { "tk": 0x01, "name": "EQUIV-VALUE", "cls": "function", "length": 2 , "arity": 2 },
    "isFactorised" : { "tk": 0x01, "name": "IS-FACTORISED", "cls": "function", "length": 1 , "arity": 1 },
    "isSimplified" : { "tk": 0x01, "name": "IS-SIMPLIFIED", "cls": "function", "length": 1 , "arity": 1 },
    "isExpanded" : { "tk": 0x01, "name": "IS-EXPANDED", "cls": "function", "length": 1 , "arity": 1 },
    "not" : { "tk": 0x01, "name": "NOT", "cls": "function", "length": 1 },
    "inverseResult" : { "tk": 0x01, "name": "NOT", "cls": "function", "length": 1 },
    "decimalPlaces" : { "tk": 0x01, "name": "DECIMAL-PLACES", "cls": "function", "length": 2 },
}
