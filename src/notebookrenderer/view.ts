import { Widget } from '@lumino/widgets';

//import { JupyterYWidget} from '../widget';
import { NotebookRendererModel } from './model';
import { IRenderMime } from '@jupyterlab/rendermime';
import { IJupyterYModel } from '../types';

export const CLASS_NAME = 'mimerenderer-jupyterywidget';

export class JupyterYWidget extends Widget implements IRenderMime.IRenderer {
  /**
   * Construct a new output widget.
   */
  constructor(options: {
    modelFactory: NotebookRendererModel;
    mimeType: string;
  }) {
    super();
    this._modelFactory = options.modelFactory;
    this._mimeType = options.mimeType;
    this.addClass(CLASS_NAME);
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._yModel?.dispose();
    super.dispose();
  }
  async renderModel(mimeModel: IRenderMime.IMimeModel): Promise<void> {
    const modelId = mimeModel.data[this._mimeType]!['model_id'];

    this._yModel = this._modelFactory.getYModel(modelId);
    if (!this._yModel) {
      return;
    }
    this._modelFactory.createYWidget(modelId, this.node);
  }

  private _modelFactory: NotebookRendererModel;
  private _mimeType: string;
  private _yModel?: IJupyterYModel;
}
