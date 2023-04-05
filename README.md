# JupyterLab extension for widgets based on Yjs

## Requirements

- JupyterLab == 4.0.0b0

## Installation

You can install yjs-widgets using pip:

```bash
pip install yjs-widgets
```

## Usage

```typescript
import { IJupyterYModel } from './types';
import { JupyterYModel } from './model';
import { IJupyterYWidgetManager } from './notebookrenderer/types';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

class MyWidget1 {
  constructor(yModel: IJupyterYModel, node: HTMLElement) {
    this.yModel = yModel;
    this.node = node;
    yModel.sharedModel.attrsChanged.connect(() => {
      this._update();
    });
    node.textContent = 'hello from my widget';
  }

  _update(): void {
    const foo1: string = this.yModel.sharedModel.getAttr('foo1') as string;
    const bar1: string = this.yModel.sharedModel.getAttr('bar1') as string;
    if (bar1 != 'abc') {
      this.yModel.sharedModel.setAttr('bar1', 'abc');
    }
    this.node.textContent = foo1;
  }

  yModel: IJupyterYModel;
  node: HTMLElement;
}

export const foo: JupyterFrontEndPlugin<void> = {
  id: 'foo:bar',
  autoStart: true,
  requires: [IJupyterYWidgetManager],
  activate: (app: JupyterFrontEnd, wm: IJupyterYWidgetManager): void => {
    wm.registerWidget('MyWidget1', JupyterYModel, MyWidget1);
  }
};
```

## Contributing

yjs-widgets is an open-source project, and contributions are always welcome. If you would like to contribute, please fork the repository and submit a pull request.

See [CONTRIBUTING](CONTRIBUTING.md) for dev installation instructions.

## License

yjs-widgets is licensed under the BSD 3-Clause License. See the LICENSE file for more information.
