import { IDisposable } from '@lumino/disposable';

import { IJupyterYModel } from '../types';
import { IJupyterYWidgetManager } from './types';

export class NotebookRendererModel implements IDisposable {
  constructor(options: NotebookRendererModel.IOptions) {
    this._widgetManager = options.widgetManager;
    this._kernelOrNotebookId = options.kernelOrNotebookId;
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
  }

  getYModel(commOrRoomId: string): IJupyterYModel | undefined {
    if (this._kernelOrNotebookId) {
      return this._widgetManager.getWidgetModel(this._kernelOrNotebookId, commOrRoomId);
    }
  }

  createYWidget(commOrRoomId: string, node: HTMLElement): void {
    if (this._kernelOrNotebookId) {
      const yModel = this._widgetManager.getWidgetModel(this._kernelOrNotebookId, commOrRoomId);
      if (yModel) {
        const widgetFactory = this._widgetManager.getWidgetFactory(
          yModel.yModelName
        );
        new widgetFactory(yModel, node);
      }
    }
  }

  private _isDisposed = false;
  private _kernelOrNotebookId?: string;
  private _widgetManager: IJupyterYWidgetManager;
}

export namespace NotebookRendererModel {
  export interface IOptions {
    kernelOrNotebookId?: string;
    widgetManager: IJupyterYWidgetManager;
  }
}
