import * as SVG from 'svg.js';
import autobind from 'autobind-decorator';
import * as riot from 'riot';

import CircuitCore from '../core/circuit';
import のーど from '../core/node';
import Package from '../core/nodes/package';
import PackageInput from '../core/nodes/package-input';
import PackageOutput from '../core/nodes/package-output';

import { NodeView, NodeViewModel } from './node-view';

import { AndView, AndViewModel } from './node-views/and';
import { ButtonView, ButtonViewModel } from './node-views/button';
import { LedView, LedViewModel } from './node-views/led';
import { PackageInputView, PackageInputViewModel } from './node-views/package-input';
import { PackageOutputView, PackageOutputViewModel } from './node-views/package-output';
import { ModuleView, ModuleViewModel } from './node-views/module';
/*
import And3View from './node-views/and3';
import OrView from './node-views/or';
import Or3View from './node-views/or3';
import NotView from './node-views/not';
import NorView from './node-views/nor';
import NandView from './node-views/nand';
import XorView from './node-views/xor';
import TrueView from './node-views/true';
import FalseView from './node-views/false';
import NopView from './node-views/nop';
import RandomView from './node-views/random';
import ButtonView from './node-views/button';
import LedView from './node-views/led';
import PinView from './node-views/pin';
import { PackageView } from './node-views/package';
*/

import Config from './config';

/**
 * 回路ビュー(モジュール内部含む)
 */
@autobind
export default abstract class NodesView {
	/**
	 * SVGのインスタンス
	 */
	public draw: any;

	/**
	 * このビューに含まれるノードのビュー
	 */
	public nodeViews: NodeView[] = [];

	private _selectedNodeViews: NodeView[] = [];
	public get selectedNodeViews() {
		return this._selectedNodeViews;
	}

	protected get nodes() {
		return this.nodeViews.map(v => v.node);
	}

	private config: Config;

	constructor(config: Config, svg, w, h) {
		this.config = config;
		this.draw = SVG(svg).size(w, h);
	}

	public selectNodeViews(nodeViews: NodeView[]) {
		this._selectedNodeViews.forEach(v => {
			v.drawUnSelected();
		});
		nodeViews.forEach(v => {
			v.drawSelected();
		});
		this._selectedNodeViews = nodeViews;
	}

	public unSelectAllNodeViews() {
		this._selectedNodeViews.forEach(v => {
			v.drawUnSelected();
		});
		this._selectedNodeViews = [];
	}

	public open(vm: NodeViewModel) {
		riot.mount(document.body.appendChild(document.createElement('lo-nodes')), {
			module: vm
		});
	}

	/**
	 * 選択されているノードをパッケージングします
	 */
	public packaging() {
		const nodes = this.selectedNodeViews.map(v => v.node);

		if (nodes.find(n => n.type === 'PackageInput') == null || nodes.find(n => n.type === 'PackageOutput') == null) {
			alert('パッケージを作成するには、回路に一つ以上のPackageInputおよびPackageOutputが含まれている必要があります' + '\n' + 'To create a package, you must include PackageInput and PackageOutput.');
			return;
		}

		const author = window.prompt('Your name');
		const name = window.prompt('Package name');
		const desc = window.prompt('Package description');

		const moduleView = new ModuleView(this.config, this, new ModuleViewModel(this.config, this.selectedNodeViews.map(v => v.viewModel), name, desc, author));

		// ノードを回路から削除すると出力情報もクリアされるので記憶しておく
		const outputs = {};
		nodes.forEach((n, i) => {
			if (n.hasOutputPorts) {
				outputs[i] = Array.from(n.outputs).map(o => ({
					node: o.to.node,
					to: o.to.port,
					from: o.from.port
				}));
			}
		});

		// 回路から削除
		this.selectedNodeViews.forEach(v => {
			this.removeNodeView(v);
		});

		// 繋ぎなおす
		nodes.forEach((n, i) => {
			const outs = outputs[i];
			if (outs) {
				outs.forEach(out => {
					n.connectTo(out.node, out.to, out.from);
				});
			}
		});

		// モジュールをビューに追加
		this.addNodeView(moduleView);

		// 選択を解除しておく
		this.unSelectAllNodeViews();
	}

	removeNodeView(nodeView: NodeView) {
		this.nodeViews = this.nodeViews.filter(v => v != nodeView);
		nodeView.destroy();
	}

	addNodeView(nodeView: NodeView) {
		this.nodeViews.push(nodeView);
		//nodeView.move(32 + (Math.random() * 32), 32 + (Math.random() * 32));
	}

	addAnd() {
		this.addNodeView(new AndView(this.config, this, new AndViewModel(this.config)));
	}

	addButton() {
		this.addNodeView(new ButtonView(this.config, this, new ButtonViewModel(this.config)));
	}

	addLed() {
		this.addNodeView(new LedView(this.config, this, new LedViewModel(this.config)));
	}

	addPackageInput() {
		const name = window.prompt('Input name');
		const id = window.prompt('Input ID ([a-z0-9_]+)');
		const desc = window.prompt('Input description');
		const index = Array.from(this.nodes).filter(n => n.type === 'PackageInput').length;
		this.addNodeView(new PackageInputView(this.config, this, new PackageInputViewModel(this.config, id, name, desc, index)));
	}

	addPackageOutput() {
		const name = window.prompt('Output name');
		const id = window.prompt('Output ID ([a-z0-9_]+)');
		const desc = window.prompt('Output description');
		const index = Array.from(this.nodes).filter(n => n.type === 'PackageOutput').length;
		this.addNodeView(new PackageOutputView(this.config, this, new PackageOutputViewModel(this.config, id, name, desc, index)));
	}

/*
	addAnd3() {
		this.addNode(new And3View(this.config, this));
	}

	addOr() {
		this.addNode(new OrView(this.config, this));
	}

	addOr3() {
		this.addNode(new Or3View(this.config, this));
	}

	addNot() {
		this.addNode(new NotView(this.config, this));
	}

	addNor() {
		this.addNode(new NorView(this.config, this));
	}

	addNand() {
		this.addNode(new NandView(this.config, this));
	}

	addXor() {
		this.addNode(new XorView(this.config, this));
	}

	addTrue() {
		this.addNode(new TrueView(this.config, this));
	}

	addFalse() {
		this.addNode(new FalseView(this.config, this));
	}

	addNop() {
		this.addNode(new NopView(this.config, this));
	}

	addRandom() {
		this.addNode(new RandomView(this.config, this));
	}

	addButton() {
		this.addNode(new ButtonView(this.config, this));
	}

	addLed() {
		this.addNode(new LedView(this.config, this));
	}

	addPin() {
		this.addNode(new PinView(this.config, this));
	}

*/
}

@autobind
export class CircuitNodesView extends NodesView {
	circuit: CircuitCore;

	constructor(config: Config, circuit: CircuitCore, svg, w, h) {
		super(config, svg, w, h);
		this.circuit = circuit;
	}

	addNodeView(nodeView: NodeView) {
		this.circuit.addNode(nodeView.node);
		super.addNodeView(nodeView);
	}

	removeNodeView(nodeView: NodeView) {
		this.circuit.removeNode(nodeView.node);
		super.removeNodeView(nodeView);
	}
}

@autobind
export class ModuleNodesView extends NodesView {
	module: ModuleViewModel;

	constructor(config: Config, module: ModuleViewModel, svg, w, h) {
		super(config, svg, w, h);
		this.module = module;
		this.module.nodeViewModels.forEach(vm => {
			let v;
			if (vm.node.type == 'And') v = new AndView(config, this, vm);
			if (vm.node.type == 'PackageInput') v = new PackageInputView(config, this, vm as NodeViewModel<PackageInput>);
			if (vm.node.type == 'PackageOutput') v = new PackageOutputView(config, this, vm as NodeViewModel<PackageOutput>);
			this.addNodeView(v);
		});

		// 導線描画
		this.nodeViews.forEach(v => v.drawWires());
	}

	addNodeView(nodeView: NodeView) {
		this.module.node.nodes.add(nodeView.node);
		super.addNodeView(nodeView);
	}

	removeNodeView(nodeView: NodeView) {
		this.module.removeNode(nodeView);
		super.removeNodeView(nodeView);
	}
}