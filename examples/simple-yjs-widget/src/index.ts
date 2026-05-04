import {
  IJupyterYModel,
  JupyterYModel,
  IJupyterYWidgetManager
} from 'yjs-widgets';

import * as Y from 'yjs';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

class MySlider {
  constructor(yModel: IJupyterYModel, node: HTMLElement) {
    this.yModel = yModel;
    this.node = node;

    this.state = this.yModel.sharedModel.ydoc.getMap('state');

    this.state.observe(this._stateChanged.bind(this));

    this.slider = document.createElement('input');
    this.slider.setAttribute('type', 'range');

    this.state.set('min', 0);
    this.state.set('max', 100);
    this.state.set('value', 50);
    this.state.set('step', 1);

    this.slider.min = this.state.get('min');
    this.slider.max = this.state.get('max');
    this.slider.value = this.state.get('value');
    this.slider.step = this.state.get('step');

    this.slider.onchange = this._sliderChanged.bind(this);

    node.appendChild(this.slider);
  }

  _stateChanged(change: Y.YMapEvent<any>): void {
    for (const key of change.keysChanged) {
      this.slider[key] = change.target.toJSON()[key];
    }
  }

  _sliderChanged(): void {
    this.state.set('value', parseInt(this.slider.value ?? '50'));
  }

  state: Y.Map<any>;
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
