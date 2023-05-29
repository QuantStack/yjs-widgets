import { MapChange, StateChange } from '@jupyter/ydoc';
import * as Y from 'yjs';
import { ISignal } from '@lumino/signaling';
import { JSONObject } from '@lumino/coreutils';
import { IDisposable } from '@lumino/disposable';

export interface IJupyterYDocChange {
  attrsChange?: MapChange;
  stateChange?: StateChange<any>[];
}

export interface IJupyterYDoc extends IDisposable {
  attrs: JSONObject;

  getAttr(key: string): any;
  setAttr(key: string, value: any): void;
  removeAttr(key: string): void;

  attrsChanged: ISignal<IJupyterYDoc, MapChange>;
  ydoc: Y.Doc;
  commMetadata: {[key: string]: any};
  disposed: ISignal<any, void>;
}

export interface IJupyterYModel extends IDisposable {
  yModelName: string;
  isDisposed: boolean;
  sharedModel: IJupyterYDoc;

  sharedAttrsChanged: ISignal<IJupyterYDoc, MapChange>;

  disposed: ISignal<any, void>;
}
