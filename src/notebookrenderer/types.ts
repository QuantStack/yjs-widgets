import { Kernel } from '@jupyterlab/services';
import { Token } from '@lumino/coreutils';
import { IJupyterYModel } from '../types';

export interface IJupyterYWidgetModelRegistry {
  getModel(id: string): IJupyterYModel | undefined;
  setModel(id: string, model: IJupyterYModel): void;
}

export interface IJupyterYModelFactory {
  new (...args: any[]): IJupyterYModel;
}

export interface IJupyterYWidgetFactory {
  new (...args: any[]): IJupyterYWidget;
}

export interface IJupyterYWidgetManager {
  registerNotebook(notebookId: string): IJupyterYWidgetModelRegistry;
  registerKernel(kernel: Kernel.IKernelConnection): void;
  registerWidget(
    name: string,
    yModelFactory: IJupyterYModelFactory,
    yWidgetFactory: IJupyterYWidgetFactory
  ): void;
  getWidgetModel(kernelId: string, commId: string): IJupyterYModel | undefined;
  getWidgetFactory(modelName: string): any | undefined;
  yModelFactories: Map<string, IJupyterYModelFactory>;
}

export const IJupyterYWidgetManager = new Token<IJupyterYWidgetManager>(
  'yjs-widgets:IJupyterYWidgetManager',
  'A manager of Yjs-based Jupyter widgets.'
);

export interface IJupyterYWidget {
  node: HTMLElement;
  yModel: IJupyterYModel;
}
