import { notebookRenderer, yWidgetManager } from './notebookrenderer';

import { IJupyterYModel } from './types';
import { JupyterYModel } from './model';
import { IJupyterYWidgetManager } from './notebookrenderer/types';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

class Switch {
  constructor(yModel: IJupyterYModel, node: HTMLElement) {
    this.yModel = yModel;
    this.node = node;
    yModel.sharedModel.attrsChanged.connect(() => {this._update();});
    node.innerHTML = '<label class="switch"> <input type="checkbox" id="toggle-me"> <span class="slider"></span> </label>';
  }

  _update(): void {
    const value: string = this.yModel.sharedModel.getAttr('value') as string;
    console.log(value);
    const slider = document.getElementById("toggle-me");
    console.log(slider);
    (slider as any)!.checked = value;
  }

  yModel: IJupyterYModel;
  node: HTMLElement;
}

export const foo: JupyterFrontEndPlugin<void> =
  {
    id: 'foo:bar',
    autoStart: true,
    requires: [IJupyterYWidgetManager],
    activate: (
      app: JupyterFrontEnd,
      wm: IJupyterYWidgetManager 
    ): void => {
        wm.registerWidget('Switch', JupyterYModel, Switch);
    }
  };

export default [
  notebookRenderer,
  yWidgetManager,
  foo
];
