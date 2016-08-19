RegExp.quote = function(str) {
  return (str+'').replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
};

exports.replace = function replace(str, tags, escape) {
  if (str) {
    tags.forEach(function(t) {
      str = str.replace(new RegExp(RegExp.quote(t.key), 'g'), (escape ? escapeHTML(t.value) : t.value));
    });
  }
  return str;
};

function escapeHTML(html) {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}