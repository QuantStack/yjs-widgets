import {
  IJupyterYModel,
  JupyterYModel,
  IJupyterYWidgetManager,
  IJupyterYDoc
} from 'yjs-widgets';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { MapChange } from '@jupyter/ydoc';

class IntSlider {
  constructor(yModel: IJupyterYModel, node: HTMLElement) {
    this.yModel = yModel;
    this.node = node;

    this.slider = document.createElement('input');
    this.slider.setAttribute('type', 'range');

    this.yModel.sharedModel.attrsChanged.connect(this._stateChanged.bind(this));

    this.slider.min = this.yModel.sharedModel.getAttr('min');
    this.slider.max = this.yModel.sharedModel.getAttr('max');
    this.slider.value = this.yModel.sharedModel.getAttr('value');
    this.slider.step = this.yModel.sharedModel.getAttr('step');

    this.slider.onchange = this._sliderChanged.bind(this);

    node.appendChild(this.slider);
  }

  _stateChanged(_: IJupyterYDoc, change: MapChange): void {
    for (const key of change.keys()) {
      this.slider[key] = this.yModel.sharedModel.getAttr(key);
    }
  }

  _sliderChanged(): void {
    this.yModel.sharedModel.setAttr('value', parseInt(this.slider.value ?? '50'));
  }

  yModel: IJupyterYModel;
  node: HTMLElement;
  slider: HTMLInputElement;
}

class Textarea {
  constructor(yModel: IJupyterYModel, node: HTMLElement) {
    this.yModel = yModel;
    this.node = node;

    this.textarea = document.createElement('textarea');

    this.yModel.sharedModel.attrsChanged.connect(this._stateChanged.bind(this));

    this.textarea.value = this.yModel.sharedModel.getAttr('value');
    this.textarea.rows = this.yModel.sharedModel.getAttr('rows');
    this.textarea.disabled = this.yModel.sharedModel.getAttr('disabled');

    this.textarea.onchange = this._textareaChanged.bind(this);
    this.textarea.oninput = this._textareaInput.bind(this);

    node.appendChild(this.textarea);
  }

  _stateChanged(_: IJupyterYDoc, change: MapChange): void {
    for (const key of change.keys()) {
      this.textarea[key] = this.yModel.sharedModel.getAttr(key);
    }
  }

  _textareaChanged(): void {
    this.yModel.sharedModel.setAttr('value', this.textarea.value ?? '');
  }

  _textareaInput(): void {
    if (this.yModel.sharedModel.getAttr('continuous_update')) {
      this.yModel.sharedModel.setAttr('value', this.textarea.value ?? '');
    }
  }

  yModel: IJupyterYModel;
  node: HTMLElement;
  textarea: HTMLTextAreaElement;
}

const simple: JupyterFrontEndPlugin<void> = {
  id: 'example:simple',
  autoStart: true,
  requires: [IJupyterYWidgetManager],
  activate: (_: JupyterFrontEnd, wm: IJupyterYWidgetManager): void => {
    wm.registerWidget('IntSlider', JupyterYModel, IntSlider);
    wm.registerWidget('Textarea', JupyterYModel, Textarea);
  }
};

export default [simple];
