from flask import current_app
from misaka import (Markdown, HtmlRenderer, EXT_NO_INTRA_EMPHASIS, EXT_AUTOLINK, EXT_TABLES, EXT_FENCED_CODE,
    EXT_STRIKETHROUGH, EXT_LAX_HTML_BLOCKS, EXT_SPACE_HEADERS, HTML_HARD_WRAP, HTML_SKIP_HTML,
    HTML_NEW_TAB_LINKS)
import pygments
from pygments.lexers import get_lexer_by_name
from pygments.formatters import HtmlFormatter
from pygments.util import ClassNotFound
import cgi
import re

class HtmlPygmentsRenderer(HtmlRenderer):
  def youtubeToken(self, matchobj):
    print matchobj.group('id')
    return "youtube:%s" % matchobj.group('id')

  def youtubeEmbed(self, matchobj):
    print matchobj.group('id')
    return '''<iframe width="480" height="295" src="https://www.youtube.com/embed/%s" frameborder="0" allowfullscreen></iframe>''' % matchobj.group('id')

  def preprocess(self, text):
    print re.findall(r'(https?://)?(www\.)?(youtube\.com/watch\?\w*v=)(?P<id>[0-9A-Za-z]+)\w*', text)
    text = re.sub(r'(https?://)?(www\.)?(youtube\.com/watch\?\w*v=)(?P<id>[0-9A-Za-z]+)\w*',
      self.youtubeToken,
      text)
    return text

  def postprocess(self, text):
    print re.findall(r'(youtube:)(?P<id>[0-9A-Za-z]+)', text)
    text = re.sub(r'(youtube:)(?P<id>[0-9A-Za-z]+)',
      self.youtubeEmbed,
      text)
    return text

  def normal_text(self, text):
    escaped_text = cgi.escape(text)

    # mark up user mentions (@username)
    escaped_text = re.sub(r'(@)([a-zA-Z0-9_.-]+)',
                          r'<span class="user-mention" data-username="\2">\1\2</span>',
                          escaped_text)
    for string_filter in current_app.config["STRING_FILTERS"]:
      escaped_text = string_filter(escaped_text)
    return escaped_text
  def block_code(self, code, language):
    language = language or "text"
    lexer_options = { "encoding": "utf-8", "stripnl": False, "stripall": False }
    try:
      lexer = get_lexer_by_name(language, **lexer_options)
    except ClassNotFound as exception:
      lexer = get_lexer_by_name("text", **lexer_options)
    formatter = HtmlFormatter(nowrap=True)
    rendered_code = pygments.highlight(code, lexer, formatter)
    return "<div class=\"highlight\">{0}</div>".format(rendered_code)

pygments_renderer = HtmlPygmentsRenderer(HTML_HARD_WRAP | HTML_SKIP_HTML | HTML_NEW_TAB_LINKS)
markdown_renderer = Markdown(pygments_renderer, EXT_NO_INTRA_EMPHASIS | EXT_AUTOLINK | EXT_TABLES | EXT_FENCED_CODE |
    EXT_STRIKETHROUGH | EXT_LAX_HTML_BLOCKS | EXT_SPACE_HEADERS)

def render(input_string):
  return markdown_renderer.render(input_string)
