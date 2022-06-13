import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Class, Compare, Css, SelectorFilter, SugarElement, SugarNode } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import CodeSamplePlugin from 'tinymce/plugins/codesample/Plugin';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import MediaPlugin from 'tinymce/plugins/media/Plugin';

interface Outline {
  readonly color: string;
  readonly style: string;
  readonly width: string;
}

describe('browser.tinymce.core.annotate.OutlineOnBlocksTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'codesample media image',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('init', () => {
        editor.annotator.register('test-comment', {
          decorate: (_uid, _data) => ({
            classes: [ 'tox-comment' ]
          })
        });
      });
    }
  }, [ CodeSamplePlugin, MediaPlugin, ImagePlugin ], true);

  const emptyOutline: Outline = {
    color: 'rgb(0, 0, 0)',
    width: '0px',
    style: 'none'
  };

  const emptyFigCaptionOutline: Outline = {
    color: 'rgb(153, 153, 153)',
    width: '0px',
    style: 'none'
  };

  const selectedOutline: Outline = {
    color: 'rgb(180, 215, 255)', // #b4d7ff
    width: '3px',
    style: 'solid'
  };

  const commentOutline: Outline = {
    color: 'rgb(255, 232, 157)', // #ffe89d
    width: '3px',
    style: 'solid'
  };

  const getOutline = (elm: SugarElement<Element>): Outline => {
    const color = Css.get(elm, 'outline-color');
    const width = Css.get(elm, 'outline-width');
    const style = Css.get(elm, 'outline-style');
    return {
      color,
      width,
      style
    };
  };

  const pAssertOutline = (editor: Editor, selector: string, expected: Outline, checkSurrounds: boolean = true) =>
    Waiter.pTryUntil('Should have correct outline', () => {
      const elm = UiFinder.findIn(TinyDom.body(editor), selector).getOrDie();
      const actual = getOutline(elm);
      assert.deepEqual(actual, expected);

      if (checkSurrounds) {
        const parents = SelectorFilter.ancestors(elm, '*', (e) => Compare.eq(e, TinyDom.body(editor)));
        const children = SelectorFilter.children(elm, '*');
        const isFigCaption = SugarNode.isTag('figcaption');

        Arr.each(parents, (e) => assert.deepEqual(getOutline(e), emptyOutline, 'parent should not have outline'));
        Arr.each(children, (e) => assert.deepEqual(getOutline(e), isFigCaption(e) ? emptyFigCaptionOutline : emptyOutline, 'child should not have outline'));
      }
    });

  before(() => {
    const editor = hook.editor();
    Class.add(TinyDom.body(editor), 'tox-comments-visible');
  });

  const imageHtml = '<p>before<img src="https://www.w3schools.com/w3css/img_lights.jpg" alt="" width="600" height="400">after</p>';
  const figureImageHtml = '<figure class="image">' +
    '<img src="https://www.w3schools.com/w3css/img_lights.jpg" alt="" width="600" height="400">' +
    '<figcaption>Caption</figcaption>' +
    '</figure>';
  const codesampleHtml = `<pre class="language-markup"><code>test</code></pre>`;
  const iframeHtml = '<iframe src="https://www.youtube.com/embed/8aGhZQkoFbQ" width="560" height="314" allowfullscreen="allowfullscreen"></iframe>';
  const audioHtml = '<audio src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3" controls="controls"></audio>';
  const videoHtml = '<video controls="controls" width="300" height="150"><source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4"></video>';
  const tocHtml = '<div class="mce-toc" contenteditable="false">' +
    '<h2 contenteditable="true">Table of Contents</h2>' +
    '<ul>' +
    '<li><a href="#mcetoc_">Heading</a></li>' +
    '</ul>' +
    '</div>';
  const iframeMediaEmbedHtml = '<div style="left: 0px; width: 100%; height: 0px; position: relative; padding-bottom: 56.25%; max-width: 650px;" data-ephox-embed-iri="https://www.youtube.com/watch?v=8aGhZQkoFbQ" contenteditable="false">' +
    '<iframe style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;" src="https://www.youtube.com/embed/8aGhZQkoFbQ?rel=0" scrolling="no" allowfullscreen="allowfullscreen"></iframe>' +
    '</div>';
  const videoMediaEmbedHtml = '<div style="max-width: 650px;" data-ephox-embed-iri="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" contenteditable="false">' +
    '<video style="width: 100%;" controls="controls">' +
    '<source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">' +
    '</video>' +
    '</div>';
  const audioMediaEmbedHtml = '<div style="max-width: 650px;" data-ephox-embed-iri="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3" contenteditable="false">' +
    '<audio style="width: 100%;" controls="controls">' +
    '<source src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3" type="audio/mpeg">' +
    '</audio>' +
    '</div>';
  const pageEmbedHtml = '<div class="tiny-pageembed" contenteditable="false">' +
    '<iframe src="https://www.tiny.cloud/" width="350px" height="260px" scrolling="no"></iframe>' +
    '</div>';

  Arr.each([
    { label: 'image', selector: 'img', html: imageHtml },
    { label: 'image with caption', selector: 'img', outlineSelector: 'figure.image', html: figureImageHtml },
    { label: 'codesample', selector: 'pre', html: codesampleHtml },
    { label: 'table of contents', selector: 'div.mce-toc', html: tocHtml },
    { label: 'iframe (YouTube video)', selector: 'iframe', outlineSelector: 'span.mce-preview-object', html: iframeHtml },
    { label: 'audio', selector: 'audio', outlineSelector: 'span.mce-preview-object', html: audioHtml },
    { label: 'video', selector: 'video', outlineSelector: 'span.mce-preview-object', html: videoHtml },
    { label: 'mediaembed iframe (YouTube video)', selector: 'iframe', outlineSelector: 'div[data-ephox-embed-iri]', html: iframeMediaEmbedHtml },
    { label: 'mediaembed video', selector: 'video', outlineSelector: 'div[data-ephox-embed-iri]', html: videoMediaEmbedHtml },
    { label: 'mediaembed audio', selector: 'audio', outlineSelector: 'div[data-ephox-embed-iri]', html: audioMediaEmbedHtml },
    { label: 'pageembed website', selector: 'iframe', outlineSelector: 'div.tiny-pageembed', html: pageEmbedHtml },
  ], ({ label, selector, outlineSelector, html }) => {
    context(label, () => {
      const editorHtml = `<p>Before</p>${html}<p>After</p>`;
      const clickOnElm = (editor: Editor) => Mouse.trueClickOn(TinyDom.body(editor), selector);

      it('should have no outline when not selected and has no attributes', async () => {
        const editor = hook.editor();
        editor.setContent(editorHtml);
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        await pAssertOutline(editor, outlineSelector ?? selector, emptyOutline);
      });

      it('should have blue outline when selected', async () => {
        const editor = hook.editor();
        editor.setContent(editorHtml);
        clickOnElm(editor);
        await pAssertOutline(editor, outlineSelector ?? selector, selectedOutline);
      });

      it('should have yellow outline when element has comment attribute but is not selected', async () => {
        const editor = hook.editor();
        editor.setContent(editorHtml);
        clickOnElm(editor);
        editor.annotator.annotate('test-comment', {});
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        await pAssertOutline(editor, outlineSelector ?? selector, commentOutline);
      });

      it('should have blue outline when element with comment attribute is selected', async () => {
        const editor = hook.editor();
        editor.setContent(editorHtml);
        clickOnElm(editor);
        editor.annotator.annotate('test-comment', {});
        TinySelections.setCursor(editor, [ 0, 0 ], 1);
        clickOnElm(editor);
        await pAssertOutline(editor, outlineSelector ?? selector, selectedOutline);
      });
    });
  });

  context('editable element within noneditable element', () => {
    it('should have blue outline for nested editable region when selected and blue outline for noneditable ancestor', async () => {
      const editor = hook.editor();
      editor.setContent(figureImageHtml);
      TinySelections.setCursor(editor, [ 1, 1, 0 ], 1, true);
      await pAssertOutline(editor, 'figure.image', selectedOutline, false);
      await pAssertOutline(editor, 'figcaption', selectedOutline, false);
    });

    it('should have blue outline for nested editable region when selected noneditable ancestor has a comment', async () => {
      const editor = hook.editor();
      editor.setContent(figureImageHtml);
      Mouse.trueClickOn(TinyDom.body(editor), 'img');
      editor.annotator.annotate('test-comment', {});
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 1, true);
      await pAssertOutline(editor, 'figure.image', selectedOutline, false);
      await pAssertOutline(editor, 'figcaption', selectedOutline, false);
    });
  });
});
