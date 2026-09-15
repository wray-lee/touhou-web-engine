// 开发示例：直接引用仓库源码。
// 生产环境（npm 安装后）请改为：
//   import { TH08Game } from '@uestc-touhou/touhou-web-engine/th08';
import { TH08Game } from '../src/games/th08/index.ts';

const container = document.getElementById('game-root');
const game = new TH08Game({ showPerformanceMonitor: true });
await game.init(container);
game.start();
window.__TOUHOU_GAME__ = game;
