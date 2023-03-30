import { MapChange, YDocument } from '@jupyter/ydoc';
import { IChangedArgs } from '@jupyterlab/coreutils';
import { JSONExt, JSONObject, PartialJSONObject } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';
import * as Y from 'yjs';

import {
  IJupyterYDoc,
  IJupyterYDocChange,
  IJupyterYModel,
} from './types';

interface IOptions {
  yModelName: string;
  sharedModel?: IJupyterYDoc;
}

export class JupyterYModel implements IJupyterYModel {
  constructor(options: IOptions) {
    const { yModelName, sharedModel } = options;
    this._yModelName = yModelName;
    if (sharedModel) {
      this._sharedModel = sharedModel;
    } else {
      this._sharedModel = JupyterYDoc.create();
    }
  }

  get yModelName(): string {
    return this._yModelName;
  }

  get sharedModel(): IJupyterYDoc {
    return this._sharedModel;
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  get contentChanged(): ISignal<this, void> {
    return this._contentChanged;
  }

  get stateChanged(): ISignal<this, IChangedArgs<any, any, string>> {
    return this._stateChanged;
  }

  get dirty(): boolean {
    return this._dirty;
  }
  set dirty(value: boolean) {
    this._dirty = value;
  }

  get readOnly(): boolean {
    return this._readOnly;
  }
  set readOnly(value: boolean) {
    this._readOnly = value;
  }

  get sharedAttrsChanged(): ISignal<IJupyterYDoc, MapChange> {
    return this.sharedModel.attrsChanged;
  }

  get disposed(): ISignal<JupyterYModel, void> {
    return this._disposed;
  }

  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    this._sharedModel.dispose();
    this._disposed.emit();
    Signal.clearData(this);
  }

  fromString(data: string): void {
  }

  toJSON(): PartialJSONObject {
    return JSON.parse(this.toString());
  }

  fromJSON(data: PartialJSONObject): void {
    // nothing to do
  }

  initialize(): void {
    //
  }

  getClientId(): number {
    return this.sharedModel.awareness.clientID;
  }

  addAttr(key: string, value: any): void {
    this.sharedModel.setAttr(key, value);
  }

  removeAttr(key: string): void {
    this.sharedModel.removeAttr(key);
  }

  readonly defaultKernelName: string = '';
  readonly defaultKernelLanguage: string = '';

  private _yModelName: string;
  private _sharedModel: IJupyterYDoc;

  private _dirty = false;
  private _readOnly = false;
  private _isDisposed = false;

  private _disposed = new Signal<this, void>(this);
  private _contentChanged = new Signal<this, void>(this);
  private _stateChanged = new Signal<this, IChangedArgs<any>>(this);
}

export class JupyterYDoc
  extends YDocument<IJupyterYDocChange>
  implements IJupyterYDoc
{
  constructor() {
    super();

    this._attrs = this.ydoc.getMap<string>('_attrs');
    this._attrs.observe(this._attrsObserver);
  }

  dispose(): void {
    this._attrs.unobserve(this._attrsObserver);
    super.dispose();
  }

  get attrs(): JSONObject {
    return JSONExt.deepCopy(this._attrs.toJSON());
  }

  get attrsChanged(): ISignal<IJupyterYDoc, MapChange> {
    return this._attrsChanged;
  }

  getAttr(key: string): string | undefined {
    return this._attrs.get(key);
  }

  setAttr(key: string, value: any): void {
    this._attrs.set(key, value);
  }

  removeAttr(key: string): void {
    if (this._attrs.has(key)) {
      this._attrs.delete(key);
    }
  }

  static create(): IJupyterYDoc {
    return new JupyterYDoc();
  }

  private _attrsObserver = (event: Y.YMapEvent<string>): void => {
    this._attrsChanged.emit(event.keys);
  };

  private _attrs: Y.Map<string>;
  private _attrsChanged = new Signal<IJupyterYDoc, MapChange>(this);
}
