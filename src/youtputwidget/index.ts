import { IJupyterYModel } from '../types';
import { JupyterYModel } from '../model';
import { IJupyterYWidgetManager } from '../notebookrenderer/types';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

class StdoutOutputWidget {
  constructor(yModel: IJupyterYModel, node: HTMLElement) {
    this.yModel = yModel;
    this.node = node;

    const wsProvider = new WebsocketProvider(
      'ws://127.0.0.1:8000', `api/collaboration/room/${yModel.roomId}`,
      yModel.sharedModel.ydoc
    );

    wsProvider.on('sync', (isSynced) => {
      const text: Y.Text = this.yModel.sharedModel.getAttr('text');
      const pre = document.createElement('pre');
      pre.innerText = text.toString();
      this.node.appendChild(pre);
      text.observe((event: any) => {
        pre.innerText = event.target.toString();
      });
    });
  }

  yModel: IJupyterYModel;
  node: HTMLElement;
}

export const yStdoutOutputWidget: JupyterFrontEndPlugin<void> = {
  id: 'jupyterywidget:yStdoutOutputWidget',
  autoStart: true,
  requires: [IJupyterYWidgetManager],
  activate: (app: JupyterFrontEnd, wm: IJupyterYWidgetManager): void => {
    wm.registerWidget('StdoutOutput', JupyterYModel, StdoutOutputWidget);
  }
};
