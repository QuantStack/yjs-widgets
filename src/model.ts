import { MapChange } from '@jupyter/ydoc';
import { JSONExt, JSONObject } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';
import * as Y from 'yjs';

import { IJupyterYDoc, IJupyterYModel } from './types';

export class JupyterYModel implements IJupyterYModel {
  constructor(commMetadata: {[key: string]: any}) {
    this._yModelName = commMetadata.ymodel_name;
    const ydoc = this.ydocFactory(commMetadata);
    this._sharedModel = new JupyterYDoc(commMetadata, ydoc);
  }

  get yModelName(): string {
    return this._yModelName;
  }

  get sharedModel(): IJupyterYDoc {
    return this._sharedModel;
  }

  get sharedAttrsChanged(): ISignal<IJupyterYDoc, MapChange> {
    return this.sharedModel.attrsChanged;
  }

  get disposed(): ISignal<JupyterYModel, void> {
    return this._disposed;
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  ydocFactory(commMetadata: {[key: string]: any}): Y.Doc {
    return new Y.Doc();
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

  addAttr(key: string, value: any): void {
    this.sharedModel.setAttr(key, value);
  }

  removeAttr(key: string): void {
    this.sharedModel.removeAttr(key);
  }

  private _yModelName: string;
  private _sharedModel: IJupyterYDoc;

  private _isDisposed = false;

  private _disposed = new Signal<this, void>(this);
}

export class JupyterYDoc implements IJupyterYDoc {
  constructor(commMetadata: {[key: string]: any}, ydoc: Y.Doc) {
    this._commMetadata = commMetadata;
    this._ydoc = ydoc;
    if (commMetadata.create_ydoc) {
      this._attrs = this._ydoc.getMap<string>('_attrs');
      this._attrs.observe(this._attrsObserver);
    }
  }

  get commMetadata(): {[key: string]: any} {
    return this._commMetadata;
  }

  get ydoc(): Y.Doc {
    return this._ydoc;
  }
  get attrs(): JSONObject {
    return JSONExt.deepCopy(this._attrs.toJSON());
  }

  get attrsChanged(): ISignal<IJupyterYDoc, MapChange> {
    return this._attrsChanged;
  }

  get disposed(): ISignal<IJupyterYDoc, void> {
    return this._disposed;
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._attrs.unobserve(this._attrsObserver);
    this._disposed.emit();
    Signal.clearData(this);
    this._isDisposed = true;
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

  private _attrsObserver = (event: Y.YMapEvent<string>): void => {
    this._attrsChanged.emit(event.keys);
  };

  private _attrs: Y.Map<string>;
  private _attrsChanged = new Signal<IJupyterYDoc, MapChange>(this);

  private _isDisposed = false;

  private _disposed = new Signal<this, void>(this);
  private _ydoc: Y.Doc;
  private _commMetadata: {[key: string]: any};
}
