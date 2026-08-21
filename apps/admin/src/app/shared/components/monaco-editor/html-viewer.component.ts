import {
  Component,
  ElementRef,
  AfterViewInit,
  signal,
  effect,
  input,
  viewChild
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap } from '@codemirror/commands';
import { html } from '@codemirror/lang-html';
import { history, historyKeymap } from '@codemirror/commands';
import { defaultHighlightStyle, foldGutter, foldKeymap, syntaxHighlighting } from '@codemirror/language';
import DOMPurify from 'dompurify';

@Component({
  standalone: true,
  selector: 'em-html-viewer',
  imports: [FormsModule],
  templateUrl: './html-viewer.component.html',
  styleUrls: ['./html-viewer.component.scss']
})
export class HtmlViewerComponent implements AfterViewInit {
  htmlCode = input<string>('');

  readonly codeHost = viewChild.required<ElementRef<HTMLDivElement>>('codeHost');

  editorView: EditorView | null = null;
  beautifiedHtml = signal<string>('');

  constructor() {
    effect(() => {
      const html = this.htmlCode();
      if (html) this.initEditor(html);
    });
  }

  ngAfterViewInit(): void {
    if (!this.editorView && this.htmlCode()) {
      this.initEditor(this.htmlCode());
    }
  }

  initEditor(rawHtml: string): void {
    const cleanHtml = this.sanitizeWholeDocument(rawHtml || '');
    const beautified = this.beautifyHtml(cleanHtml);
    this.beautifiedHtml.set(this.sanitizeForPreview(beautified));

    if (!this.codeHost()) return;

    if (this.editorView) {
      this.updateEditorContent(beautified);
      return;
    }

    const state = this.createEditorState(beautified);
    this.editorView = this.createEditorView(state);
  }

  private createEditorState(doc: string): EditorState {
    return EditorState.create({
      doc,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        foldGutter(),
        keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap]),
        history(),
        html(),
        syntaxHighlighting(defaultHighlightStyle)
      ]
    });
  }

  private createEditorView(state: EditorState): EditorView {
    return new EditorView({
      state,
      parent: this.codeHost().nativeElement,
      dispatch: tr => {
        this.editorView?.update([tr]);
        if (tr.docChanged) {
          const fullDoc = this.editorView?.state.doc.toString() || '';
          this.beautifiedHtml.set(this.sanitizeForPreview(fullDoc));
        }
      }
    });
  }

  private updateEditorContent(newContent: string): void {
    if (!this.editorView) return;
    this.editorView.dispatch({
      changes: { from: 0, to: this.editorView.state.doc.length, insert: newContent }
    });
  }

  private sanitizeWholeDocument(html: string): string {
    return DOMPurify.sanitize(html, {
      WHOLE_DOCUMENT: true,
      ALLOW_UNKNOWN_PROTOCOLS: true,
      ADD_TAGS: ['html', 'head', 'body', 'meta', 'link', 'title', 'style'],
      ADD_ATTR: ['lang', 'charset', 'name', 'content', 'rel', 'href'],
    });
  }

  private sanitizeForPreview(html: string): string {
    return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  }

  private beautifyHtml(html: string): string {
    const tab = '  ';
    let result = '';
    let indent = '';
    html
      .replace(/>\s+</g, '><')
      .split(/(?=<)|(?<=>)/g)
      .filter(Boolean)
      .forEach(element => {
        if (element.match(/^<\/\w/)) indent = indent.substring(tab.length);
        result += indent + element.trim() + '\n';
        if (element.match(/^<\w([^>]*[^/])?>$/) && !element.includes('</')) indent += tab;
      });

    return result.trim();
  }
}
