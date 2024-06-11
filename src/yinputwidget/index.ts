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
      const prompt: string = this.yModel.sharedModel.getAttr('prompt');
      const password: boolean = this.yModel.sharedModel.getAttr('password');
      const promptNode = document.createElement('pre');
      promptNode.textContent = prompt;
      const input1 = document.createElement('div');
      input1.style.border = 'thin solid';
      const input2 = document.createElement('div');
      if (password === true) {
        (input2.style as any).webkitTextSecurity = 'disc';
      }
      input1.appendChild(input2);
      this.node.appendChild(promptNode);
      promptNode.appendChild(input1);

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
        parent: input2
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
