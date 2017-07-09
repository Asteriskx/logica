import NodeTag from '../node';

export default class LedTag extends NodeTag {
	constructor(draw, tags, node) {
		super(draw, tags, node);

		const led = this.el.rect(48, 48).move(8, 8).fill('#0c1319').radius(2);

		node.on('input-updated', state => {
			led.fill(state ? '#efcb34' : '#0c1319');
		});
	}
}
