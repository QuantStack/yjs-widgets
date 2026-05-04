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

class MySlider {
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

const simple: JupyterFrontEndPlugin<void> = {
  id: 'example:simple',
  autoStart: true,
  requires: [IJupyterYWidgetManager],
  activate: (_: JupyterFrontEnd, wm: IJupyterYWidgetManager): void => {
    wm.registerWidget('MySlider', JupyterYModel, MySlider);
  }
};

export default [simple];
