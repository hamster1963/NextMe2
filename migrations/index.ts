import * as migration_20260217_124722 from './20260217_124722';
import * as migration_20260217_160441 from './20260217_160441';

export const migrations = [
  {
    up: migration_20260217_124722.up,
    down: migration_20260217_124722.down,
    name: '20260217_124722',
  },
  {
    up: migration_20260217_160441.up,
    down: migration_20260217_160441.down,
    name: '20260217_160441'
  },
];
