import { Kernel, KernelMessage } from '@jupyterlab/services';
import {
  IJupyterYWidgetModelRegistry,
  IJupyterYWidgetManager,
  IJupyterYModelFactory,
  IJupyterYWidgetFactory
} from './types';
import { YCommProvider } from './yCommProvider';
import { IJupyterYModel } from '../types';

export class JupyterYWidgetManager implements IJupyterYWidgetManager {

  registerNotebook(notebookId: string): IJupyterYWidgetModelRegistry {
    const yModelFactories = this.yModelFactories;
    const wm = new WidgetModelRegistry({ yModelFactories });
    this._registry.set(notebookId, wm);
    return wm;
  }

  registerKernel(kernel: Kernel.IKernelConnection): void {
    const yModelFactories = this.yModelFactories;
    const wm = new WidgetModelRegistry({ kernel, yModelFactories });
    this._registry.set(kernel.id, wm);
  }

  unregisterKernel(kernelId?: string | null): void {
    if (kernelId) {
      this._registry.delete(kernelId);
    }
  }

  registerWidget(
    name: string,
    yModelFactory: IJupyterYModelFactory,
    yWidgetFactory: IJupyterYWidgetFactory
  ): void {
    this.yModelFactories.set(name, yModelFactory);
    this._yWidgetFactories.set(name, yWidgetFactory);
  }

  getWidgetModel(kernelOrNotebookId: string, commOrRoomId: string): IJupyterYModel | undefined {
    return this._registry.get(kernelOrNotebookId)?.getModel(commOrRoomId);
  }

  getWidgetFactory(modelName: string) {
    return this._yWidgetFactories.get(modelName);
  }

  yModelFactories = new Map<string, IJupyterYModelFactory>();
  private _registry = new Map<string, IJupyterYWidgetModelRegistry>();
  private _yWidgetFactories = new Map<string, IJupyterYWidgetFactory>();
}

export class WidgetModelRegistry implements IJupyterYWidgetModelRegistry {
  constructor(options: {
    kernel?: Kernel.IKernelConnection;
    yModelFactories: any;
  }) {
    const { kernel, yModelFactories } = options;
    this._yModelFactories = yModelFactories;
    if (kernel !== undefined) {
      kernel.registerCommTarget('ywidget', this._handle_comm_open);
    }
  }

  getModel(id: string): IJupyterYModel | undefined {
    return this._yModels.get(id);
  }

  setModel(id: string, model: IJupyterYModel): void {
    this._yModels.set(id, model);
  }

  /**
   * Handle when a comm is opened.
   */
  private _handle_comm_open = async (
    comm: Kernel.IComm,
    msg: KernelMessage.ICommOpenMsg
  ): Promise<void> => {
    const yModelFactory = this._yModelFactories.get(msg.metadata.ymodel_name as string);
    const yModel: IJupyterYModel = new yModelFactory(msg.metadata);

    new YCommProvider({
      comm,
      ydoc: yModel.sharedModel.ydoc
    });
    this._yModels.set(comm.commId, yModel);
  };

  private _yModels: Map<string, IJupyterYModel> = new Map();
  private _yModelFactories: Map<string, any>;
}
