import { IDisposable } from '@lumino/disposable';

import { IJupyterYModel } from '../types';
import { IJupyterYWidgetManager } from './types';

export class NotebookRendererModel implements IDisposable {
  constructor(options: NotebookRendererModel.IOptions) {
    this._widgetManager = options.widgetManager;
    this._kernelId = options.kernelId;
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

  getYModel(commId: string): IJupyterYModel | undefined {
    if (this._kernelId) {
      return this._widgetManager.getWidgetModel(this._kernelId, commId);
    }
  }

  createYWidget(commId: string, node: HTMLElement): void {
    if (this._kernelId) {
      const yModel = this._widgetManager.getWidgetModel(this._kernelId, commId);
      if (yModel) {
        const widgetFactory = this._widgetManager.getWidgetFactory(
          yModel.yModelName
        );
        new widgetFactory(yModel, node);
      }
    }
  }

  private _isDisposed = false;
  private _kernelId?: string;
  private _widgetManager: IJupyterYWidgetManager;
}

export namespace NotebookRendererModel {
  export interface IOptions {
    kernelId?: string;
    widgetManager: IJupyterYWidgetManager;
  }
}
