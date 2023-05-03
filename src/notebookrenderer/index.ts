import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ISessionContext } from '@jupyterlab/apputils';
import { IChangedArgs } from '@jupyterlab/coreutils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { Kernel } from '@jupyterlab/services';

import { NotebookRendererModel } from './model';
import { IJupyterYWidgetManager } from './types';
import { JupyterYWidget } from './view';
import { JupyterYWidgetManager } from './widgetManager';

const MIME_TYPE = 'application/vnd.jupyter.ywidget-view+json';

export const notebookRenderer: JupyterFrontEndPlugin<void> = {
  id: 'jupyterywidget:notebookRenderer',
  autoStart: true,
  requires: [IRenderMimeRegistry, INotebookTracker, IJupyterYWidgetManager],
  activate: (
    app: JupyterFrontEnd,
    rendermime: IRenderMimeRegistry,
    nbTracker: INotebookTracker,
    wmManager: IJupyterYWidgetManager
  ) => {
    const rendererFactory: IRenderMime.IRendererFactory = {
      safe: true,
      mimeTypes: [MIME_TYPE],
      createRenderer: options => {
        const kernelId =
          nbTracker.currentWidget?.sessionContext.session?.kernel?.id;
        const mimeType = options.mimeType;
        const modelFactory = new NotebookRendererModel({
          kernelId,
          widgetManager: wmManager
        });
        return new JupyterYWidget({ mimeType, modelFactory });
      }
    };
    rendermime.addFactory(rendererFactory, -100);
  }
};

export const yWidgetManager: JupyterFrontEndPlugin<IJupyterYWidgetManager> = {
  id: 'yjs-widgets:yWidgetManagerPlugin',
  autoStart: true,
  requires: [INotebookTracker],
  provides: IJupyterYWidgetManager,
  activate: (
    app: JupyterFrontEnd,
    tracker: INotebookTracker
  ): IJupyterYWidgetManager => {
    const registry = new JupyterYWidgetManager();
    const onKernelChanged = (
      _: ISessionContext,
      changedArgs: IChangedArgs<
        Kernel.IKernelConnection | null,
        Kernel.IKernelConnection | null,
        'kernel'
      >
    ) => {
      const { newValue, oldValue } = changedArgs;
      if (newValue) {
        registry.unregisterKernel(oldValue?.id);
        registry.registerKernel(newValue);
        newValue.disposed.connect(() => {
          registry.unregisterKernel(newValue.id);
        });
      }
    };
    tracker.widgetAdded.connect(async (_, notebook) => {
      notebook.sessionContext.kernelChanged.connect(onKernelChanged);
      notebook.disposed.connect(() => {
        notebook.sessionContext.kernelChanged.disconnect(onKernelChanged);
      });
    });

    return registry;
  }
};
