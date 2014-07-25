var unpack = require('browser-unpack');
var pack = require('browser-pack');
var falafel = require('falafel');

module.exports = function (src, req) {
    if (req === undefined) req = 'require';
    var rows = unpack(src);
    var p = pack({ raw: true });
    rows.forEach(function (row) {
        row.source = replace(row.source, row.deps, req);
        row.deps = {};
        p.write(row);
    });
    p.end();
    return p;
};

function replace (src, deps, req) {
    return falafel(src, function (node) {
        if (isRequire(node, req)) {
            var value = node.arguments[0].value;
            if (has(deps, value)) {
                node.update(req + '(' + deps[value] + ')');
            }
        }
    }).toString();
}

function isRequire (node, req) {
    var c = node.callee;
    return c
        && node.type === 'CallExpression'
        && c.type === 'Identifier'
        && c.name === req
        && node.arguments[0]
        && node.arguments[0].type === 'Literal'
    ;
}

function has (obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
