import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import {
  INotebookTracker,
  INotebookModel,
  NotebookPanel,
} from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import YWidget, { PLUGIN_NAME } from './yWidget';
import { IJupyterYWidgetManager } from '../notebookrenderer/types';

class yWidgetExtension implements DocumentRegistry.WidgetExtension {
  constructor(tracker: INotebookTracker, wmManager: IJupyterYWidgetManager) {
    this._tracker = tracker;
    this._wmManager = wmManager;
  }

  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ) {
    return new YWidget(panel, this._tracker, this._wmManager);
  }

  private _tracker: INotebookTracker;
  private _wmManager: IJupyterYWidgetManager;
}

export const yOutputHandler: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_NAME,
  autoStart: true,
  requires: [INotebookTracker, ISettingRegistry, IJupyterYWidgetManager],
  activate: async (
    app: JupyterFrontEnd,
    tracker: INotebookTracker,
    settingRegistry: ISettingRegistry,
    wmManager: IJupyterYWidgetManager
  ) => {
    app.docRegistry.addWidgetExtension(
      'Notebook',
      new yWidgetExtension(tracker, wmManager)
    );

    // eslint-disable-next-line no-console
    console.log(`JupyterLab extension ${PLUGIN_NAME} is activated!`);
  },
};
