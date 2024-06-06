import { IJupyterYModel } from '../types';
import { JupyterYModel } from '../model';
import { IJupyterYWidgetManager } from '../notebookrenderer/types';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ybinding } from '@jupyterlab/codemirror';
import { StateCommand } from '@codemirror/state';
import { EditorView, KeyBinding, keymap } from '@codemirror/view';
import { WebsocketProvider } from 'y-websocket';

class InputWidget {
  constructor(yModel: IJupyterYModel, node: HTMLElement) {
    this.yModel = yModel;
    this.node = node;

    const wsProvider = new WebsocketProvider(
      'ws://127.0.0.1:8000', `api/collaboration/room/${yModel.roomId}`,
      yModel.sharedModel.ydoc
    );

    wsProvider.on('sync', (isSynced) => {
      const stdin = this.yModel.sharedModel.getAttr('value');
      const ybind = ybinding({ ytext: stdin });
      const submit: StateCommand = ({ state, dispatch }) => {
        this.yModel.sharedModel.setAttr('submitted', true);
        return true;
      };
      const submitWithEnter: KeyBinding = {
        key: 'Enter',
        run: submit
      };
      new EditorView({
        doc: stdin.toString(),
        extensions: [keymap.of([submitWithEnter]), ybind],
        parent: this.node
      });
    });
  }

  yModel: IJupyterYModel;
  node: HTMLElement;
}

export const yInputWidget: JupyterFrontEndPlugin<void> = {
  id: 'jupyterywidget:yInputWidget',
  autoStart: true,
  requires: [IJupyterYWidgetManager],
  activate: (app: JupyterFrontEnd, wm: IJupyterYWidgetManager): void => {
    wm.registerWidget('Input', JupyterYModel, InputWidget);
  }
};
