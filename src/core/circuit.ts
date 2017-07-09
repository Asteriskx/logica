import のーど from './node';
import Package from './nodes/package';
import PackageInput from './nodes/package-input';
import PackageOutput from './nodes/package-output';

/**
 * 回路
 */
export default class Circuit {
	/**
	 * この回路に含まれているノード
	 */
	public nodes: Set<のーど> = new Set();

	private shouldUpdates: Set<のーど> = new Set();

	constructor(nodes?: のーど[]) {
		if (nodes) nodes.forEach(n => this.addNode(n));
	}

	private init() {
		this.nodes.forEach(n => n.init());
		this.shouldUpdates = new Set(Array.from(this.nodes).filter(n => n.isForceUpdate));
		this.tick();
	}

	/**
	 * 回路の状態を1(またはn)ステップ進めます
	 */
	public tick(n: number = 1) {
		for (let i = 0; i < n; i++) {
			console.log('======================');
			console.log(Array.from(this.shouldUpdates).map((n: any) => {
				let log = `${n.type} ${n.name || '-'}`;
				if (n._reason) log += ` (${n._reason.type} ${n._reason.name || '-'}によって)`;
				return log;
			}).join('\n'));

			new Set(this.shouldUpdates).forEach(node => {
				node.update();
				this.shouldUpdates.delete(node);

				node.outputInfo.forEach(o => {
					if ((node as any).hasOwnProperty('_previousStates') && (node as any)._previousStates[o.id] === node.getState(o.id)) return;
					if (!(node as any).hasOwnProperty('_previousStates')) (node as any)._previousStates = {};
					(node as any)._previousStates[o.id] = node.getState(o.id);

					const next = node.getActualNextNodes(o.id);
					next.forEach(n => (n as any)._reason = node);
					next.forEach(n => this.shouldUpdates.add(n));
				});
			});
/*
		console.log('======================');
		console.log(Array.from(this.nodes).map((n: any) => `${n.type} ${n.name || '-'} ${JSON.stringify(n.states)}`).join('\n'));
		console.log('======================');
*/
		}
	}

	/**
	 * 回路の状態の変化がなくなるまでtickします
	 */
	public calc(): number {
		let count = 0;
		while (this.shouldUpdates.size != 0) {
			this.tick();
			count++;
		}
		return count;
	}

	/**
	 * 回路の状態を初期状態に戻します
	 */
	public reset() {
		this.init();
	}

	public addNode(node: のーど) {
		this.nodes.add(node);
		node.requestUpdateAtNextTick = () => this.shouldUpdates.add(node);
		if (node.isForceUpdate) this.shouldUpdates.add(node);
	}
}
