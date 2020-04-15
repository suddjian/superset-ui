import memoize from 'lodash/memoize';
import { Registry, makeSingleton } from '@superset-ui/core';
import { ChartControlPanel } from '../models/ChartControlPanel';

class ChartControlPanelRegistry extends Registry<ChartControlPanel, ChartControlPanel> {
  constructor() {
    super({ name: 'ChartControlPanel' });
    this.getInventory = memoize(this.getInventory.bind(this));
  }

  getInventory(vizType: string) {
    const controls = this.get(vizType);
    if (!controls) return null;
    const controlsMap: { [key: string]: any } = {};
    controls.controlPanelSections.forEach((section: any) => {
      section.controlSetRows.forEach((row: any) => {
        row.forEach((control: any) => {
          controlsMap[control.name] = control.config;
        });
      });
    });
    return controlsMap;
  }
}

const getInstance = makeSingleton(ChartControlPanelRegistry);

export default getInstance;
