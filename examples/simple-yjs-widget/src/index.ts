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

class MyWidget {
  constructor(yModel: IJupyterYModel, node: HTMLElement) {
    this.yModel = yModel;
    this.node = node;

    this.foo = this.yModel.sharedModel.ydoc.getText('foo');

    this.foo.observe(this._attrsChanged.bind(this));
  }

  _attrsChanged(): void {
    this.node.innerHTML = `foo=${this.foo.toJSON()}`;
  }

  foo: Y.Text;
  yModel: IJupyterYModel;
  node: HTMLElement;
}

const simple: JupyterFrontEndPlugin<void> = {
  id: 'example:simple',
  autoStart: true,
  requires: [IJupyterYWidgetManager],
  activate: (_: JupyterFrontEnd, wm: IJupyterYWidgetManager): void => {
    wm.registerWidget('MyWidget', JupyterYModel, MyWidget);
  }
};

export default [simple];
