import * as YjsWidgets from 'yjs-widgets';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

class MyWidget {
  constructor(yModel: YjsWidgets.IJupyterYModel, node: HTMLElement) {
    this.yModel = yModel;
    this.node = node;
    this.yModel.sharedModel.setAttr('foo', '');
    this.yModel.sharedModel.setAttr('bar', '');
    yModel.sharedModel.attrsChanged.connect(() => {
      this._attrsChanged();
    });
    setInterval(() => {this._changeAttrs();}, 1000);
    this._changeAttrs();
  }

  _changeAttrs(): void {
    let foo: string = this.yModel.sharedModel.getAttr('foo') as string;
    let bar: string = this.yModel.sharedModel.getAttr('bar') as string;
    foo = `#${foo}`;
    bar = `#${bar}`;
    this.yModel.sharedModel.setAttr('foo', foo);
    this.yModel.sharedModel.setAttr('bar', bar);
    this.node.innerHTML = `foo=${foo}<br>bar=${bar}`;
  }

  _attrsChanged(): void {
    const foo: string = this.yModel.sharedModel.getAttr('foo') as string;
    const bar: string = this.yModel.sharedModel.getAttr('bar') as string;
    this.node.innerHTML = `foo=${foo}<br>bar=${bar}`;
  }

  yModel: YjsWidgets.IJupyterYModel;
  node: HTMLElement;
}

const simple: JupyterFrontEndPlugin<void> = {
  id: 'example:simple',
  autoStart: true,
  requires: [YjsWidgets.IJupyterYWidgetManager],
  activate: (app: JupyterFrontEnd, wm: YjsWidgets.IJupyterYWidgetManager): void => {
    wm.registerWidget('MyWidget', YjsWidgets.JupyterYModel, MyWidget);
  }
};

export default [simple];
