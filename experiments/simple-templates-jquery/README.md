# CSV+ implementation with minimal (mustache-like) templates #

Goal: to illustrate whether a very simple subset of mustache can be implemented easily in Javascript. The implementation is built on jQuery, and also implements the data model's definitions to get to metadata (except for metadata in a package). Ie, metadata can be provided via a ``link`` in the HTTP response header, in the same directory as the CSV file itself bearing the same name and, finally, a fixed ``metadata.csvm`` file (the three sources are "merged" to produce the final metadata).

The metadata definition is extended with keys for templates. The [test metadata](tree-ops/tree-ops.csvm) includes the following:

	"template" : [{
			"url"    : "tree-ops/tree-ops-json.tmpl",
			"format" : "javascript"
		}, {
			"url"    : "tree-ops/tree-ops-json.tmpl",
			"format" : "json"
		}, {
			"url"    : "tree-ops/tree-ops-turtle.tmpl",
			"format" : "turtle"			
		}
	]

providing an access to various templates for different formats (the "javascript" format is really for javascript usage: it means that, instead of returning a JSON text, it returns the javascript object version thereof).

The template contains *only two* template tag types:

- `{{#rows}}` - `{{\rows}}` (where `rows` is a fixed symbol) at the beginning of a line means that the full templates enclosed between these two lines are to be repeated for all rows of the CSV content.
- `{{name}}` has two possible roles:
    - if used *outside* a `{{#rows}}` - `{{\rows}}` context, `{{name}}` refers to a top-level key in the metadata **if its value is a string**; the template is replaced with the corresponding value.
	- if used *within* a `{{#rows}}` - `{{\rows}}` context and the `{{name}}` refers to a column name, and the template is replaced with the content of the corresponding cell; if `{{name}}` does not refer to a column name, it is considered to refer to a top-level key in the metadata **if its value is a string**, and the template is repalces with the corresponding value. 
- `{{name}}` can also have *filters*. The tag can have the format: `{{name.f1.f2.….fn}}`, where `f1,…,fn` are filter functions. A filter function may have argument, i.e., it may look like `fi("a","b")`; the arguments are strings surrounded by the `"` or the `'` characters. If there are no arguments, the argument list can be dropped altogether. Filter functions are invoked with: the output of the previous filter or the value corresponding `{{name}}`; the reference a `context` object; the list of the arguments (strings) if applicable. The filter function must return a replacement for the template value. The `context` object has a reference to the full metadata of the CSV file, the name of the column (corresponding to the cell tag being processed, ie, the value of `{{name}}`), the index of the row within the CSV file and a reference to the data row itself (as an array). When used in a filtered tag, the `name` part may be missing (i.e., the template tag may be `{{.f1.f2.f3}}`) when the `f1` filter returns a value without considering the value of `{{name}}` (an example may be a filter returning the row number).

The list of available filter functions will be specified by the WG, and a mechanism to add a user-defined filter will be provided. At present, there are only a few filters, these are ``upper``, ``lower``, ``concat(str)``, `number`, `row_number`, ``replace(regexp,str)`` (an obvious candidate to be added will be ``datatype`` that should retrieve, from the metadata, the datatype for the specific cell).

If no template is found, the function returns a straightforward output: an array of JSON/Javascript objects, each object consisting of the column names as keys and the corresponding cell values as values.

That is it. As an example, the template for turtle may look like. A possible combination of data, used in the current [test](http://w3c.github.io/csvw/experiments/simple-templates-jquery/test.html) are:

- [CSV file](tree-ops/tree-ops.csv)
- [metadata for the csv file](tree-ops/tree-ops.csvm) (Note: this is the same metadata as used in the specification)
- [global metadata in the directory](tree-ops/metadata.csvm)
- [Turtle template](tree-ops/tree-ops-turtle.tmpl), see also the [generated Turtle file store in a file](tree-ops/tree-ops.ttl)
- [JSON-LD template](tree-ops/tree-ops-json.tmpl), see also the [generated JSON-LD file store in a file](tree-ops/tree-ops.jsonld)


The [test file](http://w3c.github.io/csvw/experiments/simple-templates-jquery/test.html) displays the result of the conversion to Turtle and JSON using a [small jQuery file](display.js) that shows how the interface can be used in practice. 


## Initial language grammar ##

    template         ::= statement*
    statement        ::= rows | text_or_tag
    rows             ::= '{{#rows}}' text_or_tag* '{{/rows}}'
    text_or_tag      ::= template | text
    text             ::= TEXT
    template         ::= '{{' tag '}}'
    tag              ::= name{0,1} ('.' name_or_function)*
    name_or_function ::= name|function
    name             ::= NAME
    function         ::= name '(' QUOTE name QUOTE (, QUOTE name QUOTE)* ')'

    TEXT             ::= Any text except '{{' and '}}' 
    NAME             ::= Any text except '{{', '}}', or '.' (or these are escaped)
    QUOTE            ::= '"' | '''


## The code details ##
(This section is not really of interest as for the decision the WG has to take on whether to use a template language of not. It is just if you want to look at the details...)

The code is provided as an extension to jQuery, all in the [`js/CSVPlus.js`](js/CSVPlus.js) file. See the separate [documentation](doc/classes/CSVPlus.html) for further details.
   
The code depends on external modules

- [PapaParse](http://papaparse.com) CSV parser
- [URI.js](https://medialize.github.io/URI.js/) to manipulate URI-s

The code is *very* rough at the edges (e.g., managing errors) and is probably not very efficient for larger CSV files...

