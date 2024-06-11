import {
  NotebookPanel,
  INotebookTracker,
  type CellList,
} from '@jupyterlab/notebook';
import { IObservableList } from '@jupyterlab/observables';
import { Cell, CodeCell, ICellModel } from '@jupyterlab/cells';
import { YCodeCell } from '@jupyter/ydoc';
import * as Y from 'yjs';
import { UUID } from '@lumino/coreutils';
import { Panel, Widget } from '@lumino/widgets';
import { OutputPrompt } from '@jupyterlab/outputarea';

import { JupyterYWidget } from '../notebookrenderer/view';
import { NotebookRendererModel } from '../notebookrenderer/model';
import { IJupyterYWidgetManager, IJupyterYWidgetModelRegistry } from '../notebookrenderer/types';
import { IJupyterYModel } from '../types';

const OUTPUT_AREA_ITEM_CLASS = 'jp-OutputArea-child';
const OUTPUT_AREA_STDIN_ITEM_CLASS = 'jp-OutputArea-stdin-item';
const OUTPUT_AREA_PROMPT_CLASS = 'jp-OutputArea-prompt';
const OUTPUT_AREA_OUTPUT_CLASS = 'jp-OutputArea-output';

export const PLUGIN_NAME = 'jupyterywidget:yOutputHandler';

export default class YWidget extends Widget {
  constructor(
    panel: NotebookPanel,
    tracker: INotebookTracker,
    wmManager: IJupyterYWidgetManager
  ) {
    super();
    this._panel = panel;
    this._notebookId = UUID.uuid4();
    this._wmManager = wmManager;
    this._wm = wmManager.registerNotebook(this._notebookId);
    const cells = panel.context.model.cells;
    cells.changed.connect(this.updateConnectedCell, this);
    this._modelFactory = new NotebookRendererModel({
      kernelOrNotebookId: this._notebookId,
      widgetManager: this._wmManager
    });
  }

  updateConnectedCell(
    sender: CellList,
    changed: IObservableList.IChangedArgs<ICellModel>
  ): void {
    changed.newValues.forEach(this._observeYOutput.bind(this));
  }

  _observeYOutput(cellModel: ICellModel) {
    const codeCell = this._getCodeCell(cellModel);
    cellModel.sharedModel.changed.connect((sender: any, args: any) => { this.handleYOutput(codeCell, args); });
    const youtputs = (cellModel.sharedModel as YCodeCell).ymodel.get('outputs');
    for (const youtput of youtputs) {
      if (youtput instanceof Y.Map && youtput.get('output_type') === 'ywidget') {
        const roomId = youtput.get('room_id');
        const ymodel_name = youtput.get('model_name');
        this.createYWidget(codeCell, roomId, ymodel_name);
      }
    }
  }

  handleYOutput(sender: any, args: any): void {
    if (
      args.outputsChange !== undefined &&
      args.outputsChange[0].insert !== undefined
    ) {
      const youtput = args.outputsChange[0].insert[0];
      const output_type = youtput.get('output_type');
      if (output_type === 'ywidget') {
        const roomId = youtput.get('room_id');
        const ymodel_name = youtput.get('model_name');
        this.createYWidget(sender, roomId, ymodel_name);
      }
    }
  }

  createYWidget(
    cell: any,
    roomId: string,
    ymodel_name: string
  ): void {
    let yModel: IJupyterYModel;

    if (ymodel_name !== '') {
      const yModelFactory = this._wmManager.yModelFactories.get(ymodel_name)!;
      yModel = new yModelFactory({ymodel_name, 'create_ydoc': true, 'room_id': roomId});
      this._wm.setModel(roomId, yModel);
    }
    else {
      yModel = this._wm.getModel(roomId)!;
    }

    const widget = new JupyterYWidget({ mimeType: '', modelFactory: this._modelFactory });

    const panel = new Panel();
    panel.addClass(OUTPUT_AREA_ITEM_CLASS);
    panel.addClass(OUTPUT_AREA_STDIN_ITEM_CLASS);
    const outputPrompt = new OutputPrompt();
    outputPrompt.addClass(OUTPUT_AREA_PROMPT_CLASS);
    panel.addWidget(outputPrompt);
    widget.addClass(OUTPUT_AREA_OUTPUT_CLASS);
    panel.addWidget(widget);
    cell.outputArea.layout.addWidget(panel);
    widget.render(roomId);
  }

  _getCodeCell(cellModel: ICellModel): CodeCell | null {
    if (cellModel.type === 'code') {
      const cell = this._panel.content.widgets.find(
        (widget: Cell) => widget.model === cellModel
      );
      return cell as CodeCell;
    }
    return null;
  }

  private _panel: NotebookPanel;
  private _notebookId: string;
  private _wmManager: IJupyterYWidgetManager;
  private _wm: IJupyterYWidgetModelRegistry;
  private _modelFactory: NotebookRendererModel;
}
