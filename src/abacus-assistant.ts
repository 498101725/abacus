import { LitElement, html, TemplateResult } from 'lit-element';

export class Abacus extends LitElement {
  render(): TemplateResult {
    return html`Hello Abacus`;
  }
}

customElements.define('abacus-assistant', Abacus);
