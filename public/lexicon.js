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

    "equiv-syntax" : { "tk": 0x01, "name": "EQUIV-SYNTAX", "cls": "function", "length": 2 },
    "allow-trailing-zeros" : { "tk": 0x01, "name": "ALLOW-TRAILING-ZEROS", "cls": "function", "length": 2 },
    "allow-decimal" : { "tk": 0x01, "name": "ALLOW-DECIMAL", "cls": "function", "length": 2 },
    "allow-fraction" : { "tk": 0x01, "name": "ALLOW-FRACTION", "cls": "function", "length": 2 },
    "allow-scientific" : { "tk": 0x01, "name": "ALLOW-SCIENTIFIC", "cls": "function", "length": 2 },
    "allow-integer" : { "tk": 0x01, "name": "ALLOW-INTEGER", "cls": "function", "length": 2 },
    "allow-other-variable-names" : { "tk": 0x01, "name": "ALLOW-OTHER-VARIABLE-NAMES", "cls": "function", "length": 2 },
}
